'use client';
import { FC, ReactNode, useEffect, useRef } from 'react';
import { CommonTrackProps, sendEvent } from './shared';

interface TrackMountProps extends CommonTrackProps {
  check?: () => boolean;
  children?: ReactNode;
  sendOnce?: boolean;
}
const TrackMount: FC<TrackMountProps> = ({ check, eventName, eventParams, sendOnce, children }) => {
  const checkRes = typeof check === 'function' ? check() : true;
  const sendCountRef = useRef(0);
  useEffect(() => {
    sendCountRef.current = 0;
  }, [eventName]);
  useEffect(() => {
    if (checkRes && (!sendOnce || sendCountRef.current === 0)) {
      sendCountRef.current += 1;
      sendEvent(eventName, eventParams);
    }
  }, [checkRes, eventName]);
  return children;
};
export default TrackMount;
