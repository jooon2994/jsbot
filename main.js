const TeleBot = require('telebot');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const bot = new TeleBot({
    token: process.env.BOT_TOKEN,
});

bot.on(['/start', '/help'], (msg) => {
    const text = "Welcome to J printing service! Please send your file in PDF or DOC format.";
    bot.sendMessage(msg.chat.id, text);
});

bot.on('document', (msg) => {
    const chatId = msg.chat.id;
    const fileId = msg.document.file_id;
    const fileCaption = msg.document.caption;
    const fileName = msg.document.file_name;
    const fileSize = msg.document.file_size;

    const text = "Thank you for sending your file. Please send your phone number for delivery.";
    bot.sendMessage(chatId, text).then(() => {
        bot.once('text', (msg) => {
            const phoneNumber = msg.text;
            const orderNumber = Math.floor(Math.random() * 1000000) + 1;
            const orderText = `Order No: ${orderNumber}\n\n`;
            const deliveryText = `We'll deliver to you by tomorrow morning.\n\n`;
            const contactText = `For more info call 0940405038.\n\n`;
            const orderCompleteText = `${orderText}${fileCaption ? fileCaption+'\n\n' : ''}${deliveryText}${contactText}`;

            bot.sendMessage(chatId, orderCompleteText);

            // Forward the document to your Telegram account
            const fileStream = bot.getFileStream(fileId);
            const form = new FormData();
            form.append('document', fileStream);
            form.append('caption', orderCompleteText);
            axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendDocument?chat_id=${process.env.TELEGRAM_ACCOUNT_ID}`, form, {
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${form._boundary}`,
                },
            }).then(() => {
                console.log(`Document forwarded to Telegram account: ${fileName}`);
            }).catch((error) => {
                console.error(`Error forwarding document to Telegram account: ${error.message}`);
            });

            // Save the document to the server
            const filePath = `./uploads/${fileName}`;
            bot.downloadFile(fileId, filePath).then(() => {
                console.log(`Document saved to server: ${fileName}`);
            }).catch((error) => {
                console.error(`Error saving document to server: ${error.message}`);
            });
        });
    });
});

bot.start();
