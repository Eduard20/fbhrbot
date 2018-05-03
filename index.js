'use strict';
const BootBot = require('bootbot');
const texts = require('./texts/common')

const bot = new BootBot({
    accessToken: process.env['FB_ACCESS_TOKEN'],
    verifyToken: process.env['FB_VERIFY_TOKEN'],
    appSecret: process.env['FB_APP_SECRET']
});

const date = ['1.05.2018','3.05.2018']
const time = ['13:00','13:20','13:40','14:00','14:20','14:40','15:00','15:20','15:40','16:00']



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
  convo.ask(
    {
      text:texts.howToConnect,
      quickReplies:[{
        "content_type":"user_phone_number",
      }]
    }, (payload, convo, data) => {
    const text = payload.message.text;
    convo.set('number', text);
    askDay(convo);
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
  },[{
      event:'postback:FIRST_DAY',
      callback: (payload,convo) =>{
        convo.set('day', date[0]);
        askDayHalf(convo);
      }
    },
    {
      event:'postback:SECOND_DAY',
      callback: (payload,convo) =>{
        convo.set('day', date[1]);
        askDayHalf(convo);
      }
    }
  ]);
};

const askDayHalf = (convo) => {
  convo.ask((convo) => {
    const buttons = [
      { type: 'postback', title: 'утро', payload: 'MORNING' },
      { type: 'postback', title: 'день', payload: 'DAY' },
      { type: 'postback', title: 'вечер', payload: 'EVENING' }
    ];
    convo.sendButtonTemplate(texts.chooseRange, buttons);
  }, (payload, convo, data) => {
    convo.say(`Необходимо нажать на одну из кнопок!`).then(() => askDayHalf(convo));
  },[{
      event:'postback:MORNING',
      callback: (payload,convo) =>{
        convo.set('dayHalf', 0);
        askTime(convo);
      }
    },
    {
        event:'postback:DAY',
        callback: (payload,convo) =>{
          convo.set('dayHalf', 1);
          askTime(convo);
        }
    },
    {
        event:'postback:EVENING',
        callback: (payload,convo) =>{
          convo.set('dayHalf', 2);
          askTime(convo);
        }
    }
  ]);
};


const askTime = (convo) => {
  convo.sendTypingIndicator(1000).then(convo.ask(
  {
     text: texts.chooseRange,
      quickReplies: time
  }, (payload, convo, data) => {
    convo.say(`Необходимо нажать на одну из кнопок!`).then(() => askTime(convo));
  },[
    {
        event:'quick_reply',
        callback: (quick_reply) =>{
          console.log(quick_reply)
          convo.set('time', quick_reply.message.text);
          convo.say(`Отлично!`).then(() => {
            convo.say(`Вот что мне удалось собрать
- Твой телевой:  ${convo.get('number')}
- День встречи:  ${convo.get('day')}
- Половину дня встречи:  ${convo.get('dayHalf')==1?'День':'Вечер'}
- И точное время:  ${convo.get('time')}`);
          })
          convo.end()
        }
    }
  ]));
};





// const askTime = (convo) => {
//   convo.ask((convo) => {
//     const buttons = [
//       { type: 'postback', title: time[0], payload: 'TIME_0' },
//       { type: 'postback', title: time[1], payload: 'TIME_1' },
//       { type: 'postback', title: time[2], payload: 'TIME_2' },
//     ];
//     convo.sendTypingIndicator(1000).then(() => convo.sendButtonTemplate(texts.chooseRange, buttons));
//   }, (payload, convo, data) => {
//     convo.say(`Необходимо нажать на одну из кнопок!`).then(() => askTime(convo));
//   },[{
//       event:'postback:TIME_0',
//       callback: (payload,convo) =>{
//         convo.set('time', time[0]);
//         convo.say(`Отлично!`).then(() => {
//           convo.say(`Вот что мне удалось собрать
// - Твой телевой:  ${convo.get('number')}
// - День встречи:  ${convo.get('day')}
// - Половину дня встречи:  ${convo.get('dayHalf')==1?'День':'Вечер'}
// - И точное время:  ${convo.get('time')}`);
//         })
//         convo.end()
//       }
//     },
//     {
//         event:'postback:TIME_1',
//         callback: (payload,convo) =>{
//           convo.set('time', time[1]);
//           convo.say(`Отлично!`).then(() => {
//             convo.say(`Вот что мне удалось собрать
// - Твой телевой:  ${convo.get('number')}
// - День встречи:  ${convo.get('day')}
// - Половину дня встречи:  ${convo.get('dayHalf')==1?'День':'Вечер'}
// - И точное время:  ${convo.get('time')}`);
//           })
//           convo.end()
//         }
//     },
//     {
//         event:'postback:TIME_2',
//         callback: (payload,convo) =>{
//           convo.set('time', time[2]);
//           convo.say(`Отлично!`).then(() => {
//             convo.say(`Вот что мне удалось собрать
// - Твой телевой:  ${convo.get('number')}
// - День встречи:  ${convo.get('day')}
// - Половину дня встречи:  ${convo.get('dayHalf')==1?'День':'Вечер'}
// - И точное время:  ${convo.get('time')}`);
//           })
//           convo.end()
//         }
//     }
//   ]);
// };



bot.hear('/start', (payload, chat) => {
  chat.conversation((convo) => {
    convo.sendTypingIndicator(1000).then(() => askNumber(convo));
  });
});

bot.on('message', (payload, chat) => {
  const text = payload.message.text;
  if (text =='/start'){
    return
  }else {
    const options = { typing: true };
    chat.say({
  	text: texts.activation,
  	quickReplies: ['/start']
    }, options);
  }
});


bot.start(parseInt(process.env.PORT, 10) || 3000);
