const imgLogs = new Map();
function logImgHttp() {
    chrome.webRequest.onBeforeRequest.addListener((details) => {
        let tabImgLogs=null
        if (imgLogs.has(details.tabId)) {
            tabImgLogs=imgLogs.get(details.tabId)
        } else{
            tabImgLogs = new Set();
            imgLogs.set(details.tabId,tabImgLogs)
        }
        tabImgLogs.add(details.url)
    }, {
            urls: ['*://*/*'],
            types:["image"]
    })
}
function getImglogs() {
    return imgLogs
}
module.exports = {
    logImgHttp,getImglogs
}