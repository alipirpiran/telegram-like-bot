require('dotenv').config();
const Telegram = require('node-telegram-bot-api');
const templates = require('./templates');
const app = require('./funcs.js');
const fs = require('fs');
const forms = require('./forms');

const express = require('express');
const bodyParser = require('body-parser');

const URL = process.env.URL;
const TOKEN = process.env.TOKEN;
const port = process.env.PORT || 3000;

let exp;
let bot = new Telegram(TOKEN);
if (URL) {
    bot.setWebHook(URL + '/bot' + TOKEN);
    console.log('setting webhook : ' + URL + '/' + TOKEN);

    exp = express();
    exp.use(bodyParser.json());

    exp.listen(port, () => {
        console.log(`Express server is listening on ${port}`);
    });
    exp.all(`/bot${TOKEN}`, (req, res) => {
        bot.processUpdate(req.body);
        res.sendStatus(200);
        res.end();
    });
} else {
    bot = new Telegram(TOKEN, {
        polling: true
    });

    console.log('setting polling');
}

const Status = {
    ADD_CHANNEL: 'addchannel',
    NONE: 'none',
    SET_LIKE_STR: 'setlikestr'
};

const Result = {
    USER_IS_NOT_ADMIN: 'userisnotadmin',
    BOT_IS_NOT_ADMIN: 'botisnotadmin'
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
        this.user_id = '';
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
        user.user_id = msg.from.id;
        addNewUser(user);
    }

    mainMenu(chatId);
});

bot.onText(/\/cancel/, msg => {
    let chat_id = msg.chat.id;
    let name = msg.chat.first_name;

    let user = app.getUser(chat_id, users);
    if (!user) {
        console.log('new user');
        user = new User();
        user.chat_id = chat_id;
        user.name = name;
        user.user_id = msg.from.id;
        addNewUser(user);
    }

    if (user.status === Status.ADD_CHANNEL)
        bot.sendMessage(chat_id, '✘ ثبت کانال لغو شد!').then(msg =>
            mainMenu(chat_id)
        );

    if (user.status === Status.SET_LIKE_STR)
        bot.sendMessage(chat_id, '✘ تنظیم دکمه لایک لغو شد!').then(msg =>
            mainMenu(chat_id)
        );

    if (user.status === Status.NONE)
        bot.sendMessage(chat_id, 'چیزی برای انصراف وجود ندارد !!');

    user.status = Status.NONE;
    updateUserInfoInFile(user);
});

bot.onText(/\/setting/, msg => {
    let chat_id = msg.chat.id;
    let name = msg.chat.first_name;

    let user = app.getUser(chat_id, users);
    if (!user) {
        console.log('new user');
        user = new User();
        user.chat_id = chat_id;
        user.name = name;
        user.user_id = msg.from.id;
        addNewUser(user);
    }
    user.status = Status.NONE;
    updateUserInfoInFile(user);

    mainMenu(msg.chat.id);
});

bot.onText(/\/help/, msg => {
    let chat_id = msg.chat.id;
    let name = msg.chat.first_name;

    let user = app.getUser(chat_id, users);
    if (!user) {
        console.log('new user');
        user = new User();
        user.chat_id = chat_id;
        user.name = name;
        user.user_id = msg.from.id;
        addNewUser(user);
    }
    user.status = Status.NONE;
    updateUserInfoInFile(user);

    bot.sendMessage(chat_id, templates.help);
});

bot.on('message', msg => {
    console.log(
        `Message | ${msg.from.first_name} : ${
            msg.chat.id
        }  type : ${app.getMessageType(msg)}`
    );

    const chatId = msg.chat.id;
    let name = msg.chat.first_name;
    let user = app.getUser(chatId, users);

    if (msg.text) {
        if (msg.text.charAt(0) === '/') return;
    }

    if (!user) {
        console.log('new user');
        user = new User();
        user.chat_id = chatId;
        user.name = name;
        user.user_id = msg.from.id;
        addNewUser(user);
    }

    if (!user.user_id) {
        user.user_id = msg.from.id;
        updateUserInfoInFile(user);
    }

    switch (user.status) {
        case Status.ADD_CHANNEL:
            if (!msg.text) {
                bot.sendMessage(chatId, 'ایدی کانال را ارسال کنید');
                return;
            }
            if (msg.text.charAt(0) !== '@') {
                const message = `
🔻  ایدی کانال باید با @ شروع شود !

🔸 دوباره ارسال کنید : 
                `;
                bot.sendMessage(chatId, message);
                return;
            }

            let channel_id = msg.text;
            checkAdminDoFunc(channel_id, user.user_id, chatId, () => {
                user.channel_id = channel_id;
                user.status = Status.NONE;
                updateUserInfoInFile(user);
                mainMenu(chatId);
            });
            break;
        case Status.NONE:
            if (!user.channel_id) {
                bot.sendMessage(
                    chatId,
                    '💬 شما هنوز کانال خود را ثبت نکرده اید ...'
                ).then(msg => {
                    setChannelId(chatId);
                });

                break;
            }

            sendNewPost(msg);
            break;

        case Status.SET_LIKE_STR:
            user.likeString = msg.text;
            user.status = Status.NONE;
            updateUserInfoInFile(user);
            mainMenu(user.chat_id);
            break;
    }
});

function checkAdminDoFunc(channel_id, user_id, chat_id, callback) {
    isAdminOfChannel(channel_id, user_id).then(res => {
        switch (res) {
            case Result.BOT_IS_NOT_ADMIN:
                bot.sendMessage(chat_id, templates.bot_is_not_admin);
                return;

            case Result.USER_IS_NOT_ADMIN:
                bot.sendMessage(chat_id, templates.user_is_not_admin);
                return;

            case true:
                callback();
                return;
        }
    });
}

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

