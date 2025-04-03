export interface CommonTrackProps {
  eventName: string;
  eventParams?: any;
}
export function sendEvent(eventName: string, eventParams?: Record<string, string | number>) {
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', eventName, eventParams);
  }
}
