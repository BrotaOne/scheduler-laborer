import {
    // unstable_IdlePriority as IdlePriority,
    // unstable_ImmediatePriority as ImmediatePriority,
    // unstable_LowPriority as LowPriority,
    // unstable_NormalPriority as NormalPriority,
    // unstable_UserBlockingPriority as UserBlockingPriority,
    unstable_getFirstCallbackNode as getFirstCallbackNode,
    unstable_scheduleCallback as scheduleCallback,
    unstable_shouldYield as shouldYield,
    unstable_cancelCallback as cancelCallback,
    // CallbackNode
} from "scheduler";
import {work, init, Priority, ImmediatePriority } from './renderUI';
import './index.css';


interface State {
    name: string;
    duration: number;
    priority: Priority;
    startTime?: number;
    leftTime?: number;
}

const beginWork = (state: State, didTimeout?: boolean) => {
    const needSync = state.priority === ImmediatePriority || didTimeout;
    let newState: State = state;
    while (newState.name === state.name && (needSync || !shouldYield())) {
        // 真正工作的代码
        newState = work(newState);
        console.log('loop', newState);
    }
    scheduleCallback(newState.priority,  beginWork.bind(null, newState))
}

const cancelWork = () => {
    let work = getFirstCallbackNode();
    while (work) {
        cancelCallback(work);,
        const newWork = getFirstCallbackNode();
        if (work === newWork) {
            break;
        }
        work = newWork;
    }
};

const bindWork = (state: State) => {
    const { priority } = state;
    if (beginWork) {
        scheduleCallback(priority, beginWork.bind(null, { ...state }));
    }
}

const keepWork = (state: State) => {
    let workState = state;
    while (workState.name === state.name) {
        workState = work(workState);
    }
}

window.addEventListener(
    'DOMContentLoaded',
    init.bind(
        null,
        {
            id: '#state-button',
            bindWork,
            cancelWork
        }
    )
);

window.addEventListener(
    'DOMContentLoaded',
    init.bind(
        null,
        {
            id: '#slow-button',
            bindWork: keepWork,
            cancelWork
        }
    )
);
