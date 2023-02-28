const TelegramBot = require('node-telegram-bot-api');
const token = '5955811266:AAFBG7IcIH79BngRsxbKqyPr356KNwBq_7E'; // replace with your bot token
const chatId = '1241311689'; // replace with your Telegram account ID
const bot = new TelegramBot(token, { polling: true });

let orderNo = 0;

bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // step 1: welcome message and file request
  if (msg.text === '/start') {
    bot.sendMessage(chatId, 'Welcome to J Printing Service! Please send us your file in doc or pdf format.');
  }

  // step 2: after receiving the file, request phone number
  if (msg.document) {
    bot.sendMessage(chatId, 'Thank you for your order! Please send us your phone number  for delivery purposes.');
  }

  // step 3: send order confirmation and request forwarding
  if (msg.text && /^\d+$/.test(msg.text)) {
    orderNo++;
    bot.sendMessage(chatId, `Your order (${orderNo}) has been registered successfully. We will be at your door tomorrow morning!`);
    bot.forwardMessage(chatId, msg.chat.id, msg.message_id);
    if (msg.document) {
      bot.downloadFile(msg.document.file_id, './').then((filePath) => {
        bot.sendDocument(chatId, filePath, { caption: `File received from ${msg.from.first_name}. Comment: ${msg.caption}` });
      });
      bot.sendMessage(chatId, `Phone number: ${msg.text}`);
    }
  }
});

bot.on('document', (msg) => {
  bot.downloadFile(msg.document.file_id, './')
    .then((filePath) => {
      bot.sendDocument(chatId, filePath, { caption: `File received from ${msg.from.first_name}` })
        .then(() => {
          bot.sendMessage(msg.chat.id, '');
        })
        .catch((err) => {
          bot.sendMessage(msg.chat.id, `Error forwarding file: ${err}`);
        });
    })
    .catch((err) => {
      bot.sendMessage(msg.chat.id, `Error downloading file: ${err}`);
    });
});
