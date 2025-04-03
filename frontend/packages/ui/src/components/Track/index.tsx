import TrackClick from './Click';
import { trackEvents } from './events';
import TrackMount from './Mount';
import TrackScripts from './Scripts';
import { sendEvent } from './shared';
import TrackTransClick from './TransClick';

const Track = {
  Scripts: TrackScripts,
  Click: TrackClick,
  Mount: TrackMount,
  TransClick: TrackTransClick,
  send: sendEvent,
  events: trackEvents
};
export default Track;
