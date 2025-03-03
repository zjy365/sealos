import { create } from 'zustand';

interface SignupState {
  signupData: {
    email: string;
    password: string;
  } | null;
  setSignupData: (data: { email: string; password: string }) => void;
  clearSignupData: () => void;
}

export const useSignupStore = create<SignupState>((set) => ({
  signupData: null,
  setSignupData: (data) => set({ signupData: data }),
  clearSignupData: () => set({ signupData: null })
}));
