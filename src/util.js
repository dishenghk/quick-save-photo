var CryptoJS = require('crypto-js');
exports.base64ToUrlSafe = function (v) {
    return v.replace(/\//g, '_').replace(/\+/g, '-');
  }
  
  exports.urlSafeToBase64 = function(v) {
    return v.replace(/\_/g, '/').replace(/\-/g, '+');
  }
  
  // UrlSafe Base64 Encode
  exports.urlsafeBase64Encode = function(jsonFlags) {
    var encoded = new Buffer(jsonFlags).toString('base64');
    return exports.base64ToUrlSafe(encoded);
  }
  
  // UrlSafe Base64 Decode
  exports.urlSafeBase64Decode = function(fromStr) {
    return new Buffer(exports.urlSafeToBase64(fromStr), 'base64').toString();
  }

  exports.hmacSha1 = function(encodedFlags, secretKey) {
    /*
     *return value already encoded with base64
     * */
    var hash = CryptoJS.HmacSHA1(encodedFlags, secretKey);
    return hash.toString(CryptoJS.enc.Base64)
}
exports.uuid = function () {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
}