require('dotenv').config();
const Telegram = require('node-telegram-bot-api');
const templates = require('./templates');
const app = require('./funcs.js');
const fs = require('fs');
const forms = require('./forms');

const TOKEN = process.env.TOKEN;
const bot = new Telegram(TOKEN, {
    polling: true
});

const Status = {
    ADD_CHANNEL: 'addchannel',
    NONE: 'none'
};

class Post {
    constructor() {
        // messages ids
        /*
            todo :
            post ids : {
                chat instance id : ...
                message id : ...
            }
        */
        this.ids = [];

        // users ids
        this.membersWhoLikes = [];

        this.likes = 0;
        this.type = '';
        this.message;
    }
}

class User {
    constructor() {
        this.name = '';
        this.chat_id = '';
        this.channel_id = '';
        this.status = Status.NONE;

        // post message_id
        this.posts = [];
    }
}

setAllUsers();
let users = new Set();

bot.onText(/\/start/, msg => {
    let chatId = msg.chat.id;
    let name = msg.chat.first_name;

    if (isNewUser(chatId)) {
        console.log('new User');
        let user = new User();
        user.chat_id = chatId;
        user.name = name;
        addNewUser(user);
    }

    mainMenu(chatId);
});

bot.on('message', msg => {
    const chatId = msg.chat.id;
    let name = msg.chat.first_name;
    let user = app.getUser(chatId, users);

    if (!user) {
        user = new User();
        user.chat_id = chatId;
        user.name = name;
        addNewUser(user);
    }

    switch (user.status) {
        case Status.ADD_CHANNEL:
            let channel_id = msg.text;
            user.channel_id = channel_id;
            user.status = Status.NONE;
            updateUsersInfoInFile();
            mainMenu(chatId);
            break;

        case Status.NONE:
            if (!user.channel_id) {
                setChannelId(chatId);
                break;
            }
            sendNewPost(msg);
            break;
    }
});

function sendNewPost(msg) {
    const chat_id = msg.chat.id;
    const caption = msg.caption;
    const admin = app.getUser(chat_id, users);
    let form = forms.sendPost('like');

    switch (app.getMessageType(msg)) {
        case app.MessageType.TEXT:
            bot.sendMessage(chat_id, msg.text, {
                reply_markup: form
            }).then(msg => {
                let post = new Post();
                post.message = msg;
                post.type = app.MessageType.TEXT;
                post.ids.push(msg.message_id);
                admin.posts.push(post);
            });
            break;

        case app.MessageType.audio:
            break;

        case app.MessageType.PHOTO:
            bot.sendPhoto(chat_id, msg.photo[0].file_id, {
                reply_markup: form,
                caption
            }).then(msg => {
                let post = new Post();
                post.ids.push(msg.message_id);
                post.type = app.MessageType.PHOTO;
                post.message = msg;
                admin.posts.push(post);
            });
            break;

        case app.MessageType.video:
            break;

        case app.MessageType.voice:
            break;
    }
}

function likePost(chat_id, message_id, user_id) {
    const admin = app.getUser(chat_id, users);
    const post = app.getPost(message_id, admin.posts);
    const channel_id = admin.channel_id;

    console.log(post)

    if (!post) {
        return;
    }

    for (const user of post.membersWhoLikes) {
        if (user === user_id) {
            changeLikes(channel_id, post, user_id, -1, chat_id);
            return;
        }
    }
    changeLikes(channel_id, post, user_id, +1, chat_id);
}

function changeLikes(chat_id, post, user_id, val, adminChatId) {
    if (val === 1) {
        post.membersWhoLikes.push(user_id);
        post.likes++;
    } else if (val === -1) {
        post.membersWhoLikes.pop(user_id);
        post.likes--;
    }

    const form = forms.likeBtn('like ' + post.likes, adminChatId);

    for (const msgId of post.ids) {
        bot.editMessageReplyMarkup(form, {
            chat_id,
            message_id: msgId
        });
    }
}

function mainMenu(chatId) {
    let user = app.getUser(chatId, users);
    let message = templates.mainMenu(user.name, user.channel_id);
    let form = forms.mainMenu();

    bot.sendMessage(chatId, message, {
        reply_markup: form
    });
}

function setChannelId(chatId, entryMessageId) {
    let user = app.getUser(chatId, users);
    let message = templates.setChannel();

    user.status = Status.ADD_CHANNEL;

    if (entryMessageId) {
        bot.editMessageText(message, {
            chat_id: chatId,
            message_id: entryMessageId
        });
    } else {
        bot.sendMessage(chatId, message);
    }
}

bot.on('callback_query', msg => {
    const chat_id = msg.message.chat.id;
    
    const message_id = msg.message.message_id;
    const data = JSON.parse(msg.data);

    switch (data.type) {
        case forms.callback_type.SET_CHANNEL:
            setChannelId(chat_id, message_id);
            break;

        case forms.callback_type.LIKE:
            // data.data is the chat id of admin
            likePost(data.data, message_id, msg.from.id);
            break;

        case forms.callback_type.SEND:
        
            sendPostToChannel(chat_id, message_id);
            break;
    }

    bot.answerCallbackQuery(msg.id);
});

function sendPostToChannel(chat_id, message_id) {
    const admin = app.getUser(chat_id, users);
    const post = app.getPost(message_id, admin.posts);
    const form = forms.likeBtn('like ' + post.likes, chat_id);

    switch (post.type) {
        case app.MessageType.TEXT:
            bot.sendMessage(admin.channel_id, post.message.text, {
                reply_markup: form
            }).then(msg => {
                post.ids.push(msg.message_id)
                console.log(post)
            });
            break;
    }

}

function setAllUsers() {
    fs.readFile('users.json', (err, data) => {
        let a = JSON.parse(data.toString());
        users = new Set(a.allUsers);
    });
}

function isNewUser(chat_id) {
    return app.getUser(chat_id, users) === null;
}

function addNewUser(user) {
    users.add(user);
    updateUsersInfoInFile();
}

function updateUsersInfoInFile() {
    let data = {
        allUsers: [...users]
    };

    fs.writeFile('./users.json', JSON.stringify(data), err => {
        console.log(err);
    });
}
