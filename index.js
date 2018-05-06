'use strict';
const BootBot = require('bootbot');
const texts = require('./texts/common');
const fs = require('fs');
const { authorize } = require('./googleAuthorization');
const { getRows, getAllRows, addRow, updateRow } = require('./googleQueris');
const Moment = require('moment');
const MomentRange = require('moment-range');
const _ = require('lodash');
const moment = MomentRange.extendMoment(Moment);
const responses = require('./texts/responses');

const bot = new BootBot({
    accessToken: process.env['FB_ACCESS_TOKEN'],
    verifyToken: process.env['FB_VERIFY_TOKEN'],
    appSecret: process.env['FB_APP_SECRET']
});

const ranges = [
    [10, 12],
    [13, 16],
    [16, 19]
];

function getDates() {
    const time = moment(new Date()).format();
    let firstDay, secondDay;
    switch (moment(time).isoWeekday()) {
        case 4:
            firstDay = moment(time).add(1, 'day').format('DD/MM/YYYY');
            secondDay = moment(time).add(4, 'day').format('DD/MM/YYYY');
            break;
        case 5:
            firstDay = moment(time).add(3, 'day').format('DD/MM/YYYY');
            secondDay = moment(time).add(4, 'day').format('DD/MM/YYYY');
            break;
        case 6:
            firstDay = moment(time).add(2, 'day').format('DD/MM/YYYY');
            secondDay = moment(time).add(3, 'day').format('DD/MM/YYYY');
            break;
        default:
            firstDay = moment(time).add(1, 'day').format('DD/MM/YYYY');
            secondDay = moment(time).add(2, 'day').format('DD/MM/YYYY');
            break;
    }
    return [firstDay, secondDay];
}

function makeMinutes(convo, i, type) {
    const from = moment(ranges[i][0].toString(), 'h').format();
    const till = moment(ranges[i][1].toString(), 'h').format();
    const range = moment.range(from, till);
    const hours = Array.from(range.by('minutes', { step: 30 })).map(one => one.format('HH:mm'));

    return new Promise((resolve, reject) => {
        if (type) {
            return resolve(hours)
        }

        fs.readFile('client_secret.json', (err, content) => {
            if (err) {
                console.log('Error loading client secret file: ' + err);
                return;
            }

            // Authorize a client with the loaded credentials, then call the Google Sheets API.
            authorize(JSON.parse(content))
                .then(doc => {
                    getRows(doc, convo.get('day'), 'fb_token')
                        .then(doc => {
                            _.each(doc, one => {
                                const found = _.find(hours, two => one === two);
                                if (found) {
                                    hours.splice(hours.indexOf(found), 1);
                                }
                            });
                            return resolve(hours);
                        })
                        .catch(console.error)
                })
                .catch(console.error)
        });
    });

}

bot.setGetStartedButton((payload, chat) => {
  const options = { typing: true };
  chat.say({
	text: texts.activation,
	quickReplies: ['/start']
  }, options);
});

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
    const date = getDates();
    convo.ask((convo)=>{
    const buttons = [
      { type: 'postback', title:date[0], payload: 'FIRST_DAY'},
      { type: 'postback', title:date[1], payload: 'SECOND_DAY'},
    ];
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


const askTime = async (convo) => {
    convo.sendTypingIndicator(1000).then(convo.ask(
  {
     text: texts.chooseRange,
      quickReplies: await makeMinutes(convo, convo.get('dayHalf'))
  }, (payload, convo, data) => {
    convo.say(`Необходимо нажать на одну из кнопок!`).then(() => askTime(convo));
  },[
    {
        event:'quick_reply',
        callback: (quick_reply) =>{

            fs.readFile('client_secret.json', (err, content) => {
                if (err) {
                    console.log('Error loading client secret file: ' + err);
                    return;
                }

                // Authorize a client with the loaded credentials, then call the Google Sheets API.
                authorize(JSON.parse(content))
                    .then(doc => {
                        getAllRows(doc)
                            .then(data => {
                                const array = [];
                                let index = 0;
                                for (let i = 1; i < data.length; i++) {
                                    let row = data[i];
                                    if (quick_reply.sender.id.toString() === row[9]) {
                                        index = ++i;
                                        array.push(row);
                                    }
                                }
                                if (_.isEmpty(array)) {
                                  chat.getUserProfile().then((user) => {
                                    const name = `${user.first_name}, ${user.last_name}`
                                    addRow(doc,
                                      [convo.get('day'),
                                          quick_reply.message.text, null,
                                            name,
                                            convo.get('number'), null, null, 'в процессе', null,
                                        quick_reply.sender.id,
                                        'fb_token']
                                    )
                                    .then(doc => {
                                        convo.say(`Отлично!`).then(() => {
                                            convo.say(`Вот что мне удалось собрать
- Твой телевой:  ${convo.get('number')}
- День встречи:  ${convo.get('day')}
- И точное время:  ${quick_reply.message.text}`);
                                            });
                                            convo.end();
                                        });
                                      })
                                        .catch(console.error);
                                    return;
                                }
                                chat.getUserProfile().then((user) => {
                                const name = `${user.first_name}, ${user.last_name}`
                                updateRow(doc,
                                    [ convo.get('day'),
                                        quick_reply.message.text, null,
                                        name,
                                        convo.get('number'), null, null, 'в процессе', null,
                                        quick_reply.sender.id,
                                        'fb_token']
                                    , `A${index}:K${index}`)
                                    .then(doc => {
                                        convo.say(`Отлично!`).then(() => {
                                            convo.say(`Вот что мне удалось собрать
- Твой телевой:  ${convo.get('number')}
- День встречи:  ${convo.get('day')}
- И точное время:  ${quick_reply.message.text}`);
                                        });
                                        convo.end();
                                    })
                                    .catch(console.error);
                                  });
                            });


                    })
                    .catch(console.error)
            });
//           convo.set('time', quick_reply.message.text);
//           convo.say(`Отлично!`).then(() => {
//             convo.say(`Вот что мне удалось собрать
// - Твой телевой:  ${convo.get('number')}
// - День встречи:  ${convo.get('day')}
// - Половину дня встречи:  ${convo.get('dayHalf')==1?'День':'Вечер'}
// - И точное время:  ${convo.get('time')}`);
//           })
//           convo.end()
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
