import { Session, sessionKey } from '@/types';
import { OauthProvider } from '@/types/user';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type OauthAction = 'LOGIN' | 'BIND' | 'UNBIND';

type SessionState = {
  session?: Session;
  token: string;
  provider?: OauthProvider;
  lastSigninProvider?: string;
  oauth_state: string;
  firstUse: Date | null;
  setSession: (ss: Session) => void;
  updateSubscription: (subscription: Session['user']['subscription']) => void;
  setSessionProp: <T extends keyof Session>(key: T, value: Session[T]) => void;
  delSession: () => void;
  setFirstUse: (d: Date | null) => void;
  isUserLogin: () => boolean;
  /*
			when proxy oauth2.0 ,the domainState need to be used
	*/
  generateState: (action?: OauthAction, statePayload?: unknown) => string;
  compareState: (state: string) => {
    isSuccess: boolean;
    action: string;
    timestamp: number;
    statePayload: unknown;
  };
  setLastSigninProvider: (provider?: string) => void;
  setProvider: (provider?: OauthProvider) => void;
  setToken: (token: string, rememberMe?: boolean) => void;
  lastWorkSpaceId: string;
  setWorkSpaceId: (id: string) => void;
  initTokenFromStorage: () => void;
};

const useSessionStore = create<SessionState>()(
  persist(
    immer((set, get) => ({
      session: undefined,
      provider: undefined,
      lastSigninProvider: undefined,
      firstUse: null,
      oauth_state: '',
      token: '',
      lastWorkSpaceId: '',
      setFirstUse(d) {
        set({
          firstUse: d
        });
      },
      setSession: (ss: Session) => set({ session: ss }),
      updateSubscription(subscription: Session['user']['subscription']) {
        set((s) => {
          if (s.session?.user.subscription) {
            s.session.user.subscription = subscription;
          }
        });
      },
      setSessionProp: (key: keyof Session, value: any) => {
        set((state) => {
          if (state.session) {
            state.session[key] = value;
          }
        });
      },
      delSession: () => {
        set({ session: undefined, token: '' });

        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          sessionStorage.removeItem('auth_token');
        }
      },
      isUserLogin: () => !!get().session?.user,
      generateState: (action, statePayload?: unknown) => {
        const stateObj = {
          action,
          timestamp: new Date().getTime(),
          statePayload
        };
        const stateJson = JSON.stringify(stateObj);
        const base64State = Buffer.from(stateJson).toString('base64');
        let encodedState = encodeURIComponent(base64State);
        set({ oauth_state: encodedState });
        return encodedState;
      },
      compareState: (state: string) => {
        state = decodeURIComponent(state);
        const storedState = decodeURIComponent(get().oauth_state);
        let isSuccess = state === storedState;
        const decodedState = Buffer.from(state, 'base64').toString('utf-8');
        const stateObj: {
          action: string;
          timestamp: number;
          statePayload: unknown;
        } = JSON.parse(decodedState);
        set({ oauth_state: undefined });
        return {
          isSuccess,
          ...stateObj
        };
      },
      setLastSigninProvider(provider?: string) {
        set({ lastSigninProvider: provider });
      },
      setProvider: (provider?: OauthProvider) => {
        set({ provider });
      },
      setToken: (token, rememberMe = false) => {
        set({ token });

        if (typeof window !== 'undefined') {
          if (rememberMe) {
            localStorage.setItem('auth_token', token);
            sessionStorage.removeItem('auth_token');
          } else {
            sessionStorage.setItem('auth_token', token);
            localStorage.removeItem('auth_token');
          }
        }
      },
      setWorkSpaceId: (id) => {
        set({ lastWorkSpaceId: id });
      },
      initTokenFromStorage: () => {
        if (typeof window !== 'undefined') {
          const localToken = localStorage.getItem('auth_token');
          if (localToken) {
            set({ token: localToken });
            return;
          }

          const sessionToken = sessionStorage.getItem('auth_token');
          if (sessionToken) {
            set({ token: sessionToken });
          }
        }
      }
    })),
    {
      name: sessionKey
    }
  )
);

export default useSessionStore;
