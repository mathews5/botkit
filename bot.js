/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack bot built with Botkit.

This bot demonstrates many of the core features of Botkit:

* Connect to Slack using the real time API
* Receive messages based on "spoken" patterns
* Reply to messages
* Use the conversation system to ask questions
* Use the built in storage system to store and retrieve information
  for a user.

# RUN THE BOT:

  Get a Bot token from Slack:

    -> http://my.slack.com/services/new/bot

  Run your bot from the command line:

    token=<MY TOKEN> node bot.js

# USE THE BOT:

  Find your bot inside Slack to send it a direct message.

  Say: "Hello"

  The bot will reply "Hello!"

  Say: "who are you?"

  The bot will tell you its name, where it running, and for how long.

  Say: "Call me <nickname>"

  Tell the bot your nickname. Now you are friends.

  Say: "who am I?"

  The bot will tell you your nickname, if it knows one for you.

  Say: "shutdown"

  The bot will ask if you are sure, and then shut itself down.

  Make sure to invite your bot into other channels using /invite @<my bot>!

# EXTEND THE BOT:

  Botkit is has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


// if (!process.env.token) {
//     console.log('Error: Specify token in environment');
//     process.exit(1);
// }

var Botkit = require('./lib/Botkit.js');
var os = require('os');

var controller = Botkit.facebookbot({
    debug: true,
    access_token: 'CAAXyynmDLlIBAPQtDiOEUEsrDEX1DdQ0uVMRMjf9uzOaClZBj8ZAEduy2wDmKyYpEjqzRKEKeW4BUoSfsPChjFWXZABMNsKUkO1DDBxXqQPkD8CrGnyLwnbdfOqyNdzSEgIaOO94FfoSDPgpvlZCgKf3jPbAOyP3LwpFkBHB96HuLNZADhSlF2QE6jai72LgziwRDn0IZBvwZDZD',
    verify_token: '1234',
});

var bot = controller.spawn({
//    token: process.env.token
});

controller.setupWebserver(3002, function(err,webserver) {

    controller.createWebhookEndpoints(webserver, bot, function() {

        console.log('ONLINE!');

    });
});


controller.on('message_received', function(bot, message) {
	console.log('RECEIVED ',message);
});

controller.hears(['hello','hi'],'message_received',function(bot, message) {


    controller.storage.users.get(message.user,function(err, user) {
        if (user && user.name) {
            bot.reply(message,'Hello ' + user.name + '!!');
        } else {
            bot.reply(message,'Hello.');
        }
    });
});


controller.hears(['structured'],'message_received',function(bot, message) {

    bot.reply(message, {
        attachment: {
            'type':'template',
            'payload':{
                 'template_type':'generic',
                 'elements':[
                   {
                     'title':'Classic White T-Shirt',
                     'image_url':'http://petersapparel.parseapp.com/img/item100-thumb.png',
                     'subtitle':'Soft white cotton t-shirt is back in style',
                     'buttons':[
                       {
                         'type':'web_url',
                         'url':'https://petersapparel.parseapp.com/view_item?item_id=100',
                         'title':'View Item'
                       },
                       {
                         'type':'web_url',
                         'url':'https://petersapparel.parseapp.com/buy_item?item_id=100',
                         'title':'Buy Item'
                       },
                       {
                         'type':'postback',
                         'title':'Bookmark Item',
                         'payload':'USER_DEFINED_PAYLOAD_FOR_ITEM100'
                       }
                     ]
                   },
                   {
                     'title':'Classic Grey T-Shirt',
                     'image_url':'http://petersapparel.parseapp.com/img/item101-thumb.png',
                     'subtitle':'Soft gray cotton t-shirt is back in style',
                     'buttons':[
                       {
                         'type':'web_url',
                         'url':'https://petersapparel.parseapp.com/view_item?item_id=101',
                         'title':'View Item'
                       },
                       {
                         'type':'web_url',
                         'url':'https://petersapparel.parseapp.com/buy_item?item_id=101',
                         'title':'Buy Item'
                       },
                       {
                         'type':'postback',
                         'title':'Bookmark Item',
                         'payload':'USER_DEFINED_PAYLOAD_FOR_ITEM101'
                       }
                     ]
                   }
                 ]
               }
        }
    });

});

controller.on('facebook_postback', function(bot, message) {

    bot.reply(message, message.payload);


});

controller.hears(['call me (.*)'],'message_received',function(bot, message) {
    var matches = message.text.match(/call me (.*)/i);
    var name = matches[1];
    controller.storage.users.get(message.user,function(err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.name = name;
        controller.storage.users.save(user,function(err, id) {
            bot.reply(message,'Got it. I will call you ' + user.name + ' from now on.');
        });
    });
});

controller.hears(['what is my name','who am i'],'message_received',function(bot, message) {

    controller.storage.users.get(message.user,function(err, user) {
        if (user && user.name) {
            bot.reply(message,'Your name is ' + user.name);
        } else {
            bot.reply(message,'I don\'t know yet!');
        }
    });
});


controller.hears(['shutdown'],'message_received',function(bot, message) {

    bot.startConversation(message,function(err, convo) {

        convo.ask('Are you sure you want me to shutdown?',[
            {
                pattern: bot.utterances.yes,
                callback: function(response, convo) {
                    convo.say('Bye!');
                    convo.next();
                    setTimeout(function() {
                        process.exit();
                    },3000);
                }
            },
        {
            pattern: bot.utterances.no,
            default: true,
            callback: function(response, convo) {
                convo.say('*Phew!*');
                convo.next();
            }
        }
        ]);
    });
});


controller.hears(['uptime','identify yourself','who are you','what is your name'],'message_received',function(bot, message) {

    var hostname = os.hostname();
    var uptime = formatUptime(process.uptime());

    bot.reply(message,':robot_face: I am a bot named <@' + bot.identity.name + '>. I have been running for ' + uptime + ' on ' + hostname + '.');

});

function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}
