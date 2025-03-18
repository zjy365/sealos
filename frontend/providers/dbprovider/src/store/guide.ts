import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface GuideState {
  createCompleted: boolean;
  detailCompleted: boolean;
  applistCompleted: boolean;
  appName: string;
  setCreateCompleted: (completed: boolean) => void;
  setDetailCompleted: (completed: boolean) => void;
  setApplistCompleted: (completed: boolean) => void;
  resetGuideState: (completed: boolean) => void;
  setAppName: (name: string) => void;
}

export const useGuideStore = create<GuideState>()(
  persist(
    (set) => ({
      createCompleted: true,
      detailCompleted: true,
      applistCompleted: true,
      appName: '',
      setCreateCompleted: (completed) => set({ createCompleted: completed }),
      setDetailCompleted: (completed) => set({ detailCompleted: completed }),
      setApplistCompleted: (completed) => set({ applistCompleted: completed }),
      resetGuideState: (completed) =>
        set({
          createCompleted: completed,
          detailCompleted: completed,
          applistCompleted: completed
        }),
      setAppName: (name) => set({ appName: name })
    }),
    {
      name: 'user-guide',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
