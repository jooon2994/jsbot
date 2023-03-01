const TelegramBot = require('node-telegram-bot-api');
const token = '5955811266:AAFBG7IcIH79BngRsxbKqyPr356KNwBq_7E';
const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  if (msg.text === '/start' || msg.text === 'Order Again') {
    bot.sendMessage(chatId, `Welcome to J Printing Service Bot! Please send a file in doc or pdf format.`);
  }

  if (msg.document) {
    const fileName = msg.document.file_name;
    const fileType = fileName.split('.').pop();

    if (fileType === 'doc' || fileType === 'pdf') {
      bot.sendMessage(chatId, 'Thanks for sending the file! Please share your phone number for the sake of delivary service by clicking the button below.', {
        reply_markup: {
          keyboard: [[{
            text: 'Share my phone number',
            request_contact: true
          }]],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
    } else {
      bot.sendMessage(chatId, 'Please send a file in doc or pdf format.');
    }
  }

  if (msg.contact) {
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
    bot.sendMessage(chatId, `Thanks for providing the additional information! Your order has been confirmed. We will forward the file, your phone number, and additional information to the provided chat ID.`);

    // Forward the received file, phone number, and additional information to the provided chat ID
    bot.forwardMessage(1241311689, msg.chat.id, msg.message_id);

    // Send the "File received successfully" message only once
    bot.sendMessage(chatId, 'File received successfully!');
  }

  if (msg.text && (msg.text.toLowerCase() === 'skip' || msg.text.toLowerCase() === 'order again')) {
    bot.sendMessage(chatId, `Your order has been confirmed. We will send the file and your phone number to our printing service.`);
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
          // Send the "File received successfully" message only once
          bot.sendMessage(msg.chat.id, 'File received successfully! We are pleased to inform you that your paper will be delivered to your door by tomorrow morning. In the unlikely event that your paper does not arrive, please do not hesitate to contact us at +251940405038 or +251799445038. Thank you for choosing our service.');
        })
        .catch((err) => {
          bot.sendMessage(msg.chat.id, `Error forwarding file: ${err}`);
        });
    })});