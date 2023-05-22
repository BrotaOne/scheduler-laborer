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
import './index.css';

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
    leftTime?: number;
}

// Max 31 bit integer. The max integer size in V8 for 32-bit systems.
// Math.pow(2, 30) - 1
// 0b111111111111111111111111111111
var maxSigned31BitInt = 1073741823;

const defaultState = { name: '摸鱼', duration:  maxSigned31BitInt, priority: LowPriority };

const stateList: Array<State> = [
    defaultState,
    { name: '吃饭',duration: 10, priority: UserBlockingPriority},
    { name: '上厕所', duration: 2, priority: ImmediatePriority },
    { name: '喝水', duration: 2, priority: UserBlockingPriority },
    {name: '悠闲地工作',duration: 20, priority: LowPriority},
    {name: '火急火燎地工作',duration: 15, priority: NormalPriority},
    {name: '下班', duration: 20, priority: UserBlockingPriority},
];

const changeState = (state: State) => {
    const stateText = document.querySelector('#state');
    const outputDom = document.querySelector('#output');
    if (stateText) {
        const statusDom = document.createElement('p');
        statusDom.textContent = `状态：${state.name}`;
        const timeDom = document.createElement('p');
        [...stateText.childNodes].forEach(child => {
            stateText.removeChild(child);
        })
        timeDom.textContent = `剩余时间：${typeof state.leftTime === 'number'
            ? state.leftTime.toFixed(2)
            : ''}`;
        stateText.appendChild(statusDom);
        stateText.appendChild(timeDom);
        if (outputDom) {
            const children = [...outputDom.childNodes];
            if (children.length > 100) {
                outputDom.replaceChildren(...children.slice(0,3))
            }
            const output = document.createElement('p');
            output.textContent = statusDom.textContent + timeDom.textContent;
            outputDom.insertBefore(output, outputDom.firstChild);
        }
    }
}

const work = (state: State) => { 
    if (state.name !== '火急火燎地工作')
        debugger
    if (!state.startTime) {
        state.startTime = Date.now();
    }
    const startTime = Date.now()
    const leftTime = (state.startTime - startTime) / 1000  + state.duration;
    const unfinished = leftTime > 0;
    const newState = unfinished ? {
        ...state,
        leftTime,
    } : defaultState;
    changeState(newState);
    console.log('newState: ', newState, leftTime)
    return newState;
}

const beginTime = (state: State, didTimeout?: boolean) => {
    
    const needSync = state.priority === ImmediatePriority || didTimeout;
    let newState: State = state;
    while (newState.name=== state.name && (needSync || !shouldYield())) {
        // console.log('loop: ', newState)
        newState = work(newState);
    }
    // console.log('beginTime newState: ', newState)
    if (newState.name === state.name) {
        console.log('scheduleCallback: ', newState)
        scheduleCallback(newState.priority,  beginTime.bind(null, newState))
    }
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
    }
};

const createButton = (
    options: { state?: State, onClick?: () => void, textContent?: string },
) => {
    const { textContent, onClick, state } = options;
    const button = document.createElement('button');
    button.textContent = state ?  `${state.name} : ${state.priority}/ ${state.duration}`: textContent ?? '';
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