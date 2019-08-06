import { toUnicode } from "punycode";


export const callback_type = {
    SET_CHANNEL : 'setchannel',
    LIKE : 'like',
    SEND : 'send',
    LIKE_SET : 'like_set'
}
export const mainMenu = (user) => {
    // complete the data 
    let calback = JSON.stringify(createCallBackData(callback_type.SET_CHANNEL, 'data tha i added !'));
    let callback_like = JSON.stringify(createCallBackData(callback_type.LIKE_SET, ''))
    return {
        inline_keyboard: [
            [createButton('ثبت کانال', calback)],
            [createButton(`[${user.likeString}] تنظیم دکمه لایک`, callback_like)]
        ]
    }
}

export const sendPost = (likeString) => {
    // complete the data 
    let calback = JSON.stringify(createCallBackData('', 'liked !'))
    let sendCallBack = JSON.stringify(createCallBackData(callback_type.SEND, 'dont know'))
    return {
        inline_keyboard: [
            [createButton(likeString, calback)],
            [createButton('ارسال', sendCallBack)]
        ]
    }
}

export const likeBtn = (likeString, adminChatId) => {
    let calback = JSON.stringify(createCallBackData(callback_type.LIKE, adminChatId))
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