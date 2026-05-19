let workers =
  JSON.parse(localStorage.getItem('workers')) || [];

let supervisors =
  JSON.parse(localStorage.getItem('supervisors')) || [];

// otomatis isi tanggal hari ini
pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.js';

// ============================
// SAVE FORM
// ============================

function saveFormData(){

  const formData = {

    tanggal:
      document.getElementById('tanggal').value,

    waktuMulai:
      document.getElementById('waktuMulai').value,

    waktuSelesai:
      document.getElementById('waktuSelesai').value,

    rencanaKerja:
      document.getElementById('rencanaKerja').value,

    metodekerja:
      document.getElementById('metodekerja').value,

    jsa:
      document.getElementById('jsa').value,

    alat:
      document.getElementById('alat').value,

    penjelasan:
      document.getElementById('penjelasan').value,

    APDtambahan:
      document.getElementById('APDtambahan').value

  };

  // simpan checkbox

  document
    .querySelectorAll(
      'input[type="checkbox"]'
    )
    .forEach(cb => {

      formData[cb.id] = cb.checked;

    });

  localStorage.setItem(
    'toolboxForm',
    JSON.stringify(formData)
  );

}

// ============================
// LOAD FORM
// ============================

function loadFormData(){

  const saved =
    localStorage.getItem('toolboxForm');

  if(!saved) return;

  const data = JSON.parse(saved);

  // restore input

  if(data.tanggal)
    document.getElementById('tanggal').value =
      data.tanggal;

  if(data.waktuMulai)
    document.getElementById('waktuMulai').value =
      data.waktuMulai;

  if(data.waktuSelesai)
    document.getElementById('waktuSelesai').value =
      data.waktuSelesai;

  if(data.rencanaKerja)
    document.getElementById('rencanaKerja').value =
      data.rencanaKerja;

  if(data.metodekerja)
    document.getElementById('metodekerja').value =
      data.metodekerja;

  if(data.jsa)
    document.getElementById('jsa').value =
      data.jsa;

  if(data.alat)
    document.getElementById('alat').value =
      data.alat;

  if(data.penjelasan)
    document.getElementById('penjelasan').value =
      data.penjelasan;

  if(data.APDtambahan)
    document.getElementById('APDtambahan').value =
      data.APDtambahan;

  // restore checkbox

  document
    .querySelectorAll(
      'input[type="checkbox"]'
    )
    .forEach(cb => {

      if(data[cb.id] !== undefined){

        cb.checked = data[cb.id];

      }

    });

}

window.onload = function(){

  loadFormData();

  document.getElementById('tanggal').valueAsDate = new Date();

  document.getElementById('waktuMulai').value = '08:00';
  document.getElementById('waktuSelesai').value = '17:00';

  loadPDFTemplate();

  checkFaceResult();

  renderWorkers();

  renderSupervisors();
}

// ============================
// PREVIEW TEMPLATE PDF
// ============================

async function loadPDFTemplate(){

  const pdf = await pdfjsLib.getDocument('template.pdf').promise;

  const page = await pdf.getPage(1);

  const viewport = page.getViewport({
    scale:1.5
  });

  const canvas = document.getElementById('pdfCanvas');

  const context = canvas.getContext('2d');

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({
    canvasContext:context,
    viewport:viewport
  }).promise;
}

// ============================
// FACE ID
// ============================

function openFaceID(type){

  // arahkan ke web face recognition

  localStorage.setItem('faceTarget', type);

  window.location.href = 'faceid.html';
}

function checkFaceResult(){

  const data = localStorage.getItem('detectedPerson');

  if(!data) return;

  const person = JSON.parse(data);

  const target = localStorage.getItem('faceTarget');

  if(target === 'worker'){

    if(workers.length >= 20){

      alert('Maksimal 20 pekerja');

      return;
    }
    
    workers.push({
      nama:person.name,
      jabatan:person.jabatan
    });

    //SIMPAN KE LOCALSTORAGE
    localStorage.setItem(
      'workers',
      JSON.stringify(workers)
    );

    renderWorkers();

  }

  if(target === 'supervisor'){

    if(supervisors.length >= 10){

      alert('Maksimal 10 petugas');

      return;
    }
    
    supervisors.push({
      nama:person.name,
      jabatan:person.jabatan
    });

    //SIMPAN KE LOCALSTORAGE
    localStorage.setItem(
      'supervisors',
      JSON.stringify(supervisors)
    );

    renderSupervisors();

  }

  localStorage.removeItem('detectedPerson');

}

