# 一、使用

## 1、本机

运行以下命令

```
pnpm i
pnpm dev
```

访问 localhost:8081

## 2、dokcer

制作 images，name 为镜像名，tag 为版本号

```
docker build -t [name]:[tag] .
```

运行镜像

```
docker run -p [port]:80  [name]:[tag]
```



访问 localhost:[port] 即可



二、学习

参考 [React Scheduler 学习](./React Scheduler 学习)