import {
    unstable_IdlePriority as IdlePriority,
    unstable_ImmediatePriority as ImmediatePriority,
    unstable_LowPriority as LowPriority,
    unstable_NormalPriority as NormalPriority,
    unstable_UserBlockingPriority as UserBlockingPriority,
    unstable_getFirstCallbackNode as getFirstCallbackNode,
    unstable_scheduleCallback as scheduleCallback,
    unstable_shouldYield as shouldYield,
    unstable_cancelCallback as cancelCallback,
    CallbackNode
} from "scheduler";
type Priority =
  | typeof IdlePriority
  | typeof ImmediatePriority
  | typeof LowPriority
  | typeof NormalPriority
  | typeof UserBlockingPriority;

interface State {
    name: string;
    duration: number;
    priority: Priority;
    startTime?: number;
}

const defaultState = { name: '摸鱼', duration: 8, priority: NormalPriority };

const stateList: Array<State> = [
    defaultState,
    {name: '吃饭',duration: 1, priority: UserBlockingPriority},
    {name: '上厕所',duration: 1, priority: UserBlockingPriority},
    {name: '喝水',duration: 1, priority: UserBlockingPriority},
    {name: '悠闲地工作',duration: 2, priority: LowPriority},
    {name: '火急火燎地工作',duration: 1.5, priority: UserBlockingPriority},
    {name: '下班', duration: 16, priority: UserBlockingPriority},
];

const changeState = (state: State) => {
    const stateText = document.querySelector('#state');
    if (stateText) {
        stateText.textContent = `
            状态：${state.name}
            剩余时间：${typeof state.duration === 'number' ? state.duration.toFixed(2): ''}
        `;
    }
}

const work = (state: State) => { 
    if (!state.startTime) {
        console.log('不存在startTime');
        state.startTime = Date.now();
    }
    const startTime = Date.now()
    const leftTime = (state.startTime - startTime) / 1000 / 1000 / 10  + state.duration;
    const unfinished = leftTime > 0;
    const newState = unfinished ? {
        ...state,
        duration: leftTime
    } : defaultState;
    changeState(newState);
    console.log('newState: ', newState, leftTime)
    return newState;
}

const beginTime = (state: State, didTimeout?: boolean) => {
    
    const needSync = state.priority === ImmediatePriority || didTimeout;
    let newState: State = state;
    while (needSync || !shouldYield()) {
        console.log('loop: ',newState)
        newState = work(newState);
    }
    console.log('beginTime newState: ', newState)
    if (newState.name === state.name ) {
        // return beginTime.bind(null, newState, needSync);
        scheduleCallback(newState.priority,  beginTime.bind(null, newState))
    }
    
    // if (leftTime > 0) {
    //     scheduleCallback(state.priority, beginTime.bind(null, {
    //         ...state,
    //         startTime,
    //         duration: leftTime
    //     }))
    // } else {
    //     scheduleCallback(defaultState.priority, beginTime.bind(null, defaultState));
    // }
}

const cancelWork = () => {
    let work = getFirstCallbackNode();
    while (work) {
        cancelCallback(work);
        const newWork = getFirstCallbackNode();
        if (work === newWork) {
            break;
        }
        work = newWork;
        console.log('work: ', work)
    }
};

const createButton = (
    options: { state?: State, onClick?: () => void, textContent?: string },
) => {
    const { textContent, onClick, state } = options;
    const button = document.createElement('button');
    button.textContent = state ?  `${state.name} : ${state.priority}`: textContent ?? '';
    button.onclick = state? function(){
        const { priority } = state;
        scheduleCallback(priority, beginTime.bind(null, { ...state }))
    } : onClick ?? null;
    return button;
}

const init = () => {
    const buttonContainer = document.querySelector('#state-button')
    if (buttonContainer) {
        buttonContainer.appendChild(createButton({
            textContent: '取消任务',
            onClick: cancelWork
        }));
        stateList.map(state => {
            buttonContainer.appendChild(createButton({ state }));
        })
    }     
}

window.addEventListener('DOMContentLoaded', init);