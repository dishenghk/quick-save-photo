const { getCurrentTabId } = require("./sendMessageToTab")
console.log('xxx')
getCurrentTabId((tabId) => {
    const backgroundWindow = chrome.extension.getBackgroundPage()
        console.log(backgroundWindow)
    console.log(new Date().getTime())
    const { getImgLogs } = backgroundWindow
    //const imgLogs = chrome.extension.getBackgroundPage().getImgLogs()
    setInterval(() => {
        console.log(chrome.extension.getBackgroundPage())
        console.log(        chrome.extension.getBackgroundPage().imglogs
        )
    },2000)
    // const nowTabImgLogs = imgLogs.get(tabId)
    // const imgArray = [...nowTabImgLogs]
    // const divImgs=document.getElementById("images")
    // //将image插入进body中
    // imgArray.forEach((item) => {
    //     let tmpImg = new Image();
    //     tmpImg.src = item;
    //     tmpImg.onload = () => {
    //         divImgs.appendChild(tmpImg)
    //     }
    // })
})
