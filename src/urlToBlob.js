const imgUrlToBlob = function (url,callback) {
    var img = new Image();
    //img.crossOrigin = 'use-credentials';
    img.onload = function(){
        var canvas = document.createElement('CANVAS');
        var ctx = canvas.getContext('2d');
        canvas.height = this.height;
        canvas.width = this.width;
        ctx.drawImage(this, 0, 0);
        canvas.toBlob(callback)
        canvas = null; 
    };
    img.src = url;
}

//直接读成blob文件对象
// function getImageBlob (url, callback) {
//     var xhr = new XMLHttpRequest();
//     var img=new Image()
//     xhr.open('get', url, true);
//     xhr.responseType = 'blob';
//     xhr.onload = function () {
//       if (this.status == 200) {
//           imgResponse = this.response;
//           console.log(imgResponse)
//         img.src = URL.createObjectURL(this.response);
//       }
//      };
//     xhr.send();
  
//    img.onload = function () {
//         var canvas = document.createElement('CANVAS');
//         var ctx = canvas.getContext('2d');
//         canvas.height = this.height;
//         canvas.width = this.width;
//         ctx.drawImage(this, 0, 0);
//         canvas.toBlob(callback)
//         canvas = null;
//    }
    
// }
module.exports=imgUrlToBlob