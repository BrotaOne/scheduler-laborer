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
            }, {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"]
            }    
        ]
    },
    // 模式
    mode: "development",
    resolve: {
        extensions: [".ts",".js"], // 配置ts文件可以作为模块加载
    },
    devtool: "cheap-module-source-map",
    devServer: {
        hot: true, // 热更新
        open: true, // 服务启动后，自动打开浏览器
        port: 8011, // 服务端口
        host: '0.0.0.0', // 服务
        allowedHosts: ['.e3b03v-8011.csb.app'],// 允许 codessandbox
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: '打工人的一天',
            template: 'public/index.html'
        })
    ]
}