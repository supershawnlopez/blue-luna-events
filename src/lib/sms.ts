// SMS sending capability — built per DECISIONS.md 2026-07-07 ("build sending
// capability now, defer activation pending carrier registration"). Requires
// TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER to actually send —
// none of these exist yet. Until Shawn sets up a Twilio account and completes
// A2P 10DLC carrier registration (required for US business SMS), this is
// untested, inactive code, not a working feature.

export function smsConfigured(): boolean {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER)
}

export async function sendSms(to: string, body: string): Promise<{ ok: boolean; error?: string }> {
  if (!smsConfigured()) {
    return { ok: false, error: 'SMS is not configured yet — needs a Twilio account and carrier registration.' }
  }
  const twilio = (await import('twilio')).default
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  try {
    await client.messages.create({ to, from: process.env.TWILIO_PHONE_NUMBER, body })
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'SMS send failed' }
  }
}