// ============================
// callback setelah face detect
// ============================

function onFaceDetected(person){

  const target = localStorage.getItem('faceTarget');

  if(target === 'worker'){

    workers.push({
      nama: person.name,
      jabatan: person.jabatan
    });

    localStorage.setItem(
      'workers',
      JSON.stringify(workers)
    );

    renderWorkers();

    alert('Pekerja berhasil ditambahkan');
  }

  if(target === 'supervisor'){

    supervisors.push({
      nama: person.name,
      jabatan: person.jabatan
    });

    localStorage.setItem(
      'supervisors',
      JSON.stringify(supervisors)
    );

    renderSupervisors();

    alert('Petugas berhasil ditambahkan');
  }

  window.location.href = 'index.html';
}

// ============================
// render pekerja
// ============================

function renderWorkers(){

  const tbody = document.querySelector('#workerTable tbody');

  tbody.innerHTML = '';

  workers.forEach((worker,index)=>{

    tbody.innerHTML += `
      <tr>
        <td>${worker.nama}</td>
        <td>${worker.jabatan}</td>
        <td class="faceid-status">OK</td>
        <td>
          <button onclick="deleteWorker(${index})">
            Delete
          </button>
        </td>
      </tr>
    `;
  });
}

function deleteWorker(index){
  const konfirmasi = confirm(
    'Hapus pekerja ini?'
  );

  if(!konfirmasi) return;
  workers.splice(index, 1);
  localStorage.setItem(
   'workers',
    JSON.stringify(workers)
  );
  renderWorkers();
  
}

// ============================
// render supervisor
// ============================

function renderSupervisors(){

  const tbody = document.querySelector('#supervisorTable tbody');

  tbody.innerHTML = '';

  supervisors.forEach((supervisor, index)=>{

    tbody.innerHTML += `
      <tr>
        <td>${supervisor.nama}</td>
        <td>${supervisor.jabatan}</td>
        <td class="faceid-status">OK</td>
        <td>
          <button onclick="deleteSupervisor(${index})">
            Delete
          </button>
        </td>
      </tr>
    `;
  });
}

function deleteSupervisor(index){
  const konfirmasi = confirm(
    'Hapus pengawas ini?'
  );

  if(!konfirmasi) return;
  supervisors.splice(index, 1);
  localStorage.setItem(
   'supervisors',
    JSON.stringify(supervisors)
  );
  renderSupervisors();
  
}

// ============================
// GENERATE PDF
// ============================

