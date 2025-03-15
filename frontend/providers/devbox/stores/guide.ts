import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface GuideState {
  createCompleted: boolean;
  createDevboxCompleted: boolean;
  detailCompleted: boolean;
  listCompleted: boolean;
  isGuideEnabled: boolean;
  releaseCompleted: boolean;
  releaseVersionCompleted: boolean;
  deployCompleted: boolean;
  ideCompleted: boolean;
  setCreateCompleted: (completed: boolean) => void;
  setCreateDevboxCompleted: (completed: boolean) => void;
  setDetailCompleted: (completed: boolean) => void;
  setListCompleted: (completed: boolean) => void;
  setGuideEnabled: (enabled: boolean) => void;
  setReleaseCompleted: (completed: boolean) => void;
  setReleaseVersionCompleted: (completed: boolean) => void;
  setDeployCompleted: (completed: boolean) => void;
  setIdeCompleted: (completed: boolean) => void;
  resetGuideState: (completed: boolean) => void;
}

export const useGuideStore = create<GuideState>()(
  persist(
    (set) => ({
      createCompleted: true,
      createDevboxCompleted: true,
      detailCompleted: true,
      listCompleted: true,
      releaseCompleted: true,
      releaseVersionCompleted: true,
      deployCompleted: true,
      ideCompleted: true,
      isGuideEnabled: true,
      setCreateCompleted: (completed) => set({ createCompleted: completed }),
      setCreateDevboxCompleted: (completed) => set({ createDevboxCompleted: completed }),
      setDetailCompleted: (completed) => set({ detailCompleted: completed }),
      setListCompleted: (completed) => set({ listCompleted: completed }),
      setReleaseCompleted: (completed) => set({ releaseCompleted: completed }),
      setReleaseVersionCompleted: (completed) => set({ releaseVersionCompleted: completed }),
      setGuideEnabled: (enabled) => set({ isGuideEnabled: enabled }),
      setIdeCompleted: (completed) => set({ ideCompleted: completed }),
      setDeployCompleted: (completed) => set({ deployCompleted: completed }),
      resetGuideState: (completed) =>
        set({
          createCompleted: completed,
          detailCompleted: completed,
          listCompleted: completed,
          releaseCompleted: completed,
          releaseVersionCompleted: completed,
          ideCompleted: completed,
          createDevboxCompleted: completed,
          deployCompleted: completed
        })
    }),
    {
      name: 'user-guide',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
