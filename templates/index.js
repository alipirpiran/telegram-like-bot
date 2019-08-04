export const mainMenu = (name, channelName) => {
    return `
    کاربر : ${name ? name : 'ثبت نشده'}
    کانال : ${channelName ? channelName : 'ثبت نشده'}    
`
}