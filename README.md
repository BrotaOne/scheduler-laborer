# React Scheduler 学习

**基于 React 18.2.0 版本**

## 一、Scheduler 特点

### 1、简单介绍

`scheduler` 是一个用于浏览器环境下协作调度的包，目前它是 `React` 源码的一部分，主要是在 React 内部使用，官方计划将其更加通用化。

它提供了具有优先级和过期时间的任务调度，保证了任务的执行，同时也不会对页面渲染带来太大影响。

目前 `schedule`r 使用起来还是比较麻烦，仍然需要手写部分调度代码。

### 2、时间切片

`React` 的更新操作做成了一个个任务，塞进了 `timeQueue` 和 `taskQueue`，借助 `MessageChannel`，遍历执行，每个任务执行完，会判断有没有过默认的切片时间，如果没过就会继续执行下一个任务，如果过了，就会调用 `postMessage` 让出线程，等 cpu 再次空闲，再执行 `onmessage` 推入的任务。

### 3、scheduler 的宏任务回调

`Node` 或 `老版IE` 下会使用 `setImmediate` ，如果不存 `setImmediate` ，则使用 `MessageChannel`，  在如果不支持 `MessageChannel` ，会降级到 `setTimeout` 。 

#### setTimeout

执行时机晚，而且嵌套调用会有最小间隔 4ms 设定（不同浏览器存在差异），浪费运行时间

#### requestAnimationFrame

回调函数会在下一次重绘之前执行（只考虑符合HTML标准的浏览器），因此这个回调函数中如果有比较耗时的计算那么势必会阻塞浏览器的重绘，导致失帧而卡顿，而且浏览器并没有规定应该何时渲染页面，所以执行时间不确定。

并且为了提高性能和电池寿命，在大多数浏览器里，当 `requestAnimationFrame` 运行在后台标签页或者隐藏的`<iframe>` 里时，`requestAnimationFrame` 会被暂停调用以提升性能和电池寿命。这对 React 的执行也会有一定的影响。

#### requestIdleCallback

> requestIdleCallback is called only 20 times per second - Chrome on my 6x2 core Linux machine, it's not really useful for UI work。—— from [Releasing Suspense](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Ffacebook%2Freact%2Fissues%2F13206%23issuecomment-418923831)

`requestIdleCallback` 的 FPS 只有 `20`, 这远远低于页面流畅度的要求！(一般 FPS 为 60 时对用户来说是感觉流程的, 即一帧时间为 16.7 ms)，而且存在兼容性问题

#### MessageChannel

目前 18.2.0 异步任务用的是 通道通信（channel messaging），`MessageChannel` 跟 `setTimeout` 一样，也属于宏任务。

```typescript
var channel = new MessageChannel();
channel.port1.onmessage = (e) => {console.log(e.data)}
channel.port2.postMessage('Hello World')
```

### 4、问题

* 为什么有 `timeQueue` 和 `taskQueue` 两个队列？为什么是最小堆？
* 添加任务时， `timeQueue` 和 `taskQueue` 有几种状态？
* 有没有可能 `taskQueue` 为空，同时 `timeQueue` 中的任务没有安排调度？
* 如果传入 `scheduleCallback` 的 `callback` 本身是一个极其耗时的操作，是不是一样会卡住？

我下面的应用至少有一个 bug，但是我没改，因为改了有的东西就看不到了

## 二、简单使用

### 1、背景

这是一个简单的修改、显示打工人状态的网页，打工人有摸鱼、吃饭、上厕所、喝水、悠闲地工作、火急火燎地工作、下班等状态，每个任务有不同的优先级和持续时间，优先级从 1-5，数值越小优先级越高（直接从 `scheduler` 引入），持续时间单位为 秒（为了便于调试，加上了一个取消任务的按钮）。

按钮的显示格式为：任务名：优先级/持续时间，可以直接看出每个任务的信息。

### ![May-22-2023 17-28-50](/Users/gongping01/Downloads/Scheduler.assets/May-22-2023 17-28-50.gif)

任务声明（以摸鱼为例）

```typescript
const defaultState = { 
  name: '摸鱼', 
  duration: maxSigned31BitInt, 
  priority: LowPriority 
};
```

### 2、运行介绍

每个任务第一次运行时，会记录当下的时间，之后每次运行都会比较两次的运行时间差，计算剩余时间（因为 `scheduler` 调度不是延时器，无法直接控制两次运行之间的时间差，因为计算差值，会导致哈任务无法暂停，即使因为高优先级任务不断执行，低优先级任务无法执行，过去的时间也无法重新计算）。

