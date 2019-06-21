import { urlSafeBase64Encode ,hmacSha1,base64ToUrlSafe,urlToBlob,uuid,fileToBlob} from "../utils"
import qiniu from "qiniu-js"

import config from "../config"
const {AK,SK}=config;
console.log(AK,SK)
function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}
const urlsafa_base64_encode = function (str) {
    //先url_encode
    return b64EncodeUnicode(str).replace("+","-").replace("/","_")
}
export function getUpToken (putPolicy) {
    let jsonPolicy = JSON.stringify(putPolicy)
    const encodedPutPolicy = urlSafeBase64Encode(jsonPolicy)
    const sign = hmacSha1(encodedPutPolicy, SK)
    const endcodeSign = base64ToUrlSafe(sign)
    const UpToken = AK+":"+endcodeSign+":"+encodedPutPolicy
    return UpToken
}


export function  qiniuUploadForUrl(srcUrl){
    let upUrl= srcUrl.replace('"', '').replace("'", '')
    if (upUrl.startsWith('//')) {
        upUrl='http:'+upUrl
    }
    const nowDate = new Date()
    const fileName=`${nowDate.getFullYear()}/${nowDate.getMonth()+1}/${nowDate.getDate()}/${uuid()}.png`
    const putPolicy = {
        scope: "tuchuang:"+fileName,
        deadline:3600+Math.round(new Date().getTime()/1000),
        returnBody:
            '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}'
    }
    const token = getUpToken(putPolicy);
    return new Promise((resolve,reject)=>{
        urlToBlob(srcUrl, (blob) => {
            var observable = qiniu.upload(blob, fileName, token)
            var subscription = observable.subscribe({
                complete: (response) => {
                    resolve(response)
                }
            })
        })
    })
}
export function qiniuUploadForfile(file){
    const nowDate = new Date()
    const fileName=`${nowDate.getFullYear()}/${nowDate.getMonth()+1}/${nowDate.getDate()}/${uuid()}.png`
    const putPolicy = {
        scope: "tuchuang:"+fileName,
        deadline:3600+Math.round(new Date().getTime()/1000),
        returnBody:
            '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}'
    }
    const token = getUpToken(putPolicy);
    return new Promise((resolve)=>{
        fileToBlob(file,(blob)=>{
            var observable = qiniu.upload(blob, fileName, token)
            var subscription = observable.subscribe({
                complete: (response) => {
                    resolve(response)
                }
            })
        })
        
    })

}