async function previewPDF(){

  const { jsPDF } = window.jspdf;

  const existingPdfBytes = await fetch('template.pdf')
    .then(res=>res.arrayBuffer());

  const pdf = await pdfjsLib.getDocument({
    data:existingPdfBytes
  }).promise;

  const page = await pdf.getPage(1);

  const viewport = page.getViewport({
    scale:2
  });

  const canvas = document.createElement('canvas');

  const context = canvas.getContext('2d');

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({
    canvasContext:context,
    viewport:viewport
  }).promise;

  const imgData = canvas.toDataURL('image/png');

  const doc = new jsPDF({
    orientation:'portrait',
    unit:'mm',
    format:'a4'
  });

  doc.addImage(imgData,'PNG',0,0,210,297);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  function tulisTengah(text, x, y){

  doc.text(String(text), x, y, {
    align:'center',
    baseline:'middle'
  });

 }

 function tulisKiri(text, x, y){

  doc.text(String(text), x, y, {
    align:'left',
    baseline:'middle'
  });

 }

 // ============================
 // KOORDINAT TABEL PEKERJA
 // ============================

 let startYLeft = 170;

 let startYRight = 170;

 let rowHeight = 6.8;

 const leftNamaX = 13;
 const leftJabatanX = 58;
 const leftFaceX = 90;

 const rightNamaX = 108;
 const rightJabatanX = 154;
 const rightFaceX = 185;

 // ============================
 // LOOP PEKERJA
 // ============================

  workers.forEach((worker,index)=>{

   if(index < 10){

      let y = startYLeft + (index * rowHeight);

      tulisKiri(worker.nama, leftNamaX, y);

      tulisTengah(worker.jabatan, leftJabatanX, y);

      tulisTengah('DONE', leftFaceX, y);

    }

    else{

      let y = startYRight + ((index - 10) * rowHeight);
      tulisKiri(worker.nama, rightNamaX, y);
      tulisTengah(worker.jabatan, rightJabatanX, y);
      tulisTengah('DONE', rightFaceX, y);

    }
  });

 // ============================
 // KOORDINAT SUPERVISOR
 // ============================

 let supervisorStartYLeft = 249;

 let supervisorStartYRight = 249;

 let supervisorRowHeight = 6.8;

 // kiri
 const supervisorLeftNamaX = 13;
 const supervisorLeftJabatanX = 58;
 const supervisorLeftFaceX = 90;

 // kanan
 const supervisorRightNamaX = 108;
 const supervisorRightJabatanX = 154;
 const supervisorRightFaceX = 185;

 // ============================
 // LOOP SUPERVISOR
 // ============================

  supervisors.forEach((supervisor,index)=>{

   if(index < 5){

    let y =
      supervisorStartYLeft +
      (index * supervisorRowHeight);

    // NAMA
    tulisKiri(
      supervisor.nama,
      supervisorLeftNamaX,
      y
    );

    // JABATAN
    tulisTengah(
      supervisor.jabatan,
      supervisorLeftJabatanX,
      y
    );

    // FACE ID
    tulisTengah(
      'DONE',
      supervisorLeftFaceX,
      y
    );

    }

   else{

    let y =
      supervisorStartYRight +
      ((index - 5) * supervisorRowHeight);

    // NAMA
    tulisKiri(
      supervisor.nama,
      supervisorRightNamaX,
      y
    );

    // JABATAN
    tulisTengah(
      supervisor.jabatan,
      supervisorRightJabatanX,
      y
    );

    // FACE ID
    tulisTengah(
      'DONE',
      supervisorRightFaceX,
      y
    );

    }

  });


  // ============================
  // INPUT DATA
  // ============================

  const rencanaKerja =
    document.getElementById('rencanaKerja').value || '';

  const tanggalInput =
    document.getElementById('tanggal').value;

  const tgl = new Date(tanggalInput);

  const tanggal =
    String(tgl.getDate()).padStart(2, '0') + '/' +
    String(tgl.getMonth() + 1).padStart(2, '0') + '/' +
    tgl.getFullYear();

  const metodekerja =
    document.getElementById('metodekerja').value || '';
  
  const jsa =
    document.getElementById('jsa').value || '';

  const izinDipilih = [];
    document.querySelectorAll('.izinkerja:checked')
    .forEach(item=>{

      izinDipilih.push(item.value);
      
    });
  
  const APDdipilih = [];
    document.querySelectorAll('.APDyangdipakai:checked')
    .forEach(item=>{

      APDdipilih.push(item.value);
      
    });
  
  function tulisAPD(NamaAPD, x, y){
    if(APDdipilih.includes(NamaAPD)){
      doc.text('YA', x, y, {
        align: 'center'
      });
    }else{
      doc.text('TIDAK', x, y, {
        align: 'center'
      });
    }
  }
  tulisAPD('Helm', 22, 145);
  tulisAPD('Sepatu Safety', 42, 145);
  tulisAPD('Rompi', 63, 145);
  tulisAPD('Kacamata', 84, 145);
  tulisAPD('Sarung Tangan', 105, 145);
  tulisAPD('Penutup Telinga', 127, 145);
  tulisAPD('Masker', 148, 145);
  tulisAPD('Body Harness', 169, 145);
  tulisAPD('Topeng Las', 190, 145);
  
  const alat =
    document.getElementById('alat').value || '';

  const penjelasan =
    document.getElementById('penjelasan').value || '';

  const APDtambahan =
    document.getElementById('APDtambahan').value || '';

  const waktu =
    document.getElementById('waktuMulai').value +
    ' s/d ' +
    document.getElementById('waktuSelesai').value;

  // posisi text di PDF
  doc.text(rencanaKerja, 46, 40.2);

  doc.text(tanggal, 46, 49.2);

  doc.text(waktu, 151, 49.2);

  doc.text(metodekerja, 46, 58.2);
  
  doc.text(jsa, 46, 68.3);

  doc.text(alat, 46, 103.9);

  doc.text(penjelasan, 46, 113.5);

  doc.text(APDtambahan, 56, 150.8);

  doc.setFont('zapfdingbats');
  doc.setFontSize(20);
  
  console.log(izinDipilih);
  
  if(izinDipilih.includes('Kerja Umum')){
    doc.text('3', 56, 78.2);
  }

  if(izinDipilih.includes('Kerja Panas')){
    doc.text('3', 56, 86.2);
  }
  
  if(izinDipilih.includes('Kerja Radiografi')){
    doc.text('3', 56, 94.2);
  }

  if(izinDipilih.includes('Kerja Penggalian')){
    doc.text('3', 99, 78.2);
  }

  if(izinDipilih.includes('Kerja Sandblasting')){
    doc.text('3', 99, 86.2);
  }

  if(izinDipilih.includes('Kerja Pengangkatan')){
    doc.text('3', 99, 94.2);
  }

  if(izinDipilih.includes('Kerja Listrik Berenergi')){
    doc.text('3', 141, 78.2);
  }

  if(izinDipilih.includes('Kerja memasuki ruang terbatas')){
    doc.text('3', 141, 86.2);
  }

  if(izinDipilih.includes('Kerja di ketinggian')){
    doc.text('3', 141, 94.2);
  }

  const pdfBlob = doc.output('blob');

  const pdfUrl = URL.createObjectURL(pdfBlob);

  window.open(pdfUrl,'_blank');

  return pdfBlob;

  doc.save('ToolboxMeeting.pdf');
}

