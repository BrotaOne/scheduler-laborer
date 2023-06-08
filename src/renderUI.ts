import {
    unstable_IdlePriority as IdlePriority,
    unstable_ImmediatePriority as ImmediatePriority,
    unstable_LowPriority as LowPriority,
    unstable_NormalPriority as NormalPriority,
    unstable_UserBlockingPriority as UserBlockingPriority,
} from "scheduler";
import './index.css';

export { ImmediatePriority };

export type Priority =
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
const maxSigned31BitInt = 1073741823;

const defaultState = { name: '摸鱼', duration: maxSigned31BitInt, priority: LowPriority };

const stateList: Array<State> = [
    defaultState,
    { name: '吃饭',duration: 10, priority: UserBlockingPriority},
    { name: '上厕所', duration: 0.5, priority: ImmediatePriority },
    { name: '喝水', duration: 2, priority: UserBlockingPriority },
    {name: '悠闲地工作',duration: 20, priority: LowPriority},
    {name: '火急火燎地工作',duration: 15, priority: NormalPriority},
    {name: '下班', duration: 20, priority: UserBlockingPriority},
];

export const changeState = (state: State) => {
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

export const work = (state: State): State => { 
    if (!state.startTime) {
        state.startTime = Date.now();
    }
    const startTime = Date.now()
    const leftTime = (state.startTime - startTime) / 1000  + state.duration;
    const unfinished = leftTime > 0;
    const newState = unfinished
        ? {
            ...state,
            leftTime,
        }
        : defaultState;
    changeState(newState);
    return newState;
}

export const createButton = (
    options: {
        state?: State,
        cancelWork?: () => void,
        bindWork?: (state: State) => void
    },
) => {
    const {  cancelWork, state, bindWork } = options;
    const button = document.createElement('button');
    if (state && bindWork) {
        button.textContent = `${state.name} : ${state.priority}/ ${state.duration}`;
        button.onclick = bindWork?.bind(null, state);
    } else if (cancelWork) {
        button.textContent ='取消任务';
        button.onclick = cancelWork;
    }
    return button;
}

export const init = ({
    id,
    cancelWork,
    bindWork
}: {
    id: string,
    cancelWork: () => void,
    bindWork: (state: State) => void
}) => {
    const buttonContainer = document.querySelector(id);
    if (buttonContainer) {
        buttonContainer.appendChild(createButton({
            cancelWork,
        }));
        stateList.map(state => {
            buttonContainer.appendChild(createButton({
                state,
                bindWork,
            }));
        })
    }     
}