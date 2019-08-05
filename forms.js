import { toUnicode } from "punycode";


export const callback_type = {
    SET_CHANNEL : 'setchannel',
    LIKE : 'like',
    SEND : 'send'
}
export const mainMenu = () => {
    // complete the data 
    let calback = JSON.stringify(createCallBackData(callback_type.SET_CHANNEL, 'data tha i added !'));
    return {
        inline_keyboard: [
            [createButton('ثبت کانال', calback)]
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