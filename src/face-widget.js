ASHOOTER.faceWidget = {
  hasCamera: undefined,
  canvas: null,
  ctx: null,
  video: null,
  stream: null,
  dom: null,
  texture: null
};

window.addEventListener('load', function () { 
  checkCameraSupport(initFaceWidget);
  setupDragNDrop();
});


// adapted from http://stackoverflow.com/questions/30047056/is-it-possible-to-check-if-the-user-has-a-camera-and-microphone-and-if-the-permi
function checkCameraSupport(callback) {
  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.enumerateDevices = function(callback) {
          navigator.mediaDevices.enumerateDevices().then(callback);
      };
  }
  var canEnumerate = false;
  if (typeof MediaStreamTrack !== 'undefined' && 'getSources' in MediaStreamTrack) {
      canEnumerate = true;
  } else if (navigator.mediaDevices && !!navigator.mediaDevices.enumerateDevices) {
      canEnumerate = true;
  }
  if (!canEnumerate) return;
  if (!navigator.enumerateDevices && window.MediaStreamTrack && window.MediaStreamTrack.getSources)
      navigator.enumerateDevices = window.MediaStreamTrack.getSources.bind(window.MediaStreamTrack);
  if (!navigator.enumerateDevices && navigator.enumerateDevices)
      navigator.enumerateDevices = navigator.enumerateDevices.bind(navigator);
  if (!navigator.enumerateDevices) return;

  navigator.enumerateDevices(function(devices) {
    devices.forEach(function(_device) {
        if (_device['kind'] && _device.kind === 'video') {
            ASHOOTER.faceWidget.hasCamera = true;
        }
    });
    callback();
  });
}

function initFaceWidget(event) {
  if (!ASHOOTER.faceWidget.hasCamera) {
    document.getElementById('cameracheck').style.display = 'none';
  }
  ASHOOTER.faceWidget.dom = document.getElementById('a-shooter-footer');
}

ASHOOTER.faceWidget.open = function(){
  var fw = ASHOOTER.faceWidget;

  initFaceTextures();

  fw.video = document.createElement('video');
  fw.video.setAttribute('autoplay', 'autoplay');
  document.getElementById('camera').appendChild(fw.video);
  
  var constraints = { audio: false, video: { width: 320, height: 240 } }; 
  navigator.mediaDevices.getUserMedia(constraints)
  .then(function(mediaStream) {
    fw.video.srcObject = mediaStream;
    fw.stream = mediaStream;
  })
  .catch(function(err) { console.log(err.name + ": " + err.message); }); 
}

ASHOOTER.faceWidget.close = function() {
  var fw = ASHOOTER.faceWidget;
  if (fw.stream) {
    var tracks = fw.stream.getTracks();
    for (var i in tracks) {
      tracks[i].stop();
    }
  }
  fw.dom.style.transition = "bottom 0.2s ease-out";
  fw.dom.style.bottom = '-450px';
  window.setTimeout(function (){
    fw.dom.parentNode.removeChild(fw.dom);
  }, 500);

  disableDragNDrop();
}

ASHOOTER.snap = function() {
  var fw = ASHOOTER.faceWidget;
  if (!fw.stream) return;

  var canvasW = fw.canvas.width;
  var canvasH = fw.canvas.height;
  var videoW = Math.floor(canvasW * 320 / 240);
  var px = Math.floor((canvasW - videoW) / 2);
  fw.ctx.drawImage(fw.video, px, 0, videoW, canvasH);

  setFaceTexture();
}


function setupDragNDrop() {
  var dropArea = document.body;
  dropArea.addEventListener('dragover', onDragOver, false);
  dropArea.addEventListener('drop', onDrop, false);
}

function disableDragNDrop() {
  var dropArea = document.body;
  dropArea.removeEventListener('drop', onDrop);
}

function onDragOver(event) {
  event.stopPropagation();
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
}

function onDrop(event) {
  event.stopPropagation();
  event.preventDefault();

  initFaceTextures();

  // for each dropped file
  var files = event.dataTransfer.files;
  for (var i = 0; i < Math.min(4, files.length); i++) {
    var file = files[i];

    if (file.type.match(/image.*/)) {
      reader = new FileReader();
      reader.onload = function (event) {
        var img = new Image();
        img.src = event.target.result;

        var fw = ASHOOTER.faceWidget;
        var imgW = img.width;
        var imgH = img.height;
        var canvasW = fw.canvas.width;
        var canvasH = fw.canvas.height;
        var drawW, drawH, drawX, drawY;
        
        if (imgW >= imgH){
          drawW = canvasH * imgW / imgH;
          drawH = canvasH;
          drawX = (canvasW - drawW) / 2;
          drawY = 0;
        }
        else{
          drawW = canvasW;
          drawH = canvasW * imgH / imgW;
          drawX = 0;
          drawY = (canvasH - drawH) / 2;
        }

        fw.ctx.drawImage(img, drawX, drawY, drawW, drawH);
        
        setFaceTexture(i);
      };
      reader.readAsDataURL(file);
    }
  }
}

function initFaceTextures() {
  var fw = ASHOOTER.faceWidget;
  if (fw.canvas !== null) return;
  fw.dom.style.bottom = '0';
  
  fw.canvas = document.createElement('canvas');
  fw.canvas.width = 80;
  fw.canvas.height = 80;
  fw.ctx = fw.canvas.getContext('2d');

  var templateImg = document.getElementById('faceTemplate');
  fw.texture = document.createElement('canvas');
  fw.texture.width = templateImg.width;
  fw.texture.height = templateImg.height;

  /* debug */
    fw.canvas.style.position = 'absolute';
    fw.canvas.style.top = '0';
    fw.canvas.style.left = '-200px';
    fw.dom.appendChild(fw.canvas);
    fw.texture.style.position = 'absolute';
    fw.texture.style.top = '-530px';
    fw.dom.appendChild(fw.texture);
  /* ------ */

}

function setFaceTexture(textureIndex) {
  var fw = ASHOOTER.faceWidget;
  var canvasW = fw.canvas.width;
  var canvasH = fw.canvas.height;
  var imageData = fw.ctx.getImageData(0, 0, canvasW, canvasH);
  var data = imageData.data;
  var radius = Math.pow(canvasW / 2 - 4, 2);
  var g;
  for (var i = 0; i < data.length; i += 4) {
    var dx = canvasW / 2 - (Math.floor(i / 4) % canvasW);
    var dy = canvasH / 2 - (Math.floor(i / 4 / canvasW));

    if (dx * dx + dy * dy > radius){
      g = 255;
    }
    else {
      g = (data[i] + data[i + 1] + data[i + 2]) / 3;
      g = Math.floor(g / 32) * 32;
    }

    data[i]     = g;
    data[i + 1] = g;
    data[i + 2] = g;
  }

  fw.ctx.putImageData(imageData, 0, 0);
  
  var templateImg = document.getElementById('faceTemplate');
  var c = fw.texture.getContext('2d');
  c.imageSmoothingEnabled = false;
  c.globalCompositeOperation = "normal";
  c.drawImage(templateImg, 0, 0);
  c.globalCompositeOperation = "multiply";
  c.drawImage(fw.canvas, 0, 0, fw.texture.width, fw.texture.height);

  // something like: textures[textureIndex] = faceWidget.texture

  fw.texture.style.display= 'block';
}



