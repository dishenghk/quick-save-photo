export const urlToBlob = function (url,callback) {
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
