[toc]
### 1.前言
有没有时常写文章需要引用其他人的图片,但是又还怕他人图片链接失效,所以需要把图片保存下载再上传到图床.非常麻烦    
有没有时常看到他人优秀的知识图谱,亦或者保存不下来的背景图,想一键存储到自己的专属图床.

总结一下,想要做的就是快速保存网页上的图片资源到自己私有的存储容器上.
### 2.技术方案
#### 2.1 定位图片资源
所以如何做到快速获取页面图片资源呢? 
图片资源从远程服务器加载到本地浏览器上的各个过程都可以做一些不同层面的拦截.但是我们需要做到是用户选择想要的图片再来保存,所以定位具体的图片的资源的步骤一定是等待页面加载完成之后的操作.因此,我们需要把目光投向**DOM节点**.  
DOM节点显示图片最常用的方式有以下几种.  
**IMG标签**     
**background属性**  
chrmoe插件可以提供给我一个右击选项新增,所以我们可以通过用户的右击点击事件,去定位到具体承载图片的节点上.
但往往很多时候,冒泡的节点并非是承载图片的节点,例如清除浮动,一切浮起元素等都会引起用户右击事件 并未直接发生在承载图片资源显示的dom上.所以我么需要**上下求索**.

#### 2.2 保存图片到私有存储容器上
这里我选择了七牛云作为我们的图床容器.不管任何品牌对象存储的SDK都没有提供纯JS前端上传方法(安全问题),所以这里我们依旧需要仔细阅读文档.对信息的加密都需要在本地做好.


### 3.CODING
**mainfest.html**

```
{
    "manifest_version": 2,
    "name": "一键图床",
    "version": "1.0.0",
    "description": "右击保存图床",
    "icons":
    {
        "16": "icon.png",
        "48": "icon.png",
        "32": "icon.png",
        "128": "icon.png"
    },
    "background":
    {
        "scripts": ["background.js"]
    },
    "browser_action": 
    {
        "default_icon": "icon.png",
        "default_title": "一键图床",
        "default_popup": "popup.html"
    },
    
    "permissions":
    [
        "contextMenus",
        "notifications",
        "*://*/*",
        "webRequest",
        "webRequestBlocking"
    ],
    "content_scripts": 
    [
        {

            "matches": ["<all_urls>"],
            "js": ["content.js"],
            "run_at": "document_start"
        }
    ],
    
    "homepage_url": "http://www.dishenghk.cn"
}

```
**background.js**   
用户将图片的URL转换为BLOB,上传图片,接受和发送CONTENT的信息.
 

```
const qiniu = require("qiniu-js")
const util=require("./util")
const getUpToken = require("./getUpToken")
const urlToBlob = require("./urlToBlob")
const {sendMessageToNowTab} = require("./sendMessageToTab")
var { logImgHttp, getImglogs } = require("./logImgHttp")
//记录图片请求地址
logImgHttp()


var imglogs = getImglogs()
console.log(imglogs)
//记录来自div背景的图片
let divBackGroundImgUrl=''
chrome.runtime.onMessage.addListener(function(request)
{
    if (request.messageType == 'logBackImageUrl') {
        divBackGroundImgUrl=request.value
    }
    
});
chrome.contextMenus.create({
    title: "复制图片地址",
    contexts: ['all'],
    onclick: (e) => {
        let srcUrl = e.srcUrl || divBackGroundImgUrl
        divBackGroundImgUrl=''
        if (!srcUrl) {
            chrome.notifications.create(null, {
                type: 'basic',
                iconUrl: 'icon.png',
                title: '图床提示',
                message: '没有找到图片哦'
            });
            return
        }
        //对于一些特殊的URL格式做处理
        srcUrl = srcUrl.replace('"', '').replace("'", '')
        if (srcUrl.startsWith('//')) {
            srcUrl='http:'+srcUrl
        }
        sendMessageToNowTab({ messageType: "copyDate", value: srcUrl }, function (repsonse) {
            chrome.notifications.create(null, {
                type: 'basic',
                iconUrl: 'icon.png',
                title: '图床提示',
                message: '图片远程地址复制成功',
                contextMessage:srcUrl 
            });         
        })

    }
})
chrome.contextMenus.create({
    title: "保存图片到云端",
    contexts:["all"],
    onclick: function (e) {
        console.log(e)
        let srcUrl = e.srcUrl || divBackGroundImgUrl
        divBackGroundImgUrl=''
        if (!srcUrl) {
            chrome.notifications.create(null, {
                type: 'basic',
                iconUrl: 'icon.png',
                title: '图床提示',
                message: '没有找到图片哦'
            });
            return
        }
        srcUrl = srcUrl.replace('"', '').replace("'", '')
        if (srcUrl.startsWith('//')) {
            srcUrl='http:'+srcUrl
        }
        const nowDate = new Date()
        const fileName=`${nowDate.getFullYear()}/${nowDate.getMonth()+1}/${nowDate.getDate()}/${util.uuid()}.png`
        const putPolicy = {
            scope: "tuchuang:"+fileName,
            deadline:3600+Math.round(new Date().getTime()/1000),
            returnBody:
                '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}'
        }
        const token = getUpToken(putPolicy)
        urlToBlob(srcUrl, (blob) => {
            var observable = qiniu.upload(blob, fileName, token)
            var subscription = observable.subscribe({
                next: (response) => {
                    console.log(response)
                },
                complete: (response) => {
                    sendMessageToNowTab({ messageType: "copyDate", value: `http://tuchuang.dishenghk.cn/${response.key}` }, function (repsonse) {
                        chrome.notifications.create(null, {
                            type: 'basic',
                            iconUrl: 'icon.png',
                            title: '图床提示',
                            message: '保存成功,地址已经被复制',
                            contextMessage:`http://tuchuang.dishenghk.cn/${response.key}` 
                        });
                    })
                }
            }) // 上传开始
        })


    }
});

