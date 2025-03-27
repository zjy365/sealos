import { IPersonalInfo } from '@/schema/ccSvc';
import { create } from 'zustand';

interface SignupState {
  signupData: {
    email: string;
    password: string;
  } | null;
  personalData: IPersonalInfo | null;
  setSignupData: (data: { email: string; password: string }) => void;
  setPersonalData: (data: IPersonalInfo) => void;
  clearSignupData: () => void;
  clearPersonalData: () => void;
}

export const useSignupStore = create<SignupState>((set) => ({
  signupData: null,
  personalData: null,
  setSignupData: (data) => set({ signupData: data }),
  setPersonalData: (data) => set({ personalData: data }),
  clearSignupData: () => set({ signupData: null }),
  clearPersonalData: () => set({ personalData: null })
}));
