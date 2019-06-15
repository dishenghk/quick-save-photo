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