```
**content.js**  
注入到用户界面的JS.

```
chrome.runtime.onMessage.addListener(function(request,sneder,sendResponse)
{
    if (request.messageType == 'copyDate') {
        navigator.clipboard.writeText(request.value)
        .then(() => {
            console.log('文本已经成功复制到剪切板');
            sendResponse("xxx")
        })
        .catch(err => {
          console.error('无法复制此文本：', err);
        });
        
    }
    
});
document.onmousedown = (e) => {
    const { backgroundImage } = e.target.style
    const { target } = e
    if (backgroundImage) {
        backgroundImage.match(/url\((?:"|')(.+)(?:"|')\)/g)
        if (RegExp.$1) {
            console.log(RegExp.$1)
            sendBackImageUrl(RegExp.$1)
            return 
        }
    }
    //往下检查子节点是否存在img标签
    let firstImgNode = new Object()
    findImg(target, firstImgNode, 1)
    if (firstImgNode && firstImgNode.currentSrc) {
        sendBackImageUrl(firstImgNode.currentSrc)
        return
    }    


}
function sendBackImageUrl(image){
    chrome.runtime.sendMessage(
        {messageType:"logBackImageUrl",value:image}
    )
}
//递归找到第一个img标签
function findImg(nowNode, imgNode, deep = 0) {
    if (imgNode.currentSrc) return 
    //对于伪元素顶起高度时点击事件落到::after 上的优化
    if (nowNode.nodeName.toLowerCase().indexOf("text") !== -1 && deep==1) {
        nowNode=nowNode.parentNode
    }
    const { childNodes } = nowNode
    for (let i = 0; i < childNodes.length && !imgNode.currentSrc; i++){
        let node = childNodes[i]
        if (node.nodeName.toLowerCase().indexOf("img") !== -1) {
            imgNode.currentSrc=node.currentSrc
            break
        }
        if (node.childNodes.length) {
            findImg(node,imgNode)
        }
    }
    return 
}
```

### 4.打包程序
上面分享了主要的两个插件规范所必须的JS主文件,但是实际上插件也不支持ES moudle,所以我们需要打包我们的模块为UMD形式.这里我们选择rollup来打包的我们的插件.

```
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import copy from "rollup-copy-plugin"

const packages = require('./package.json');

const ENV = process.env.NODE_ENV;
export default [
    {
        input: 'src/background.js',
        output: {
            file: `dist/background.js`,
            format: 'umd',
            name: 'bundle-name'
        },
        plugins: [
            resolve(),
            commonjs(),
            babel({
                exclude: 'node_modules/**',
                runtimeHelpers: true,
            })
        ],
    },
    {
        input: 'src/content.js',
        output: {
            file: `dist/content.js`,
            format: 'umd',
            name: 'content-name'
        },
        plugins: [
            resolve(),
            commonjs(),
            babel({
                exclude: 'node_modules/**',
                runtimeHelpers: true,
            })
        ],
    },
    {
        input: "src/popup.js",
        output: {
            file: "dist/popup.js",
            format: "umd",
            name:"popup=name"
        },
        plugins: [
            resolve(),
            commonjs(),
            babel({
                exclude: 'node_modules/**',
                runtimeHelpers: true,
            }),
            copy(
                {
                    "src/popup.html":"dist/popup.html"
                }
            )
        ],

        

        
    }
    
]
```

### 5.TODO
- [ ] 对于程序的精简优化
- [ ] 图床管理页面,配置密钥界面.
- [ ] 引入插件化,支持多品牌对象存储.



### 6.使用办法
https://gitee.com/dishenghk/tuchuang    
clone代码后修改 getUpToken.js 中的密钥,然后执行roollup 命令打包文件到dist中,浏览器加载dist文件夹即可.


