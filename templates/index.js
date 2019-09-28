exports.mainMenu = (name, channelName) => {
    return `
🔸 کاربر  : ${name ? name : 'ثبت نشده'}

🔸 کانال : ${channelName ? channelName : 'ثبت نشده'}    
`
}

exports.setChannel = () => {
    return `
    🔸 بسیار خب
    👈 در صورتی که @likeposterbot را ادمین کانال خود قرار داده‌اید، نام کاربری کانال خود را در قالب @channelusername ارسال کنید:

    /cancel :انصراف ✘
    `
}

exports.help = 
`
🔸 با استفاده از دکمه ثبت ایدی کانال خود را ثبت کنید.

🔸 ارسال مستقیم به کانال شما، بدون via و بدون نقل‌قول از ربات!!

👈 برای شروع کافی است پستی را که می‌خواهید در کانال شما منتشر شود، ابتدا اینجا ارسال کنید! ... 😊
`

exports.bot_is_not_admin =
`
    ربات ادمین کانال نیست. 
    ابتدا ربات را ادمین کانال کنید
`

exports.user_is_not_admin = 
`
    شما ادمین کانال تیستید
`

exports.account_is_not_premium = 
`
اکانت شما این قابلیت را ندارد.
جهت ارتقا اکانت به اکانت طلایی با ادمین ارتباط برقرار کنید.
ایدی : @mralpr
`

exports.set_post_like = 
`
متن گزینه لایک را ارسال کنید : 

/cancel :انصراف ✘

`

