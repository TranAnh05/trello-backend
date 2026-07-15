import { Resend } from 'resend'
import { env } from '~/config/environment'

const resendInstance = new Resend(env.RESEND_API_KEY)

// function de gui email
const sendEmail = async (to, subject, html) => {
  try {
    const data = await resendInstance.emails.send({
      from: env.ADMIN_SENDER_EMAIL,
      to,
      subject,
      html
    })

    return data
  } catch (error) {
    throw error
  }
}

export const ResendProvider = {
  sendEmail
}