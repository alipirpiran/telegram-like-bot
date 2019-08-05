

export const callback_type = {
    SET_CHANNEL : 'setchannel'
}
export const mainMenu = () => {
    let calback = JSON.stringify(createCallBackData(callback_type.SET_CHANNEL, 'data tha i added !'));
    return {
        inline_keyboard: [
            [createButton('ثبت کانال', calback)]
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