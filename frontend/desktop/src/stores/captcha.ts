import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
type SmsState = {
  remainTime: number;
  startTime: number;
  phoneNumber: string;
  setPhoneNumber: (phoneNumber: string) => void;
  setRemainTime: (time: number) => void;
  updateStartTime: () => void;
};

const useSmsStateStore = create<SmsState>()(
  immer((set, get) => ({
    remainTime: 0,
    startTime: new Date().getTime() - 61_000,
    phoneNumber: '',
    setPhoneNumber(phoneNumber) {
      set({
        phoneNumber
      });
    },
    setRemainTime(remainTime) {
      set({
        remainTime
      });
    },
    updateStartTime() {
      set({
        startTime: new Date().getTime()
      });
    }
  }))
);

export default useSmsStateStore;
