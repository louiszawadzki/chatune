var canvas = document.getElementById('c');
var canvasContext = canvas.getContext('2d');
cWidth = window.innerWidth;
canvas.width = cWidth;
canvas.height = 400;

var drawWave = function (buf){
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    canvasContext.beginPath();
    canvasContext.moveTo(0,(buf[0]+1)*200);
    var ratio = buf.length/1024;
    for (i=1; i<1024; i++){
        canvasContext.lineTo(cWidth*i/1024,(buf[Math.floor(i/ratio)]+1)*200);
    }
    canvasContext.stroke();
};
