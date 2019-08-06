export const mainMenu = (name, channelName) => {
    return `
کاربر : ${name ? name : 'ثبت نشده'}
کانال : ${channelName ? channelName : 'ثبت نشده'}    
`
}

export const setChannel = () => {
    return `
لطفا ایدی کانال خود را به صورت زیر ارسال کنید
@ID
    `
}