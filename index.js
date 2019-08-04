require('dotenv').config();
const Telegram = require('node-telegram-bot-api');
const {mainMenu} = require('./templates');

const TOKEN = process.env.TOKEN;
const bot = new Telegram(TOKEN, {
    polling : true
})

class User {
    constructor(){
        this.chat_id;
        this.channel_id;
        
        // post message_id
        this.posts = [];

    }
}


bot.onText(/\/start/, msg => {
    let chatId = msg.chat.id;
    // bot.sendMessage(chatId, 'received')

    // show main menu
})