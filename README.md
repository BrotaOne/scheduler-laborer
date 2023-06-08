# 一、使用

## 1、本机

运行以下命令

```
pnpm i
pnpm dev
```

访问 [localhost:8011](http://localhost:8011)

## 2、dokcer
访问地址 [localhost:8011](http://localhost:8011)
### dev 模式

好处在于文件变化可以实时感知并生效，本来打算用 VOLUME ，但是发现 ADD 也可以实现
```
docker-compose -f docker-compose.dev.yml up --build
```

运行以下命令，制作镜像并启动容器

```
docker-compose up --build
```

~~制作 images，name 为镜像名，tag 为版本号~~

```
docker build -t [name]:[tag] .
```

~~运行镜像~~

```
docker run -p [port]:80  [name]:[tag]
```

~~访问 localhost:[port] 即可~~

# 二、学习

可以直接访问 [scheduler-laborer](https://brotaone.github.io/scheduler-laborer/) 看效果

参考 [React-Scheduler 学习](./React-Scheduler学习.md)
