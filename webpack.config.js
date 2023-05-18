// 引入路径模块
const path = require("path");
const  HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    // 从哪里开始编译
    entry: "./src/index.ts",
    // 编译到哪里
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "bundle.js"
    },
    // 配置模块规则
    module: {
        rules: [
            {
                test: /\.tsx?$/,    // .ts或者tsx后缀的文件，就是typescript文件
                use: "ts-loader",   // 就是上面安装的ts-loader
                exclude: "/node-modules/" // 排除node-modules目录
            }
        ]
    },
    // 模式
    mode: "development",
    resolve: {
        extensions: [".ts"], // 配置ts文件可以作为模块加载
    },
    devtool: "cheap-module-source-map",
    devServer: {
        // hot: true, // 热更新
        open: true, // 服务启动后，自动打开浏览器
        // useLocalIp: true, // 是否在打包的时候使用自己的 IP
        // contentBase: path.resolve(__dirname, 'dist'), // 热启动文件所指向的文件目录
        port: 8011, // 服务端口
        host: '0.0.0.0', // 服务
        historyApiFallback: true, // 找不到的都可替换为 index.html
        // proxy: { // 后端不帮我们处理跨域，本地设置代理
        //     '/api': 'http://localhost:3000', // 接口中有 '/api' 时代理到 'http://localhost:3000'
        // },
        // https: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: '打工人的一天',
            template: 'public/index.html'
        })
    ]
}