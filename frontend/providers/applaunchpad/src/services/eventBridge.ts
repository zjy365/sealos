type EventKind = 'create_app';

export async function sendEvent(kind: EventKind, uid: string, referral_code?: string) {
  try {
    if (!global.AppConfig.launchpad.eventBridgeUrl) {
      return;
    }
    await fetch(global.AppConfig.launchpad.eventBridgeUrl, {
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
