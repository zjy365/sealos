const store: Record<string, ReturnType<typeof polling>[]> = {};
export function cancelPollingsByKey(key: string) {
  const inStore = store[key];
  if (!inStore) return;
  inStore.forEach((polling) => {
    polling.cancel();
  });
  delete store[key];
}
export default function polling<T>(
  fn: () => Promise<T>,
  {
    shouldStop,
    waitTime = 2000,
    key
  }: {
    key: string;
    shouldStop: (data: T) => boolean;
    /** 等待时间 ms */
    waitTime?: ((count: number) => number) | number;
  }
) {
  let cancelled = false;
  const res = {
    result: new Promise<T>((resolve) => {
      let count = 0;
      const callFunction = () => {
        count++;
        const time = typeof waitTime === 'function' ? waitTime(count) : waitTime;
        const next = () => {
          setTimeout(() => {
            if (cancelled) {
              return;
            }
            callFunction();
          }, time);
        };
        fn().then(
          (res) => {
            if (shouldStop(res)) {
              resolve(res);
            } else {
              next();
            }
          },
          () => {
            next();
          }
        );
      };
      callFunction();
    }),
    cancel() {
      cancelled = true;
    }
  };
  if (!store[key]) {
    store[key] = [];
  }
  store[key].push(res);
  return res;
}
