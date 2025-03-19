import { create } from 'zustand';

interface SignupState {
  workspaceName: string;
  selectedRegionUid: string;
  setSelectedRegionUid: (uid: string) => void;
  setWorkspaceName: (n: string) => void;
  initGuide: boolean;
  setInitGuide: (initGuide: boolean) => void;
}

export const useInitWorkspaceStore = create<SignupState>((set) => ({
  workspaceName: '',
  selectedRegionUid: '',
  setSelectedRegionUid(selectedRegionUid) {
    set({ selectedRegionUid });
  },
  setWorkspaceName(workspaceName: string) {
    set({ workspaceName });
  },
  initGuide: false,
  setInitGuide(initGuide: boolean) {
    console.log('initGuide', initGuide);
    set({ initGuide });
  }
}));
