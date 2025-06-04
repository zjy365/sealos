import { stopCoverage } from 'node:v8';

export const GUIDE_LAUNCHPAD_CREATE_KEY = 'frontend.guide.launchpad.create';
export const GUIDE_LAUNCHPAD_GIFT_KEY = 'activity.beginner-guide.launchpad.giveAmount';

export const GUIDE_LAUNCHPAD_DETAIL_KEY = 'frontend.guide.launchpad.detail';

export const templateDeployKey = 'cloud.sealos.io/deploy-on-sealos';
export const PLAN_LIMIT = {
  Hobby: {
    cpu: 16,
    memory: 32,
    storage: -1,
    network: -1,
    nodePort: 100,
    pod: 100,
    log: 30
  },
  Pro: {
    cpu: 128,
    memory: 256,
    storage: -1,
    network: -1,
    nodePort: 100,
    pod: 100,
    log: 30
  },
  Free: {
    cpu: 4, // vcpu
    memory: 8, //G
    storage: 10, // G
    network: 10, // G
    nodePort: 1, // unit
    pod: 4, // unit
    log: 7 // day
  }
};
