const TeleBot = require('telebot');

const bot = new TeleBot({
    token: '5955811266:AAFBG7IcIH79BngRsxbKqyPr356KNwBq_7E'
});

bot.on(['/start', '/help'], (msg) => {
    const text = "Welcome to J printing service! Please send your file in PDF or DOC format.";
    bot.sendMessage(msg.chat.id, text);
});
bot.on('document', (msg) => {
    const fileId = msg.document.file_id;
    const text = "Thank you for sending your file. Please send your phone number for delivery.";
    bot.sendMessage(msg.chat.id, text).then(() => {
        bot.once('text', (msg) => {
            const phoneNumber = msg.text;
            const orderNumber = Math.floor(Math.random() * 1000000) + 1;
            const text = `Your order (${orderNumber}) has been received. Your paper will be delivered to you by tomorrow morning. Thank you for choosing J printing service!`;
            bot.sendMessage(msg.chat.id, text);
            // Send the file to your Telegram account
            bot.sendDocument(1241311689, fileId).then(() => {
                const deliveryText = `Your order (${orderNumber}) has been processed and will be delivered to you by tomorrow morning. For more information, please call 0940405038.`;
                bot.sendMessage(msg.chat.id, deliveryText);
            });
        });
    });
});


bot.start();
