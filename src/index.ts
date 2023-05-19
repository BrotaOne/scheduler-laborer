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
}

const defaultState = { name: '摸鱼', duration: 8 * 1000, priority: NormalPriority };

const stateList: Array<State> = [
    defaultState,
    {name: '吃饭',duration: 1 * 1000, priority: UserBlockingPriority},
    {name: '上厕所',duration: 1 * 1000, priority: UserBlockingPriority},
    {name: '喝水',duration: 1 * 1000, priority: UserBlockingPriority},
    {name: '悠闲地工作',duration: 2 * 1000, priority: LowPriority},
    {name: '火急火燎地工作',duration: 1.5 * 1000, priority: UserBlockingPriority},
    {name: '下班', duration: 16 * 1000, priority: ImmediatePriority}
];
let setTimeoutId: number;

const changeState = (state: State) => {
    const stateText = document.querySelector('#state');
    if (stateText) {
        stateText.textContent = `
            状态：${state.name}
            持续时间：${state.duration}
        `;
    }
}

const beginTime = (state: State) => {
    // 切换状态
    if (setTimeoutId) {
        clearTimeout(setTimeoutId);
    }
    const leftTime = state.duration - 100;
    changeState(state);
    setTimeoutId = setTimeout(() => { 
        let newState: State;
        if (leftTime > 0) {
            newState = {
                ...state,
                duration: leftTime
            };
        } else {
            newState = defaultState;
        }
        
        beginTime(newState);
    }, 100)
}

const createButton = (state: State) => {
    const button = document.createElement('button');
    button.textContent = state.name;
    button.onclick = () => {
        const { priority } = state;
        scheduleCallback(priority,  beginTime.bind(null, state))
    }
    return button;
}

const init = () => {
    const buttonContainer = document.querySelector('#state-button')
    stateList.map(state => {
        if (buttonContainer) {
            buttonContainer.appendChild(createButton(state));
        }
    })
}

window.addEventListener('DOMContentLoaded', init);