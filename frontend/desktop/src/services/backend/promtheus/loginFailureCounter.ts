import { HttpStatusCode } from 'axios';
import { ProviderType } from 'prisma/global/generated/client';
import { Counter } from 'prom-client';
export type TloginFailureMessage =
  | 'failed to get user from k8s'
  | 'internal server error'
  | 'invalid credentials'
  | 'user not found'
  | 'user oauthprovider not found'
  | 'The REGION_UID is undefined'
  | 'user not initialized'
  | 'failed to get user from db'
  | 'user already initialized userUid'
  | 'other region is initializing'
  | 'failed to get email'
  | 'email conflict'
  | 'failed to connect to GitHub'
  | 'failed to get user from GitHub'
  | 'failed to get email from GitHub'
  | 'failed to get user from Google'
  | 'failed to connect to Google';
class LoginFailureCounter {
  private constructor() {}

  public static getInstance(): Counter {
    const globalObj = globalThis as any;
    if (!globalObj.__loginFailureCounter) {
      globalObj.__loginFailureCounter = new Counter({
        name: 'login_failure_total',
        help: 'Total number of login failures',
        labelNames: ['login_method', 'message', 'status_code']
      });
    }
    return globalObj.__loginFailureCounter;
  }
}
export const loginFailureCounter = LoginFailureCounter.getInstance();
