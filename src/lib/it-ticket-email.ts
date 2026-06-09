import nodemailer from 'nodemailer'
import type { ItTicketPriority } from '@/lib/database.types'

export const IT_TICKET_RECIPIENT = 'info@theinsightsapp.com'

const priorityLabels: Record<ItTicketPriority, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
}

function buildTicketBody({
  ticketId,
  subject,
  description,
  priority,
  submitterName,
  submitterEmail,
  submitterRole,
}: {
  ticketId: string
  subject: string
  description: string
  priority: ItTicketPriority
  submitterName: string
  submitterEmail: string | null
  submitterRole: string
}) {
  return [
    'New IT support ticket',
    '',
    `Ticket ID: ${ticketId}`,
    `Subject: ${subject}`,
    `Priority: ${priorityLabels[priority]}`,
    '',
    'Submitted by',
    `Name: ${submitterName}`,
    `Email: ${submitterEmail ?? 'Not available'}`,
    `Role: ${submitterRole}`,
    '',
    'Description',
    description,
  ].join('\n')
}

async function sendViaResend({
  subject,
  text,
  submitterEmail,
}: {
  subject: string
  text: string
  submitterEmail: string | null
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null

  const from =
    process.env.IT_TICKET_FROM_EMAIL ??
    'EMO Platform <it-tickets@theinsightsapp.com>'

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [IT_TICKET_RECIPIENT],
      reply_to: submitterEmail ?? undefined,
      subject: `[IT Ticket] ${subject}`,
      text,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    console.error('Resend IT ticket email failed:', body)
    return { ok: false as const, error: 'Failed to send IT ticket notification.' }
  }

  return { ok: true as const }
}

async function sendViaSmtp({
  subject,
  text,
  submitterEmail,
}: {
  subject: string
  text: string
  submitterEmail: string | null
}) {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) return null

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  })

  try {
    await transporter.sendMail({
      from: process.env.IT_TICKET_FROM_EMAIL ?? user,
      to: IT_TICKET_RECIPIENT,
      replyTo: submitterEmail ?? undefined,
      subject: `[IT Ticket] ${subject}`,
      text,
    })
    return { ok: true as const }
  } catch (error) {
    console.error('SMTP IT ticket email failed:', error)
    return { ok: false as const, error: 'Failed to send IT ticket notification.' }
  }
}

export async function sendItTicketEmail({
  ticketId,
  subject,
  description,
  priority,
  submitterName,
  submitterEmail,
  submitterRole,
}: {
  ticketId: string
  subject: string
  description: string
  priority: ItTicketPriority
  submitterName: string
  submitterEmail: string | null
  submitterRole: string
}) {
  const text = buildTicketBody({
    ticketId,
    subject,
    description,
    priority,
    submitterName,
    submitterEmail,
    submitterRole,
  })

  const resendResult = await sendViaResend({ subject, text, submitterEmail })
  if (resendResult?.ok) return resendResult

  const smtpResult = await sendViaSmtp({ subject, text, submitterEmail })
  if (smtpResult?.ok) return smtpResult

  if (resendResult?.ok === false) return resendResult
  if (smtpResult?.ok === false) return smtpResult

  return {
    ok: false as const,
    error:
      'Email delivery is not configured. Add RESEND_API_KEY or SMTP settings to your environment.',
  }
}
