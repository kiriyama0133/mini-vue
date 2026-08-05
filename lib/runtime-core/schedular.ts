//lib/runtime-core/schedular.ts

const queue: Array<() => void> = [];
let isFlushPending = false;
const resolvedPromise = Promise.resolve();
function flushJobs() {
  isFlushPending = false;
  const copy = queue.slice();
  queue.length = 0;
  for (const job of copy) {
    job();
  }
}
export function queueJob(job: () => void) {
  if (!queue.includes(job)) {
    queue.push(job);
  }
  if (!isFlushPending) {
    isFlushPending = true;
    resolvedPromise.then(flushJobs);
  }
}
