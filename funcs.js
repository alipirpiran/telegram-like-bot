export const getUser = (chatId, users) => {
for (const item of users) {
    if(item.chat_id === chatId)
    return item;
}

return null;
}

export const MessageType = {
    TEXT : 'text',
    PHOTO : 'photo',
    voice : 'voice',
    audio : 'audio',
    video : 'video'

}

export const getMessageType = (msg) => {
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

export const getPost = (id, posts) => {
    for (const post of posts) {
        for (const mid of post.ids) {
            if (mid === id) {
                return post;
            }
        }
    }
    return null;
}