const { urlSafeBase64Encode } = require("./base64")
const { AK,SK}=require("./config")
const util = require("./util")
function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}
const urlsafa_base64_encode = function (str) {
    //先url_encode
    return b64EncodeUnicode(str).replace("+","-").replace("/","_")
}
function getUpToken (putPolicy) {
    let jsonPolicy = JSON.stringify(putPolicy)
    const encodedPutPolicy = urlSafeBase64Encode(jsonPolicy)
    const sign = util.hmacSha1(encodedPutPolicy, Sk)
    const endcodeSign = util.base64ToUrlSafe(sign)
    const UpToken = Ak+":"+endcodeSign+":"+encodedPutPolicy
    return UpToken
}
module.exports=getUpToken
