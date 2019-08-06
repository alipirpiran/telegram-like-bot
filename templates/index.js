export const mainMenu = (name, channelName) => {
    return `
🔸 کاربر  : ${name ? name : 'ثبت نشده'}

🔸 کانال : ${channelName ? channelName : 'ثبت نشده'}    
`
}

export const setChannel = () => {
    return `
    🔸 بسیار خب
    👈 در صورتی که @likeposterbot را ادمین کانال خود قرار داده‌اید، نام کاربری کانال خود را در قالب @channelusername ارسال کنید:

    /Cancel :انصراف ✘
    `
}

export const help = 
`
🔸 با استفاده از دکمه ثبت ایدی کانال خود را ثبت کنید.

🔸 ارسال مستقیم به کانال شما، بدون via و بدون نقل‌قول از ربات!!

👈 برای شروع کافی است پستی را که می‌خواهید در کانال شما منتشر شود، ابتدا اینجا ارسال کنید! ... 😊
`