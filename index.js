require('dotenv').config();
const Telegram = require('node-telegram-bot-api');
const templates = require('./templates');
const app = require('./funcs.js')
const fs = require('fs');
const forms = require('./forms');

const TOKEN = process.env.TOKEN;
const bot = new Telegram(TOKEN, {
    polling : true
})

class User {
    constructor(){
        this.name = '';
        this.chat_id = '';
        this.channel_id = '';
        
        // post message_id
        this.posts = [];

    }
}

setAllUsers();
let users = new Set();


bot.onText(/\/start/, msg => {
    let chatId = msg.chat.id;
    let name = msg.chat.first_name;

    if(isNewUser(chatId)){
        console.log('new User');
        let user = new User();
        user.chat_id = chatId;
        user.name = name;
        addNewUser(user);

    }

    mainMenu(chatId);
})

function mainMenu(chatId) {
    let user = app.getUser(chatId, users);
    console.log(user)
    let message = templates.mainMenu(user.name, user.channel_id);
    let form = forms.mainMenu();

    bot.sendMessage(chatId, message, {
        reply_markup : form
    });
    setChannelId(chatId)
}

function setChannelId (chatId, entryMessageId) {
    let user = app.getUser(chatId, users);
    let message = templates.setChannel();

    if(entryMessageId){
        bot.editMessageText(message, {
            chat_id : chatId,
            message_id : entryMessageId
        })
    }else{
        bot.sendMessage(chatId, message);
    }


}

bot.on('callback_query', msg => {
    console.log(msg);

    bot.answerCallbackQuery(msg.id)
})

function setAllUsers(){
    fs.readFile('users.json', (err, data) => {
        let a =JSON.parse(data.toString());
        users = new Set(a.allUsers);
    })
}

function isNewUser(chat_id){
    return app.getUser(chat_id, users) === null;
}
function addNewUser(user){
    users.add(user);
    
    let data = {
        allUsers : [... users]
    }

    console.log(JSON.stringify(data))

    fs.writeFile('./users.json', JSON.stringify(data), err => {
        console.log(err)
    });

}