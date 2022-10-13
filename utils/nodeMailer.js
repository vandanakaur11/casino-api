const nodemailer = require('nodemailer');

const sendMail = async (to, code) => {

    let mailTransporter = nodemailer.createTransport({
        service: 'gmail',
        secure: false,
        auth: {
            user: 'softapps.io3@gmail.com',
            pass: 'cepiaxdscvfpjcss'
        }
    });

    let mailDetails = {
        from: 'softapps.io3@gmail.com',
        to: to,
        subject: 'Urgent Games Recover Password Service',
        text: 'Your Code is:',
        html: `<h1>${code}</h1>`
    };

    mailTransporter.sendMail(mailDetails, function (err, data) {
        if (err) {
            console.log('Error Occurs', err.message);
        } else {
            console.log('Email sent successfully');
        }
    });
}

module.exports = {
    sendMail
}
