export const mainMenu = (name, channelName) => {
    return `
    کاربر : ${name}
    کانال : ${channelName ? channelName : 'ثبت نشده'}    
`
}