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
    NONE: 'none',
    SET_LIKE_STR: 'setlikestr'
};

class PostID {
    constructor(chat_id, message_id) {
        this.chat_id = chat_id;
        this.message_id = message_id;
    }
}

class Post {
    constructor() {
        /*
           array of postId s
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
        this.likeString = '❤️';

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

    console.log(msg)

    if (msg.text) {
        if (msg.text.charAt(0) === '/') return;
    }

    if (!user) {
        console.log('new user');
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
            updateUserInfoInFile(user);
            mainMenu(chatId);
            break;

        case Status.NONE:
            if (!user.channel_id) {
                setChannelId(chatId);
                break;
            }
            sendNewPost(msg);
            break;

        case Status.SET_LIKE_STR:
            user.likeString = msg.text;
            user.status = Status.NONE;
            updateUserInfoInFile(user)
            mainMenu(user.chat_id)
        break;
    }
});

function sendNewPost(msg) {
    const chat_id = msg.chat.id;
    const admin = app.getUser(chat_id, users);
    let form = forms.sendPost(admin.likeString);
    const callback = msg => {
        addNewPostToUser(chat_id, msg);
    };

    sendAllTypesMessages(chat_id, msg, form, callback);
}

function addNewPostToUser(chat_id, msg) {
    let admin = app.getUser(chat_id, users);
    let post = new Post();
    let postId = new PostID(chat_id, msg.message_id);
    post.ids.push(postId);
    post.type = app.getMessageType(msg);
    post.message = msg;
    admin.posts.push(post);
}

function likePost(chat_id, message_id, user_id) {
    const admin = app.getUser(chat_id, users);
    const post = app.getPost(admin.channel_id, message_id, admin.posts);

    if (!post) {
        return;
    }

    for (const user of post.membersWhoLikes) {
        if (user === user_id) {
            changeLikes(post, user_id, -1, chat_id);
            return;
        }
    }
    changeLikes(post, user_id, +1, chat_id);
}

function changeLikes(post, user_id, val, adminChatId) {
    const admin = app.getUser(adminChatId, users);

    if (val === 1) {
        post.membersWhoLikes.push(user_id);
        post.likes++;
    } else if (val === -1) {
        post.membersWhoLikes.pop(user_id);
        post.likes--;
    }

    const form = forms.likeBtn(`${admin.likeString} ${post.likes}`, adminChatId);

    for (const { chat_id, message_id } of post.ids) {
        bot.editMessageReplyMarkup(form, {
            chat_id,
            message_id
        });
    }
    updateUserInfoInFile(app.getUser(adminChatId, users));
}

function mainMenu(chatId) {
    let user = app.getUser(chatId, users);
    let message = templates.mainMenu(user.name, user.channel_id);
    let form = forms.mainMenu(user);

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
            setChannelId(chat_id);
            break;

        case forms.callback_type.LIKE:
            // data.data is the chat id of admin
            likePost(data.data, message_id, msg.from.id);
            break;

        case forms.callback_type.SEND:
            sendPostToChannel(chat_id, message_id);
            break;

        case forms.callback_type.LIKE_SET:
            setLikeString(chat_id);
            break;
    }

    bot.answerCallbackQuery(msg.id);
});

function setLikeString(chat_id, entryMessageId) {
    const user = app.getUser(chat_id, users);
    user.status = Status.SET_LIKE_STR;

    const message = `
    متن دکمه لایک را ارسال کنید
    برای مثال : ❤️ 👍🏾

`;
    if (entryMessageId) {
    } else {
        bot.sendMessage(chat_id, message);
    }
}

function sendPostToChannel(chat_id, message_id) {
    const admin = app.getUser(chat_id, users);
    const post = app.getPost(chat_id, message_id, admin.posts);
    const form = forms.likeBtn(`${admin.likeString} ${post.likes}` , chat_id);
    const callback = msg => {
        let postId = new PostID(admin.channel_id, msg.message_id);
        post.ids.push(postId);
    };

    sendAllTypesMessages(admin.channel_id, post.message, form, callback);

    updateUserInfoInFile(admin);
}

function sendAllTypesMessages(chat_id, msg, form, callback) {
    const caption = msg.caption;

    switch (app.getMessageType(msg)) {
        case app.MessageType.TEXT:
            bot.sendMessage(chat_id, msg.text, {
                reply_markup: form
            }).then(callback);
            break;

        case app.MessageType.audio:
            bot.sendAudio(chat_id, msg.audio.file_id, {
                reply_markup: form,
                caption
            }).then(callback);
            break;

        case app.MessageType.PHOTO:
            bot.sendPhoto(chat_id, msg.photo[0].file_id, {
                reply_markup: form,
                caption
            }).then(callback);
            break;

        case app.MessageType.video:
            bot.sendVideo(chat_id, msg.video.file_id, {
                reply_markup: form,
                caption
            }).then(callback);
            break;

        case app.MessageType.voice:
            bot.sendVoice(chat_id, msg.voice.file_id, {
                reply_markup: form,
                caption
            }).then(callback);
            break;
    }
}

function setAllUsers() {
    fs.readdir('./users/', (err, files) => {
        if (err) {
            console.log(err);
            return;
        }
        for (const fileName of files) {
            fs.readFile('users/' + fileName, (err, data) => {
                if (err) {
                    // console.log(err);
                    return;
                }
                const user = JSON.parse(data);
                users.add(user);
            });
        }
    });
}

function isNewUser(chat_id) {
    return app.getUser(chat_id, users) === null;
}

function addNewUser(user) {
    users.add(user);
    updateUserInfoInFile(user);
}

function updateUserInfoInFile(user) {
    fs.writeFileSync('./users/' + user.chat_id, JSON.stringify(user));
}
