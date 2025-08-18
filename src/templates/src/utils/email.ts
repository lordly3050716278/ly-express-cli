import nodemailer from 'nodemailer'

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
    console.cliLog(`发送邮件: ${JSON.stringify(options, null, 2)}`)
    const { to, subject, text, html } = options

    const response = await transporter.sendMail({
        from: `"lordly" <${process.env.MAIL_USER}>`,
        to,
        subject, text, html
    })

    console.cliSuccess(`邮件已发送: ${JSON.stringify(response, null, 2)}`)
    return response
}

export async function sendVerificationCode(to: string, code: string, expire: number) {
    const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">您的验证码</h2>
        <p style="font-size: 16px; color: #555;">请使用下面的验证码完成操作：</p>
        <div style="font-size: 32px; font-weight: 600; letter-spacing: 4px; color: #2d8cf0; margin: 20px 0;">
          ${code}
        </div>
        <p style="font-size: 14px; color: #999;">验证码有效期为 ${expire / 60} 分钟，请勿泄露给他人。</p>
      </div>
    </div>`

    return await sendMail({
        to,
        subject: '邮箱验证码',
        html
    })
}

/**
 * 发送敏感信息提醒
 * 
 * @param user 
 * @param message 
 * @returns 
 */
export async function sendSensitiveInformation(user: any, message: string) {
    if (user.id === 1) return
    const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
        <div
            style="max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <h2 style="color: #333;">敏感操作提醒</h2>
            <p style="font-size: 16px; color: #555;">用户(id=${user.id}, email=${user.email})</p>
            <div style="font-size: 14px; font-weight: 600; color: #2d8cf0; margin: 20px 0;white-space: pre-wrap;">${message}</div>
            <p style="font-size: 14px; color: #999;">操作时间: ${(new Date()).toLocaleString()}</p>
        </div>
    </div>`
    return await sendMail({
        to: process.env.MAIL_USER,
        subject: '敏感操作提醒',
        html
    })
}