// ============================
// AUTO SAVE
// ============================

document
  .querySelectorAll(
    'input, textarea'
  )
  .forEach(el => {

    el.addEventListener(
      'input',
      saveFormData
    );

    el.addEventListener(
      'change',
      saveFormData
    );

  });

async function submitForm(){

  try{

    // generate pdf blob
    const pdfBlob = await previewPDF();

    const formData = new FormData();

    // convert blob → base64
    const reader = new FileReader();

    reader.readAsDataURL(pdfBlob);

    reader.onloadend = async function(){

      const base64data =
        reader.result.split(',')[1];

      formData.append(
        'file',
        base64data
      );

      const metadata = {

        tanggal:
          document.getElementById('tanggal').value,

        pekerjaan:
          document.getElementById('rencanaKerja').value,

        jumlahPekerja:
          workers.length,

        jumlahPengawas:
          supervisors.length

      };

      formData.append(
        'metadata',
        JSON.stringify(metadata)
      );

      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbxsODawVO3ABJR9Y6RJBiRgisq_ggjTuC7PZMy5mGjvr9n2oqqn0wBDAz73TjD8JNo/exec',
        {
          method:'POST',
          mode:'no-cors',
          body:formData
        }
      );

      alert('Form berhasil disubmit');

      //RESET DATA

      workers = [];
      supervisors = [];

      localStorage.removeItem('workers');
      localStorage.removeItem('supervisors');
      localStorage.removeItem('toolboxForm');

      renderWorkers();
      renderSupervisors();

      document.getElementById('rencanaKerja').value = '';
      document.getElementById('metodekerja').value = '';
      document.getElementById('jsa').value = '';
      document.getElementById('alat').value = '';
      document.getElementById('penjelasan').value = '';
      document.getElementById('APDtambahan').value = '';
      if(
        !document.getElementById('tanggal').value
      ){
        document.getElementById('tanggal').valueAsDate =
          new Date();
      }

      // RESET CHECKBOX

      document
        .querySelectorAll(
          'input[type="checkbox"]'
       )
        .forEach(cb => {

        cb.checked = false;

     });

    };

  }catch(err){

    console.log(err);

    alert('Terjadi error');

  }

}