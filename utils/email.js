const nodemailer = require('nodemailer');
const ejs = require('ejs');

const sendEmail = async options => {
    // 1) Create a transporter
    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        secure: false,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // 2) E-mail options
    const mailOptions = {
        from : 'Muyiwa Olugbebi <muyiwaolugbebi@gmail.com>',
        to:options.email,
        subject:options.subject,
        text:options.message,
        // html:data
    }
    // 3) Actually send the mail
    await transporter.sendMail(mailOptions)


}

module.exports = sendEmail

