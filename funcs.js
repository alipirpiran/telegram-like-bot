export const getUser = (chatId, users) => {
for (const item of users) {
    if(item.chat_id === chatId)
    return item;
}
}