exports.callback_type = {
    SET_CHANNEL: 'setchannel',
    LIKE: 'like',
    SEND: 'send',
    LIKE_SET: 'like_set',
    MAIN_MENU: 'mainmenu',
    HELP: 'help',
    DELET_POST: 'deletepost',
    SEE_POST: 'seepost',
    SET_POST_LIKE : 'setpostlike',
    NEW_POST_LIKE : 'newpostlikeString',
    SETED_POST_LIKE : 'setedpostlike',
    SEND_MENU : 'sendmenu',
    LIKERS_LIST: 'likerlist',
    ADMIN_MENU: 'adminmenu'
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
    let callback_admin = JSON.stringify(
        createCallBackData(this.callback_type.ADMIN_MENU, '')
    );

    let btns = [
        [
            createButton(
                `📢 ${user.channel_id ? 'تغییر کانال' : 'ثبت کانال'}`,
                { callback_data: calback }
            )
        ],
        [
            createButton(`[${user.likeString}] لایک پیشفرض`, {
                callback_data: callback_like
            })
        ],
        [createButton('❔راهنما', { callback_data: callback_help })],
    ]
    if (user.fullAdmin) {
        btns.push(
            [createButton('منو ادمین', { callback_data: callback_admin })]
        )
    }

    return {
        inline_keyboard: btns
    };
};

exports.sendPost = (likeString) => {
    // complete the data
    let calback = JSON.stringify(
        createCallBackData(this.callback_type.SET_POST_LIKE, { callback_data: '' })
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

exports.sentPost = (likeString, channel_id, messageId, activeUser) => {
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

    let callback_likers = JSON.stringify(
        createCallBackData(this.callback_type.LIKERS_LIST)
    )

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
            [
                createButton(`${activeUser?"افراد نظر داده":"🔐 افراد نظر داده"}`, {callback_data: callback_likers})
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

exports.likeStringsForPost = () => {
    let likeStrings = [
        ['❤', '️🧡', '💛', '💚', '💙', '💜'],
        ['👍', '👍🏻', '👍🏼', '👍🏽', '👍🏾', '🏿'],
        ['😀', '😃', '😄', '😁', '😆', '😂']
    ]

    let btns = [];

    for (let index = 0; index < likeStrings.length; index++) {
        let rowBtns = [];
        const element = likeStrings[index];
        for (let j = 0; j < element.length; j++) {
            const str = element[j];

            let calback = JSON.stringify(
                createCallBackData(this.callback_type.SETED_POST_LIKE, str)
            );

            rowBtns.push(createButton(str, {callback_data : calback}))
        }
        btns.push(rowBtns);
    }

    let cl1 = JSON.stringify(createCallBackData(this.callback_type.SEND_MENU, ''));
    let cl2 = JSON.stringify(createCallBackData(this.callback_type.NEW_POST_LIKE, ''));

    btns.push([
        createButton('بازگشت', {callback_data : cl1}),
        createButton('مورد دیگر', {callback_data : cl2})
    ])

    return {
        inline_keyboard: btns
    }
}


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