```typescript
export const work = (state: State) => { 
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
```

在 `changeState` 中会根据 `state` 更新视图，关键的执行部分就是按钮绑定的 onclick 事件，在 `beginWork` 中判断了是否是同步任务，是否有剩余时间， `scheduleCallback` 调度的任务可以返回一个任务，并且会继承原先的任务（由于考虑所有的任务执行完成后，自动恢复成摸鱼任务，如果直接返回的话，那摸鱼任务优先级就会变高了）

```typescript
const beginWork = (state: State, didTimeout?: boolean) => {
    const needSync = state.priority === ImmediatePriority || didTimeout;
    let newState: State = state;
    while (newState.name === state.name && (needSync || !shouldYield())) {
        newState = work(newState);
    }
    scheduleCallback(newState.priority,  beginWork.bind(null, newState))
}
```

#### 高优先级 feature

由于任务执行时，会判断是否时同步任务，同步任务会不断 while 循环，导致渲染线程无法获得执行时机，页面卡断，无法渲然页面（上厕所就是 `ImmediatePriority` 任务，运行时页面不会更新试图）。



## 三、源码阅读

### 1、运行流程

`scheduler` 维护了 `timerQueue` 和 `taskQueue`（均为最小堆，便于获取优先级最高的任务），当 `taskQueue` 不为空时，会取出任务执行，执行过程中会判断是否需要继续

当 `taskQueue` 为空时，会判断 `timerQueue` 是否为空

如果要增加任务，需要调 `scheduleCallback(priority, callback(didTimeout));`

![](/Users/gongping01/Downloads/Scheduler.assets/33a4277bd7734ea7a272335bd1e66d82~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)



1. 通过 scheduleCallback 调度新的 callback
   1. 存在 delay，放入 timerQueue
      1. 如果 taskQueue 为空，同时 callback 是开始时间最早的 任务
         1. 取消之前的 timer 回调，并且创建新的
   2. 不存在 delay，放入 taskQueue
      1. 如果没有 task 任务正在调度，也没有任务正在执行
         1. 调度改任务
2. timer 回调执行
   1. 判断 timerQueue 中任务是否过期，加入 taskQueue
   2. 如果没有 task 任务正在调度
      1. 是否有 task 任务需要调度？有的话调度，没有才执行第二步
      2. 是否需要设置 timer 回调
3. 任务调度执行
   1. 取消 timer 回调
   2. 检查 timer 中是否有任务需要插入 taskQueue
   3. 执行任务
   4. 判断是否有剩余任务，是否还有剩余时间
      1. 如果没有剩余时间，有剩余任务，设置新的 task 调度



![img](/Users/gongping01/Downloads/Scheduler.assets/4704c25f23fc47158afe7656b5f6e2be~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

### 2、主要函数

scheduleCallback

shouldYield



## 四、其他

### 1、线上页面

vercel地址：[打工人的一天 (scheduler-laborer-dp23rmkfo-brotaone.vercel.app)](https://scheduler-laborer-dp23rmkfo-brotaone.vercel.app/)

Codes sandbox: [scheduler-laborer/main - CodeSandbox](https://codesandbox.io/p/github/BrotaOne/scheduler-laborer/main?file=/webpack.config.js:1,1&workspaceId=51144849-7844-4340-a304-2a7fdc93390f)

### 2、不足

任务无法暂停

除了 `scheduler` 维护的队列，应用程序可能也需要维护一个队列，避免同样的任务被反复添加

#### 3、参考

[300 行代码实现 React 的调度器 Scheduler - 掘金 (juejin.cn)](https://juejin.cn/post/7171728961473347614)

[不用一行代码，搞懂React调度器原理 - 掘金 (juejin.cn)](https://juejin.cn/post/7046217872833511454)

[100行代码实现React核心调度功能 (qq.com)](https://mp.weixin.qq.com/s?__biz=MzkzMjIxNTcyMA==&mid=2247489391&idx=1&sn=bf420bb9013f0093cd897b1865b62681&chksm=c25e79a8f529f0bea56db9adfb95f4b933982c96afbb9674eda6693e67d591c5b19ce41f0f37&token=1599882398&lang=zh_CN#rd)

![image.png](/Users/gongping01/Downloads/Scheduler.assets/13528958b6804c16a1dafb613d24b8a9~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

