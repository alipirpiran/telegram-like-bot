require('dotenv').config();
const Telegram = require('node-telegram-bot-api');
const templates = require('./templates');
const app = require('./funcs.js')

const TOKEN = process.env.TOKEN;
const bot = new Telegram(TOKEN, {
    polling : true
})

class User {
    constructor(){
        this.name;
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
    mainMenu(chatId);
})

function mainMenu(chatId) {
    // let user = app.getUser(chatId, getAllUsers());
    let user = new User();
    let message = templates.mainMenu(user.name, user.channel_id);
    let form;

    bot.sendMessage(chatId, message, form);
}

function getAllUsers(){

}