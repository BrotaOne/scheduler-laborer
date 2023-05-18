interface State {
    name: string;
    duration: number;
}

const defaultState = { name: '摸鱼', duration: 8 * 1000 };

const stateList: Array<State> = [
    defaultState,
    {name: '吃饭',duration: 1 * 1000},
    {name: '上厕所',duration: 1 * 1000},
    {name: '喝水',duration: 1 * 1000},
    {name: '悠闲地工作',duration: 2 * 1000},
    {name: '火急火燎地工作',duration: 1.5 * 1000},
    {name: '下班', duration: 16 * 1000}
];
let globalState = defaultState;
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

const beginTime = () => {
    // 切换状态
    if (setTimeoutId) {
        clearTimeout(setTimeoutId);
    }
    const state = { ...globalState };
    const leftTime = state.duration - 100;
    setTimeoutId = setTimeout(() => { 
        if (leftTime > 0) {
            globalState = {
                name: state.name,
                duration: leftTime
            };
           
        } else {
            globalState = defaultState;
        }
        changeState(globalState);
        beginTime();
    }, 100)
}

const createButton = (state: State) => {
    const button = document.createElement('button');
    button.textContent = state.name;
    button.onclick = () => {
        changeState(state);
        beginTime()
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