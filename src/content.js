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