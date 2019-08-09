exports.getUser = (chatId, users) => {
for (const item of users) {
    if(item.chat_id === chatId)
    return item;
}

return null;
}

exports.MessageType = {
    TEXT : 'text',
    PHOTO : 'photo',
    voice : 'voice',
    audio : 'audio',
    video : 'video'

}

exports.getMessageType = (msg) => {
    const MessageType = this.MessageType;
    if(msg.text)
        return MessageType.TEXT;
    if(msg.photo)
    return MessageType.PHOTO;
    if(msg.audio)
    return MessageType.audio;
    if(msg.video)
    return MessageType.video;
    if(msg.voice)
    return MessageType.voice;


}

exports.getPost = (chid, id, posts) => {
    for (const post of posts) {
        for (const {chat_id, message_id} of post.ids) {
            if (message_id == id && chat_id === chid) {
                return post;
            }
        }
    }

    return null;
}