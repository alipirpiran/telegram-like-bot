


exports.callback_type = {
    SET_CHANNEL : 'setchannel',
    LIKE : 'like',
    SEND : 'send',
    LIKE_SET : 'like_set',
    MAIN_MENU : 'mainmenu',
    HELP : 'help'
}
exports.mainMenu = (user) => {
    // complete the data 
    console.log(user)
    
    let calback = JSON.stringify(createCallBackData(this.callback_type.SET_CHANNEL, 'data tha i added !'));
    let callback_like = JSON.stringify(createCallBackData(this.callback_type.LIKE_SET, ''));
    let callback_help = JSON.stringify(createCallBackData(this.callback_type.HELP, ''));

    return {
        inline_keyboard: [
            [createButton(`📢 ${user.channel_id ? 'تغییر کانال':'ثبت کانال'}`, calback)],
            [createButton(`[${user.likeString}] تنظیم دکمه لایک`, callback_like)],
            [createButton('❔راهنما', callback_help)]
        ]
    }
}

exports.sendPost = (likeString) => {
    // complete the data 
    let calback = JSON.stringify(createCallBackData('', 'liked !'))
    let sendCallBack = JSON.stringify(createCallBackData(this.callback_type.SEND, 'dont know'));
    let calback_mainmenu = JSON.stringify(createCallBackData(this.callback_type.MAIN_MENU, ''))

    return {
        inline_keyboard: [
            [createButton(likeString, calback)],
            [createButton('ارسال', sendCallBack)],
            [createButton('منو اصلی', calback_mainmenu)]
        ]
    }
}

exports.likeBtn = (likeString, adminChatId) => {
    let calback = JSON.stringify(createCallBackData(this.callback_type.LIKE, adminChatId))
    return {
        inline_keyboard: [
            [createButton(likeString, calback)]
        ]
    }
}

function createButton(text, data){
    return {
        text,
        callback_data : data
    }
}

function createCallBackData(type, data){
    return {
        type, data
    }
}