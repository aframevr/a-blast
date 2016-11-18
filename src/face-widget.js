/* globals ASHOOTER, MediaStreamTrack, FileReader, Image */

ASHOOTER.faceWidget = {
  deviceId: undefined,
  canvas: null, // where the snapshot of the camera is drawn
  ctx: null,  // canvas.context2d
  video: null,
  stream: null,
  dom: null,
  texture: null // the new texture created
};

// on load, check camera device support and show face widget

window.addEventListener('load', function () {
  var fw = ASHOOTER.faceWidget;

  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    navigator.enumerateDevices = function (callback) {
      navigator.mediaDevices.enumerateDevices().then(callback);
    };
  }
  var canEnumerate = false;
  if (typeof MediaStreamTrack !== 'undefined' && 'getSources' in MediaStreamTrack) {
    canEnumerate = true;
  } else if (navigator.mediaDevices && !!navigator.mediaDevices.enumerateDevices) {
    canEnumerate = true;
  }
  if (!canEnumerate) {
    return;
  }
  if (!navigator.enumerateDevices && window.MediaStreamTrack && window.MediaStreamTrack.getSources) {
    navigator.enumerateDevices = window.MediaStreamTrack.getSources.bind(window.MediaStreamTrack);
  }
  if (!navigator.enumerateDevices && navigator.enumerateDevices) {
    navigator.enumerateDevices = navigator.enumerateDevices.bind(navigator);
  }
  if (!navigator.enumerateDevices) {
    return;
  }

  var hasCamera = false;

  navigator.enumerateDevices(function (devices) {
    devices.forEach(function (_device) {
      if (_device['kind'] && _device.kind === 'videoinput' && _device.label.substr(0, 7) !== 'MMP SDK') {
        fw.deviceId = _device.deviceId;
        hasCamera = true;
      }
    });

    if (!hasCamera) {
      document.getElementById('cameracheck').style.display = 'none';
    }

    fw.dom = document.getElementById('a-shooter-footer');
    fw.show(); //show widget
  });

});

// slide up just the title of the widget and enable drag'n drop
// (there's no hide(), just close() )

ASHOOTER.faceWidget.show = function () {
  var fw = ASHOOTER.faceWidget;
  fw.dom.style.bottom = '';
  fw.dom.className = 'shown';

  fw.enableDragNDrop();
}

// slide up the panel with the webcam image

ASHOOTER.faceWidget.open = function () {
  var fw = ASHOOTER.faceWidget;

  fw.initFaceTextures();

  fw.video = document.createElement('video');
  document.getElementById('camera').appendChild(fw.video);

  var constraints = { audio: false, video: { deviceId: fw.deviceId, width: 640, height: 480 } };
  navigator.mediaDevices.getUserMedia(constraints)
  .then(function (mediaStream) {
    fw.video.srcObject = mediaStream;
    fw.stream = mediaStream;
    fw.video.play();
  })
  .catch(function (err) { console.log(err.name + ': ' + err.message); });

  document.getElementById('closefooter').innerHTML = '&#9013;';
  fw.dom.style.bottom = '0';
};

// slide down panel and hides it

ASHOOTER.faceWidget.close = function () {
  var fw = ASHOOTER.faceWidget;
  if (fw.stream) {
    var tracks = fw.stream.getTracks();
    for (var i in tracks) {
      tracks[i].stop();
    }
  }

  fw.stream = null;
  fw.video.srcObject = null;
  fw.video.parentNode.removeChild(fw.video);
  fw.video = null;
  
  if (parseInt(fw.dom.style.bottom) == 0) {
    fw.dom.style.bottom = '';
    fw.dom.className = 'shown';
    document.getElementById('closefooter').innerHTML = '✖';
  }
  else {
    fw.dom.style.bottom = '-450px';
  }

  fw.disableDragNDrop();
};

// take photo from video stream

