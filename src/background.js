import {qiniuUploadForUrl,qiniuUploadForfile} from "./qiniu-oss"
import {sendMessageToNowTab,dataURLtoBlob } from "./utils"
//记录图片请求地址
// logImgHttp()


// var imglogs = getImglogs()
//记录来自div背景的图片
let divBackGroundImgUrl=''
chrome.runtime.onMessage.addListener(function(request)
{
    if (request.messageType == 'logBackImageUrl') {
        divBackGroundImgUrl=request.value
    }
    if(request.messageType==="uploadImageFile"){
        //上传request.value
        qiniuUploadForfile(dataURLtoBlob(request.value)).then(response=>{
            sendMessageToNowTab({ messageType: "copyDate", value: `http://tuchuang.dishenghk.cn/${response.key}` }, function (repsonse) {
                chrome.notifications.create(null, {
                    type: 'basic',
                    iconUrl: 'icon.png',
                    title: '图床提示',
                    message: '保存成功,地址已经被复制',
                    contextMessage:`http://tuchuang.dishenghk.cn/${response.key}` 
                });
            })
        })
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
        qiniuUploadForUrl(srcUrl).then(response=>{
            sendMessageToNowTab({ messageType: "copyDate", value: `http://tuchuang.dishenghk.cn/${response.key}` }, function (repsonse) {
                chrome.notifications.create(null, {
                    type: 'basic',
                    iconUrl: 'icon.png',
                    title: '图床提示',
                    message: '保存成功,地址已经被复制',
                    contextMessage:`http://tuchuang.dishenghk.cn/${response.key}` 
                });
            })
        })
    }
});

// window.document.addEventListener('paste', function (event) {
//     var items = event.clipboardData && event.clipboardData.items;
//     var file = null;
//     console.log("paste")
//     if (items && items.length) {
//         // 检索剪切板items
//         for (var i = 0; i < items.length; i++) {
//             if (items[i].type.indexOf('image') !== -1) {
//                 file = items[i].getAsFile();
//                 qiniuUploadForfile(file).then(response=>{
//                     sendMessageToNowTab({ messageType: "copyDate", value: `http://tuchuang.dishenghk.cn/${response.key}` }, function (repsonse) {
//                         chrome.notifications.create(null, {
//                             type: 'basic',
//                             iconUrl: 'icon.png',
//                             title: '图床提示',
//                             message: '保存成功,地址已经被复制',
//                             contextMessage:`http://tuchuang.dishenghk.cn/${response.key}` 
//                         });
//                     })
//                 })
//                 break;
//             }
//         }
//     }
// });