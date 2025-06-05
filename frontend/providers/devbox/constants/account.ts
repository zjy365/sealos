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
