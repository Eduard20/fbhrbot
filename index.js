'use strict';
const BootBot = require('bootbot');
const texts = require('./texts/common')

const bot = new BootBot({
    accessToken: process.env['FB_ACCESS_TOKEN'],
    verifyToken: process.env['FB_VERIFY_TOKEN'],
    appSecret: process.env['FB_APP_SECRET']
});

const date = ['1.05.2018','3.05.2018']



bot.setGetStartedButton((payload, chat) => {
  const options = { typing: true };
  chat.say({
	text: texts.activation,
	quickReplies: ['/start']
  }, options);
});

//   chat.say({
//     text:'hellloooo',
//     quickReplies:[{
//       "content_type":"user_phone_number",
//     }]
//   });


const askNumber = (convo) => {
  convo.ask((convo)=>{
    const Replies = [{'content_type':'user_phone_number'}]
    convo.ask({
      text:texts.howToConnect,
      quickReplies:Replies
    },{typing:true})
  }, (payload, convo, data) => {
    const text = payload.message.text;
    convo.set('number', text);
    askFavoriteFood(convo);
  });
};

const askDay = (convo) => {
  convo.ask((convo)=>{
    const buttons = [
      { type: 'postback', title:date[0], payload: 'FIRST_DAY'},
      { type: 'postback', title:date[1], payload: 'SECOND_DAY'},
    ]
    convo.sendButtonTemplate(texts.chooseDay,buttons)
  }, (payload, convo, data) => {
    convo.say(`Необходимо нажать на одну из кнопок!`).then(() => askDay(convo));
  },[
    {
      event:'postback:FIRST_DAY',
      callback: (payload,convo) =>{
        convo.set('day', date[0]).then(()=>askDayHalf(convo));
      }
    },
    {
      event:'postback:SECOND_DAY',
      callback: (payload,convo) =>{
        convo.set('day', date[1]).then(()=>askDayHalf(convo));
      }
    }
  ]
  );
};

const askDayHalf = (convo) => {
  convo.ask((convo) => {
    const buttons = [
      { type: 'postback', title: 'Male', payload: 'GENDER_MALE' },
      { type: 'postback', title: 'Female', payload: 'GENDER_FEMALE' },
      { type: 'postback', title: 'I don\'t wanna say', payload: 'GENDER_UNKNOWN' }
    ];
    convo.sendButtonTemplate(`Are you a boy or a girl?`, buttons);
  }, (payload, convo, data) => {
    const text = payload.message.text;
    convo.set('gender', text);
    convo.say(`Great, you are a ${text}`).then(() => askAge(convo));
  }, [
      {
        event: 'postback',
        callback: (payload, convo) => {
          convo.say('You clicked on a button').then(() => askAge(convo));
        }
      },
      {
        event: 'postback:GENDER_MALE',
        callback: (payload, convo) => {
          convo.say('You said you are a Male').then(() => askAge(convo));
        }
      },
      {
        event: 'quick_reply',
        callback: () => { }
      },
      {
        event: 'quick_reply:COLOR_BLUE',
        callback: () => { }
      },
      {
        pattern: ['yes', /yea(h)?/i, 'yup'],
        callback: () => {
          convo.say('You said YES!').then(() => askAge(convo));
        }
      }
    ]);
};

const askAge = (convo) => {
  convo.ask(`Final question. How old are you?`, (payload, convo, data) => {
    const text = payload.message.text;
    convo.set('age', text);
    convo.say(`That's great!`).then(() => {
      convo.say(`Ok, here's what you told me about you:
      - Name: ${convo.get('name')}
      - Favorite Food: ${convo.get('food')}
      - Gender: ${convo.get('gender')}
      - Age: ${convo.get('age')}
      `);
      convo.end();
    });
  });
};

bot.hear('/start', (payload, chat) => {
  chat.conversation((convo) => {
    convo.sendTypingIndicator(1000).then(() => askNumber(convo));
  });
});

bot.hear('color', (payload, chat) => {
  chat.say({
    text: 'Favorite color?',
    quickReplies: ['Red', 'Blue', 'Green']
  });
});

bot.hear('button', (payload, chat) => {
  chat.say({
    text: 'Select a button',
    buttons: ['Male', 'Female', `Don't wanna say`]
  });
});

bot.hear('convo', (payload, chat) => {
  chat.conversation(convo => {
    convo.ask({
      text: 'Favorite color?',
      quickReplies: ['Red', 'Blue', 'Green']
    }, (payload, convo) => {
      const text = payload.message.text;
      convo.say(`Oh your favorite color is ${text}, cool!`);
      convo.end();
    }, [
        {
          event: 'quick_reply',
          callback: (payload, convo) => {
            const text = payload.message.text;
            convo.say(`Thanks for choosing one of the options. Your favorite color is ${text}`);
            convo.end();
          }
        }
      ]);
  });
});


bot.start(parseInt(process.env.PORT, 10) || 3000);
