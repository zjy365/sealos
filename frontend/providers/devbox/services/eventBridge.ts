type EventKind = 'create_devbox';

export async function sendEvent(kind: EventKind, uid: string, referral_code?: string) {
  try {
    if (!process.env?.ALI_EVENT_BRIDGE_API) {
      return;
    }
    await fetch(process.env.ALI_EVENT_BRIDGE_API, {
      method: 'POST',
      body: JSON.stringify({
        source: 'run.claw.cloud',
        kind,
        uid,
        referral_code
      })
    });
  } catch (err) {
    console.error('Error occurred:', err);
  }
}
