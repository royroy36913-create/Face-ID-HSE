const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const statusText = document.getElementById('statusText');

let currentFacingMode = 'user';
let currentStream = null;

let success = false;
let detectInterval = null;

// ============================
// LOAD DATABASE DARI GOOGLE SHEETS
// ============================

// ganti dengan URL Web App Apps Script Anda
const SHEET_API = 'https://script.google.com/macros/s/AKfycbzlheT-MYZu6kr2ODHe0u4aHUuN-aBDndW7oQDINuW9SgNPhc7jzu37hT5pERrRC_Bp/exec';

let registeredFaces = [];

async function loadDatabase(){

  const response = await fetch(SHEET_API);

  const data = await response.json();

  registeredFaces = data.map(item=>({

    name:item.Nama,
    jabatan:item.Jabatan,

    // descriptor disimpan dalam bentuk array JSON
    descriptor:new Float32Array(
      JSON.parse(item.Descriptor)
    )

  }));

  console.log('Database wajah loaded');
  console.log(registeredFaces);

}

// ============================
// LOAD MODEL AI
// ============================

async function loadModels(){

  await faceapi.nets.tinyFaceDetector.loadFromUri('models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('models');

  await startCamera();

}

// ============================
// START CAMERA
// ============================

async function startCamera(){
  
  //stop kamera lama
  if(detectInterval){
    clearInterval(detectInterval);
  }

  if(currentStream){
    currentStream.getTracks().forEach(track=>{
        track.stop();
    });
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video:{
      facingMode: currentFacingMode
    }
  });

  currentStream = stream;

  video.srcObject = stream;

}

// ============================
// DETEKSI REALTIME
// ============================

video.addEventListener('play', async ()=>{

  await loadDatabase();

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const displaySize = {
    width:video.videoWidth,
    height:video.videoHeight
  };

  faceapi.matchDimensions(canvas, displaySize);

  detectInterval = setInterval(async ()=>{

    if(success) return;

    const detection = await faceapi
      .detectSingleFace(
        video,
        new faceapi.TinyFaceDetectorOptions()
      )
      .withFaceLandmarks()
      .withFaceDescriptor();

    const context = canvas.getContext('2d');

    context.clearRect(0,0,canvas.width,canvas.height);

    if(detection){

      const resized = faceapi.resizeResults(
        detection,
        displaySize
      );

      faceapi.draw.drawDetections(canvas,[resized]);

      // MATCH FACE

      for(let person of registeredFaces){

        if(!person.descriptor) continue;

        const distance = faceapi.euclideanDistance(
          detection.descriptor,
          person.descriptor
        );

        // semakin kecil semakin mirip
        console.log(person.name);
        console.log(person.descriptor);
        console.log(distance);
        
        
        if(distance < 0.45){

          success = true;

          document.getElementById('nama').innerText = person.name;
          document.getElementById('jabatan').innerText = person.jabatan;

          document.getElementById('successIcon').style.display = 'block';

          statusText.innerText = 'Wajah berhasil dikenali';

          // kirim data ke form utama

          const detectedPerson = {
            name:person.name,
            jabatan:person.jabatan
          };

          localStorage.setItem(
            'detectedPerson',
            JSON.stringify(detectedPerson)
          );

          // kembali ke form toolbox

          setTimeout(()=>{

            window.location.href = 'index.html';

          },1500);

          break;
        }
      }

    }

  },500);

});

loadModels();

document
  .getElementById('switchCameraBtn')
  .addEventListener('click', async ()=>{

    success = false;

    // switch mode

    if(currentFacingMode === 'user'){

      currentFacingMode = 'environment';

    }else{

      currentFacingMode = 'user';

    }

    // restart camera

    await startCamera();

});