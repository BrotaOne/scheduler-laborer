declare module 'scheduler' {
    export type PriorityLevel = 0 | 1 | 2 | 3 | 4 | 5;
    export const unstable_IdlePriority: 5;
    export const unstable_ImmediatePriority: 1;
    export const unstable_LowPriority: 4;
    export const unstable_NormalPriority: 3;
    export const unstable_UserBlockingPriority: 2;
    export type Task = {
        id: number;
        callback: any;
        priorityLevel: PriorityLevel;
        // priorityLevel: 0 | 1 | 2 | 3 | 4 | 5;
        startTime: number;
        expirationTime: number;
        sortIndex: number;
    };

    export const unstable_getFirstCallbackNode: () => Task;
    export const unstable_scheduleCallback: (priorityLevel: PriorityLevel, callback: any, options?: any)=> Task;
    export const unstable_shouldYield: () => boolean;
    export const unstable_cancelCallback: (task: any) => void;

    export type CallbackNode = Task;
}