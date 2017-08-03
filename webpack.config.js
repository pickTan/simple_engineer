/**
 * Created by fynnpeng on 2017/8/1.
 */
const webpack = require('webpack'),
    path = require('path'),
    glob = require('glob'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    ROOTURL = 'entries/*.js',
    DELEURL = 'entries/',
    ENTRIES = getEntry(ROOTURL, DELEURL),
    CHUNKS = Object.keys(ENTRIES),
    ISPORD = process.env.NODE_ENV === 'production' ? true : false,
    OUTPATH = path.resolve(__dirname, ISPORD ? "./dist/" : "./build/");

const config = {
    entry: ENTRIES,
    output: {
        path: OUTPATH,
        filename: ISPORD ? "js/[name].min.js" : "js/[name]_[hash].js",
        chunkFilename: 'js/[name].chunk.js',
        publicPath: ISPORD ? "" : ""  //此处区分生产的路径和测试路径http:cdn.mydomain.com
    },
    module: {
        rules: [
            {
                test: /\.(png|jpg|jpeg|gif|woff|svg|eot|woff2|ttf)$/,
                loaders: 'url?limit=10000&name=/images/[name]_[hash].[ext]'
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                // use:['style-loader','css-loader?importLoaders=1','postcss-loader'],
                use: ExtractTextPlugin.extract(['css-loader?importLoaders=1'])
                // use:['style-loader','css-loader']
                // loaders: ExtractTextPlugin.extract('css-loader','less-loader')

            }
            ,{ test: /\.js[x]?$/,
                use: ['babel-loader'],
                exclude: /node_modules/

            }
        ]
    },
    plugins: [

        new webpack.HotModuleReplacementPlugin(),
        new ExtractTextPlugin('css/[name]_[hash].css', {
            allChunks: true
        }),
    ]
};

CHUNKS.forEach(function(pathname) {
    var template ='./templates/index.html';
    console.log('~~~~~~~~'+pathname);
    var conf = {
        title: 'demo',
        // favicon:path.resolve(__dirname, './app/'+dir+'/images/favicon.ico'), //favicon路径
        filename: pathname+'.html',
        template: template,
        inject: 'body',
        hash:true,
        chunks:['public', pathname]

    }
    config.plugins.unshift(new HtmlWebpackPlugin(conf));
});
config.devtool = 'source-map';

if (ISPORD) {
    config.concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: false
            }
        })
    ])
}
module.exports = config;
/**
 * 获取文件名
 * @param globPath
 * @param pathDir
 * @returns {{}}
 */
function getEntry(globPath, pathDir) {
    var files = glob.sync(globPath);
    var entries = {}, entry, dirname, basename, pathname, extname;
    for (var i = 0; i < files.length; i++) {
        entry = files[i];
        dirname = path.dirname(entry);
        extname = path.extname(entry);
        basename = path.basename(entry, extname);
        pathname = path.join(dirname, basename);
        pathname = pathDir ? pathname.replace(new RegExp('^' + pathDir), '') : pathname;
        entries[pathname] = './' + entry;
    }
    return entries;
}