ASHOOTER.faceWidget.snap = function () {
  var fw = ASHOOTER.faceWidget;
  if (!fw.stream) {
    return;
  }

  var canvasW = fw.canvas.width;
  var canvasH = fw.canvas.height;
  var videoW = Math.floor(canvasW * 320 / 240);
  var px = Math.floor((canvasW - videoW) / 2);
  fw.ctx.drawImage(fw.video, px, 0, videoW, canvasH);

  fw.setFaceTexture(0);
};

// initialise temporal canvases and properties

ASHOOTER.faceWidget.initFaceTextures = function () {
  var fw = ASHOOTER.faceWidget;
  if (fw.canvas !== null) return; // already initialised

  fw.canvas = document.createElement('canvas');
  fw.canvas.width = 80;
  fw.canvas.height = 80;
  fw.ctx = fw.canvas.getContext('2d');

  var templateImg = document.getElementById('faceTemplate');
  fw.texture = document.createElement('canvas');
  fw.texture.width = templateImg.width;
  fw.texture.height = templateImg.height;
}

// changes an enemy texture with the new image
// TODO: resetFaceTextures()

ASHOOTER.faceWidget.setFaceTexture = function (textureIndex) {
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

    if (dx * dx + dy * dy > radius) {
      g = 255; // white round border
    } else {
      g = (data[i] + data[i + 1] + data[i + 2]) / 3; // convert to grayscale
      g = Math.floor(g / 32) * 32; // posterize
    }

    data[i] = g;
    data[i + 1] = g;
    data[i + 2] = g;
  }

  fw.ctx.putImageData(imageData, 0, 0);

  var templateImg = document.getElementById('faceTemplate');
  var c = fw.texture.getContext('2d');
  c.imageSmoothingEnabled = false;
  c.globalCompositeOperation = 'normal';
  c.drawImage(templateImg, 0, 0);
  c.globalCompositeOperation = 'multiply';
  c.drawImage(fw.canvas, fw.texture.width - 512, fw.texture.height - 512, 512, 512);

  // TODO: >>> change actual texture here! : textures[textureIndex] = fw.texture
}


// Drag'n drop support of image files

ASHOOTER.faceWidget.enableDragNDrop = function () {
  var dropArea = document.body;
  dropArea.addEventListener('dragover', ASHOOTER.faceWidget.onDragOver, false);
  dropArea.addEventListener('drop', ASHOOTER.faceWidget.onDrop, false);
}

ASHOOTER.faceWidget.disableDragNDrop = function () {
  var dropArea = document.body;
  dropArea.removeEventListener('drop', ASHOOTER.faceWidget.onDrop);
}

ASHOOTER.faceWidget.onDragOver = function (event) {
  event.stopPropagation();
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
}

ASHOOTER.faceWidget.onDrop = function (event) {
  var fw = ASHOOTER.faceWidget;
  event.stopPropagation();
  event.preventDefault();

  fw.initFaceTextures();

  // for each dropped file, maximum 4 enemies/textures
  var files = event.dataTransfer.files;
  for (var i = 0; i < Math.min(4, files.length); i++) {
    var file = files[i];

    if (file.type.match(/image.*/)) {
      var reader = new FileReader();
      reader.onload = function (event) {
        var img = new Image();
        img.src = event.target.result;

        var imgW = img.width;
        var imgH = img.height;
        var canvasW = fw.canvas.width;
        var canvasH = fw.canvas.height;
        var drawW, drawH, drawX, drawY;

        if (imgW >= imgH) {
          drawW = canvasH * imgW / imgH;
          drawH = canvasH;
          drawX = (canvasW - drawW) / 2;
          drawY = 0;
        } else {
          drawW = canvasW;
          drawH = canvasW * imgH / imgW;
          drawX = 0;
          drawY = (canvasH - drawH) / 2;
        }

        fw.ctx.drawImage(img, drawX, drawY, drawW, drawH);

        fw.setFaceTexture(i);
      };
      reader.readAsDataURL(file);
    }
  }
}
