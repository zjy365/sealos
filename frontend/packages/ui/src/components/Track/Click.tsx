import { Children, cloneElement, FC, ReactElement, SyntheticEvent } from 'react';
import { CommonTrackProps, sendEvent } from './shared';

interface TrackClickProps extends CommonTrackProps {
  children: ReactElement<any>;
}
const TrackClick: FC<TrackClickProps> = ({ children, eventName, eventParams }) => {
  const target = children.props.target;
  const href = children.props.href;
  const onClick = children.props.onClick;
  const child = cloneElement(Children.only(children), {
    onClick: (e?: SyntheticEvent) => {
      let afterSend = () => {};
      if (href && typeof e?.preventDefault === 'function') {
        e.preventDefault();
        afterSend = () => {
          if (target === '_blank') {
            window.open(href);
          } else {
            location.href = href;
          }
        };
      }
      sendEvent(eventName, eventParams);
      const res = onClick?.(e);
      afterSend();
      return res;
    }
  });
  return child;
};
export default TrackClick;
