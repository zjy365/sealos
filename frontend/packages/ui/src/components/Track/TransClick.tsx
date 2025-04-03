import { cloneElement, FC, ReactElement, ReactNode } from 'react';
import TrackClick from './Click';
import { CommonTrackProps } from './shared';

interface TrackTransClickProps extends CommonTrackProps {
  element: ReactElement<any>;
  children?: ReactNode;
}
const TrackTransClick: FC<TrackTransClickProps> = ({
  element,
  eventName,
  eventParams,
  children
}) => {
  return (
    <TrackClick eventName={eventName} eventParams={eventParams}>
      {cloneElement(element, {}, children)}
    </TrackClick>
  );
};
export default TrackTransClick;
