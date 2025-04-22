export const emailTemplate = `import nodemailer from 'nodemailer'
import logger from './logger'

interface MailOptions {
    to: string
    subject: string
    text?: string
    html?: string
}

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
})

export async function sendMail(options: MailOptions) {
    logger.log(\`发送邮件: \${JSON.stringify(options, null, 2)}\`)
    const { to, subject, text, html } = options

    const response = await transporter.sendMail({
        from: \`"your name" <\${process.env.MAIL_USER}>\`,
        to,
        subject, text, html
    })

    logger.log(\`邮件已发送: \${JSON.stringify(response, null, 2)}\`)
    return response
}`