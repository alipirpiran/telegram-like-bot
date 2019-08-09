exports.callback_type = {
    SET_CHANNEL: 'setchannel',
    LIKE: 'like',
    SEND: 'send',
    LIKE_SET: 'like_set',
    MAIN_MENU: 'mainmenu',
    HELP: 'help',
    DELET_POST: 'deletepost',
    SEE_POST: 'seepost'
};
exports.mainMenu = user => {
    let calback = JSON.stringify(
        createCallBackData(this.callback_type.SET_CHANNEL, 'data tha i added !')
    );
    let callback_like = JSON.stringify(
        createCallBackData(this.callback_type.LIKE_SET, '')
    );
    let callback_help = JSON.stringify(
        createCallBackData(this.callback_type.HELP, '')
    );

    return {
        inline_keyboard: [
            [
                createButton(
                    `📢 ${user.channel_id ? 'تغییر کانال' : 'ثبت کانال'}`,
                    { callback_data: calback }
                )
            ],
            [
                createButton(`[${user.likeString}] تنظیم دکمه لایک`, {
                    callback_data: callback_like
                })
            ],
            [createButton('❔راهنما', { callback_data: callback_help })]
        ]
    };
};

exports.sendPost = likeString => {
    // complete the data
    let calback = JSON.stringify(
        createCallBackData('', { callback_data: 'disable' })
    );
    let sendCallBack = JSON.stringify(
        createCallBackData(this.callback_type.SEND, {
            callback_data: 'dont know'
        })
    );
    let calback_mainmenu = JSON.stringify(
        createCallBackData(this.callback_type.MAIN_MENU, { callback_data: '' })
    );

    return {
        inline_keyboard: [
            [createButton(likeString, { callback_data: calback })],
            [createButton('ارسال', { callback_data: sendCallBack })],
            [createButton('منو اصلی', { callback_data: calback_mainmenu })]
        ]
    };
};

exports.sentPost = (likeString, channel_id, messageId) => {
    let calback = JSON.stringify(createCallBackData('', 'disable'));
    let sendCallBack = JSON.stringify(
        createCallBackData(this.callback_type.SEND, 'dont know')
    );
    let deletCallBack = JSON.stringify(
        createCallBackData(this.callback_type.DELET_POST, `${messageId}`)
    );
    let calback_mainmenu = JSON.stringify(
        createCallBackData(this.callback_type.MAIN_MENU, '')
    );

    if(String(channel_id).charAt(0) === '@')
        channel_id = String(channel_id).split('@')[1];

    let postUrl = `t.me/${channel_id}/${messageId}`

    return {
        inline_keyboard: [
            [
                createButton(likeString, { callback_data: calback }),
                createButton(`${postUrl ? 'مشاهده پست' : 'حذف شده'}`, {
                    url: postUrl
                })
            ],
            [
                createButton(`${postUrl ? 'حذف پست' : 'حذف شده'}`, {
                    callback_data: deletCallBack
                }),
                createButton('ارسال مجدد', { callback_data: sendCallBack })
            ],
            [createButton('منو اصلی', { callback_data: calback_mainmenu })]
        ]
    };
};

exports.likeBtn = (likeString, adminChatId) => {
    let calback = JSON.stringify(
        createCallBackData(this.callback_type.LIKE, adminChatId)
    );
    return {
        inline_keyboard: [
            [createButton(likeString, { callback_data: calback })]
        ]
    };
};

function createButton(text, data) {
    let { url, callback_data } = data;
    if (!url && !callback_data) callback_data = ' ';

    return {
        text,
        callback_data,
        url
    };
}

function createCallBackData(type, data) {
    return {
        type,
        data
    };
}
