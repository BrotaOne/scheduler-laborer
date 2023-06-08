declare module "scheduler" {
  export type PriorityLevel = 0 | 1 | 2 | 3 | 4 | 5;
  export const unstable_IdlePriority: 5;
  export const unstable_ImmediatePriority: 1;
  export const unstable_LowPriority: 4;
  export const unstable_NormalPriority: 3;
  export const unstable_UserBlockingPriority: 2;
  type Callback = (didTimeout: boolean) => Callback | void;
  export type Task = {
    id: number;
    callback: Callback;
    priorityLevel: PriorityLevel;
    // priorityLevel: 0 | 1 | 2 | 3 | 4 | 5;
    startTime: number;
    expirationTime: number;
    sortIndex: number;
  };

  export const unstable_getFirstCallbackNode: () => Task;
  export const unstable_scheduleCallback: (
    priorityLevel: PriorityLevel,
    callback: Callback,
    options?: {
      delay: number;
    }
  ) => Task;
  export const unstable_shouldYield: () => boolean;
  export const unstable_cancelCallback: (task: Task) => void;

  export type CallbackNode = Task;
}
