const imgLogs = new Map();
export function logImgHttp() {
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
export function getImglogs() {
    return imgLogs
}
