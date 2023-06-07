// 引入路径模块
const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    // 从哪里开始编译
    entry: "./src/index.ts",
    // 编译到哪里
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'static/[name].[contenthash].js',
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
    mode: "production",
    resolve: {
        extensions: [".ts",".js"], // 配置ts文件可以作为模块加载
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: '打工人的一天',
            template: './public/index.html'
        })
    ]
}