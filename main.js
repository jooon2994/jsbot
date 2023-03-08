const TelegramBot = require('node-telegram-bot-api');
const token = '5955811266:AAFBG7IcIH79BngRsxbKqyPr356KNwBq_7E';
const bot = new TelegramBot(token, { polling: true });

let users = {};

bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  if (msg.text === '/start' || msg.text === 'Order Again') {
    bot.sendMessage(chatId, `Welcome to J Printing Service Bot! Please send a file in doc or pdf format.`);
  }

  if (msg.document) {
    const fileName = msg.document.file_name;
    const fileType = fileName.split('.').pop();

    if (fileType === 'doc' || fileType == 'docx' || fileType === 'pdf') {
      bot.sendMessage(chatId, 'Thanks for sending the file! Please share your phone number for the sake of delivery service by clicking the button below.', {
        reply_markup: {
          keyboard: [[{
            text: 'Share my phone number',
            request_contact: true
          }]],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
      if (msg.text && !msg.contact && !msg.document && !msg.photo) {
        bot.sendMessage(chatId, 'Please send a file in doc or pdf format and share your phone number before you type additional message.');
      }
    } else {
      bot.sendMessage(chatId, 'Please send a file in doc or pdf format.');
    }
  }

  if (msg.contact) {
    users[chatId] = msg.contact.phone_number;
    bot.sendMessage(chatId, `Thanks for sharing your phone number! Please provide additional information about your print job (color and type of paper). If you don't want to provide this information, click the "Skip" button.`, {
      reply_markup: {
        keyboard: [[{
          text: 'Skip'
        }]],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });

    bot.forwardMessage(1241311689, msg.chat.id, msg.message_id);
  }

  if (msg.text && msg.text.toLowerCase() !== 'skip' && msg.text.toLowerCase() !== '/start' && msg.text.toLowerCase() !== 'order again') {
    if (!users[chatId]) {
      bot.sendMessage(chatId, 'Please send your file in doc or pdf format and share your phone number before typing additional messages.');
      return;
    }
    bot.sendMessage(chatId, 'Your additional message has been recorded and order confirmed! Your paper will be delivered to your door by tomorrow morning. If your paper does not arrive or to make sure of your order, \n 👉🏿 +251940405038 or +251799445038.');

    // Forward the received file, phone number, and additional information to the provided chat ID
    bot.forwardMessage(1241311689, msg.chat.id, msg.message_id);

  }

  if (msg.text && (msg.text.toLowerCase() === 'skip' || msg.text.toLowerCase() === 'order again')) {
    if (!users[chatId]) {
      bot.sendMessage(chatId, 'Please share your phone number before typing additional messages.');
      return;
    }
    bot.sendMessage(chatId, 'Your order has been confirmed. Your paper will be delivered to your door by tomorrow morning. If your paper does not arrive or to make sure of your order, \n 👉🏿 +251940405038 or +251799445038. ');
    if (msg.document) {
      bot.downloadFile(msg.document.file_id, './').then((filePath) => {
        bot.sendDocument(chatId, filePath, { caption: `File received from ${msg.from.first_name}. Comment: ${msg.text}` });
      });
    }
    // Forward the received file and phone number to the provided chat ID
    bot.forwardMessage(1241311689, msg.chat.id, msg.message_id, msg.document);
}
});

bot.on('document', (msg) => {
bot.downloadFile(msg.document.file_id, './')
  .then((filePath) => {
    bot.sendDocument(1241311689, filePath, { caption: `File received from ${msg.from.first_name}` })
      .then(() => {
        // Send the "File received successfully" message if they only send a file in pdf and doc format 
        if (msg.document.file_name.split('.').pop() === 'pdf' || msg.document.file_name.split('.').pop() === 'docx') {
          bot.sendMessage(1241311689, 'File received successfully!');
        } 
      })
      .catch((err) => {
        bot.sendMessage(msg.chat.id, `Error forwarding file: ${err}`);
      });

})});
