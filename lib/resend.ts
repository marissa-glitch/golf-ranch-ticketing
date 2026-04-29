import { Event, Order, TicketTier } from './types'
import { formatDate, formatPrice } from './utils'

interface ConfirmationEmailParams {
  order: Order
  event: Event
  tier: TicketTier
  inviteLink?: string | null
}

export async function sendConfirmationEmail({ order, event, tier, inviteLink }: ConfirmationEmailParams) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  const orderId = order.id.split('-')[0].toUpperCase()
  const amountPaid = formatPrice(order.pay_amount)
  const eventDate = formatDate(event.date)
  const timeRange = event.start_time && event.end_time ? `${event.start_time} – ${event.end_time}` : event.start_time ?? ''

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're in — Golf Ranch Classic</title>
</head>
<body style="margin:0;padding:0;background:#f7f7f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f2;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e9e9da;">

          <!-- Header -->
          <tr>
            <td style="background:#00505b;padding:40px 32px;text-align:center;">
              <p style="margin:0 0 8px;color:#dab806;font-size:11px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;">Golf Ranch Classic</p>
              <h1 style="margin:0 0 8px;color:#ffffff;font-size:28px;font-weight:900;text-transform:uppercase;letter-spacing:-0.02em;">You're In!</h1>
              <p style="margin:0;color:rgba(255,255,255,0.75);font-size:14px;">${event.location_name}, ${event.location_state}</p>
            </td>
          </tr>

          <!-- Order details -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 20px;font-size:15px;color:#525252;">Hi ${order.customer_name.split(' ')[0]}, your spot is confirmed. Here's your order summary:</p>

              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e9e9da;border-radius:8px;overflow:hidden;">
                <tr style="background:#f7f7f2;">
                  <td style="padding:12px 16px;font-size:12px;font-weight:700;color:#525252;text-transform:uppercase;letter-spacing:0.08em;">Order #${orderId}</td>
                </tr>
                <tr>
                  <td style="padding:0 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #f0f0e8;font-size:14px;color:#525252;">Event</td>
                        <td style="padding:12px 0;border-bottom:1px solid #f0f0e8;font-size:14px;font-weight:600;color:#171717;text-align:right;">${event.name}</td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #f0f0e8;font-size:14px;color:#525252;">Location</td>
                        <td style="padding:12px 0;border-bottom:1px solid #f0f0e8;font-size:14px;font-weight:600;color:#171717;text-align:right;">${event.location_name}, ${event.location_state}</td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #f0f0e8;font-size:14px;color:#525252;">Date</td>
                        <td style="padding:12px 0;border-bottom:1px solid #f0f0e8;font-size:14px;font-weight:600;color:#171717;text-align:right;">${eventDate}</td>
                      </tr>
                      ${timeRange ? `<tr>
                        <td style="padding:12px 0;border-bottom:1px solid #f0f0e8;font-size:14px;color:#525252;">Time</td>
                        <td style="padding:12px 0;border-bottom:1px solid #f0f0e8;font-size:14px;font-weight:600;color:#171717;text-align:right;">${timeRange}</td>
                      </tr>` : ''}
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #f0f0e8;font-size:14px;color:#525252;">Ticket</td>
                        <td style="padding:12px 0;border-bottom:1px solid #f0f0e8;font-size:14px;font-weight:600;color:#171717;text-align:right;">${tier.name}</td>
                      </tr>
                      <tr>
                        <td style="padding:14px 0;font-size:15px;font-weight:700;color:#171717;">Amount Paid</td>
                        <td style="padding:14px 0;font-size:15px;font-weight:700;color:#171717;text-align:right;">${amountPaid}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${inviteLink ? `
              <!-- Team invite -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;background:#f7f7f2;border:1px solid #e9e9da;border-radius:8px;">
                <tr>
                  <td style="padding:16px;">
                    <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#171717;">Invite Your Teammates</p>
                    <p style="margin:0 0 12px;font-size:13px;color:#525252;">Share this link so your team can register together:</p>
                    <a href="${inviteLink}" style="display:block;background:#00505b;color:#ffffff;text-decoration:none;text-align:center;padding:10px 16px;border-radius:6px;font-size:13px;font-weight:700;">${inviteLink}</a>
                  </td>
                </tr>
              </table>` : ''}

              <!-- What to know -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;background:#f7f7f2;border:1px solid #e9e9da;border-radius:8px;">
                <tr>
                  <td style="padding:16px;">
                    <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#171717;">What to Know</p>
                    <p style="margin:0;font-size:13px;color:#525252;line-height:1.6;">Show up ready to swing. No dress code. Range balls, bucket hat, and lunch included. Bring your own clubs or use ours. Competition kicks off at 8 AM.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #e9e9da;text-align:center;">
              <p style="margin:0;font-size:12px;color:#999;">Questions? Reply to this email or visit <a href="https://golfranch.com" style="color:#00505b;">golfranch.com</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: `Golf Ranch Classic <${process.env.RESEND_FROM_EMAIL ?? 'contact@golfranchusa.com'}>`,
      to: order.customer_email,
      subject: `You're in! Golf Ranch Classic — ${event.location_name}, ${event.location_state}`,
      html,
    }),
  })
}
