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

const Status = {
    ADD_CHANNEL : 'addchannel',
    NONE : 'none'
}

class User {
    constructor(){
        this.name = '';
        this.chat_id = '';
        this.channel_id = '';
        this.status = '';
        
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

bot.on('message', msg => {
    console.log(msg)
    const chatId = msg.chat.id;
    const user = app.getUser(chatId, users);

    switch(user.status){
        case Status.ADD_CHANNEL:
            let channel_id = msg.text;
            user.channel_id = channel_id;
            user.status = Status.NONE;
            updateUsersInfoInFile();
            mainMenu(chatId);
            break;

            case Status.NONE:
                sendNewPost(chatId);
                break;

    }
})

function sendNewPost(chat_id, content){
    console.log('sending new post')

}

function mainMenu(chatId) {
    let user = app.getUser(chatId, users);
    console.log(user)
    let message = templates.mainMenu(user.name, user.channel_id);
    let form = forms.mainMenu();

    bot.sendMessage(chatId, message, {
        reply_markup : form
    });
}

function setChannelId (chatId, entryMessageId) {
    let user = app.getUser(chatId, users);
    let message = templates.setChannel();

    user.status = Status.ADD_CHANNEL;


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
    const chat_id = msg.message.chat.id;
    
    const message_id = msg.message.message_id;
    const data = JSON.parse(msg.data);

    switch(data.type){
        case forms.callback_type.SET_CHANNEL : 
            setChannelId(chat_id, message_id);
        break;
    }

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
    updateUsersInfoInFile();
    
}

function updateUsersInfoInFile(){
    let data = {
        allUsers : [... users]
    }

    fs.writeFile('./users.json', JSON.stringify(data), err => {
        console.log(err)
    });
}