function likePost(chat_id, message_id, user_id, callback_query_id) {
    const admin = app.getUser(chat_id, users);
    const post = app.getPost(admin.channel_id, message_id, admin.posts);

    if (!post) {
        return;
    }

    for (const user of post.membersWhoLikes) {
        if (user === user_id) {
            changeLikes(post, user_id, -1, chat_id, () => {
                bot.answerCallbackQuery({
                    callback_query_id,
                    text: 'رای شما پس گرفته شد !'
                });
            });
            return;
        }
    }
    changeLikes(post, user_id, +1, chat_id, () => {
        bot.answerCallbackQuery({
            callback_query_id,
            text: 'رای شما ثبت شد !'
        });
    });
}

function changeLikes(post, user_id, val, adminChatId, callback) {
    const admin = app.getUser(adminChatId, users);

    if (val === 1) {
        post.membersWhoLikes.push(user_id);
        post.likes++;
    } else if (val === -1) {
        post.membersWhoLikes.pop(user_id);
        post.likes--;
    }

    const channelForm = forms.likeBtn(
        `${admin.likeString} ${post.likes}`,
        adminChatId
    );

    const botForm = message_id => {
        return forms.sentPost(`${admin.likeString} ${post.likes}`, admin.channel_id, message_id);
    };

    for (const { chat_id, message_id } of post.ids) {
        if (chat_id == admin.channel_id)
            bot.editMessageReplyMarkup(channelForm, {
                chat_id,
                message_id
            }).then(msg => {
                callback();
            });
        else {
            bot.editMessageReplyMarkup(botForm(message_id), {
                chat_id,
                message_id
            }).then(msg => {
                callback();
            });
        }
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
    const admin = app.getUser(chat_id, users);
    // console.log(msg)

    switch (data.type) {
        case forms.callback_type.SET_CHANNEL:
            setChannelId(chat_id);
            break;

        case forms.callback_type.LIKE:
            // data.data is the chat id of admin
            likePost(data.data, message_id, msg.from.id, msg.id);
            break;

        case forms.callback_type.SEND:
            sendPostToChannel(chat_id, message_id);
            break;

        case forms.callback_type.LIKE_SET:
            setLikeString(chat_id);
            break;

        case forms.callback_type.MAIN_MENU:
            mainMenu(chat_id);
            break;

        case forms.callback_type.HELP:
            help(chat_id);
            break;

        case forms.callback_type.DELET_POST:
            // for (const pid of admin.posts) {
            //     console.log(pid.ids)
            // }
            // const post = app.getPost(admin.channel_id, data.data, admin.posts)
            deletePost(admin.channel_id, data.data, admin, msg.id);
            break;
    }

    if(data.data === 'disable')
    bot.answerCallbackQuery(msg.id);
});

function deletePost(chat_id, message_id, admin, callback_query_id) {
    bot.deleteMessage(chat_id, message_id)
        .then(msg => {
            bot.answerCallbackQuery({
                callback_query_id,
                text: 'پست پاک شد !'
                // show_alert : true
            }).then(msg => {
                console.log(msg);
            });
            for (const pid of app.getPost(chat_id, message_id, admin.posts)
                .ids) {
                if (pid.chat_id == admin.chat_id) {
                    bot.editMessageReplyMarkup(
                        forms.sentPost(admin.likeString, '', message_id),
                        {
                            chat_id: pid.chat_id,
                            message_id: pid.message_id
                        }
                    );
                    break;
                }
            }
        })
        .catch(res => {
            bot.answerCallbackQuery({
                callback_query_id,
                text: 'پست قبلا پاک شده !'
                // show_alert : true
            });
        });
}

function setLikeString(chat_id, entryMessageId) {
    const user = app.getUser(chat_id, users);
    user.status = Status.SET_LIKE_STR;

    const message = `
    متن دکمه لایک را ارسال کنید
    برای مثال : 👍🏼

    /cancel :انصراف ✘


`;
    if (entryMessageId) {
    } else {
        bot.sendMessage(chat_id, message);
    }
}
function isAdminOfChannel(channel_id, admin_id) {
    return new Promise((resolve, reject) => {
        bot.getChatAdministrators(channel_id)
            .then(msg => {
                for (const usr of msg) {
                    // console.log('admin id : ' + usr.user.id)
                    if (usr.user.id === admin_id) {
                        return resolve(true);
                    }
                }
                return resolve(Result.USER_IS_NOT_ADMIN);
            })
            .catch(res => {
                return resolve(Result.BOT_IS_NOT_ADMIN);
            });
    });
}

function help(chat_id) {
    const message = templates.help;
    bot.sendMessage(chat_id, message);
}
function sendPostToChannel(chat_id, message_id) {
    const admin = app.getUser(chat_id, users);

    checkAdminDoFunc(admin.channel_id, admin.user_id, admin.chat_id, () => {
        const post = app.getPost(chat_id, message_id, admin.posts);
        const form = forms.likeBtn(
            `${admin.likeString} ${post.likes}`,
            chat_id
        );
        const callback = msg => {
            let postId = new PostID(admin.channel_id, msg.message_id);
            post.ids.push(postId);

            updateUserInfoInFile(admin);

            bot.editMessageReplyMarkup(
                forms.sentPost(admin.likeString, admin.channel_id, msg.message_id),
                {
                    chat_id: admin.chat_id,
                    message_id
                }
            );
        };

        sendAllTypesMessages(admin.channel_id, post.message, form, callback);

        updateUserInfoInFile(admin);
    });
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
            if (fileName.charAt(0) === '.') continue;
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
