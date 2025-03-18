import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface GuideState {
  guide1: boolean;
  guide2: boolean;
  guideConfigDevbox: boolean;
  guideIDE: boolean;
  guide5: boolean;
  guide6: boolean;
  guide7: boolean;
  guideRelease: boolean;
  currentGuideApp: string;
  isGuideEnabled: boolean;
  setGuide1: (completed: boolean) => void;
  setGuide2: (completed: boolean) => void;
  setguideConfigDevbox: (completed: boolean) => void;
  setguideIDE: (completed: boolean) => void;
  setGuide5: (completed: boolean) => void;
  setGuide6: (completed: boolean) => void;
  setGuide7: (completed: boolean) => void;
  setguideRelease: (completed: boolean) => void;
  setGuideEnabled: (enabled: boolean) => void;
  setCurrentGuideApp: (name: string) => void;
  resetGuideState: (completed: boolean) => void;
}

export const useGuideStore = create<GuideState>()(
  persist(
    (set) => ({
      guide1: true,
      guide2: true,
      guideConfigDevbox: true,
      guideIDE: true,
      guide5: true,
      guide6: true,
      guide7: true,
      guideRelease: true,
      currentGuideApp: '',
      isGuideEnabled: true,
      setGuide1: (completed: boolean) => set({ guide1: completed }),
      setGuide2: (completed: boolean) => set({ guide2: completed }),
      setguideConfigDevbox: (completed: boolean) => set({ guideConfigDevbox: completed }),
      setguideIDE: (completed: boolean) => set({ guideIDE: completed }),
      setGuide5: (completed: boolean) => set({ guide5: completed }),
      setGuide6: (completed: boolean) => set({ guide6: completed }),
      setGuide7: (completed: boolean) => set({ guide7: completed }),
      setguideRelease: (completed: boolean) => set({ guideRelease: completed }),
      setGuideEnabled: (enabled) => set({ isGuideEnabled: enabled }),
      setCurrentGuideApp: (name: string) => set({ currentGuideApp: name }),
      resetGuideState: (completed: boolean) =>
        set({
          guide1: completed,
          guide2: completed,
          guideConfigDevbox: completed,
          guideIDE: completed,
          guide5: completed,
          guide6: completed,
          guide7: completed,
          guideRelease: completed
        })
    }),
    {
      name: 'user-guide',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
