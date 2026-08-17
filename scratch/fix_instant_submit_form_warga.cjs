const fs = require('fs');
const path = require('path');

const formWargaPath = path.join(__dirname, '..', 'src', 'FormWarga.jsx');
let formWargaCode = fs.readFileSync(formWargaPath, 'utf8');

const oldFileReadLoop = `    if (filePengantar) {
      const fName = filePengantar.name || 'Surat_Pengantar_RT.pdf';
      fileNames.push(fName);
      const b64 = await readFileAsBase64(filePengantar);
      if (b64) {
        fileDataMap[fName] = b64;
        fileDataMap[fName.trim()] = b64;
        localStorage.setItem('file_b64_' + fName, b64);
      }
    }

    if (filesLain && filesLain.length > 0) {
      for (const f of filesLain) {
        const fName = f.name || 'KTP_KK_Warga.pdf';
        fileNames.push(fName);
        const b64 = await readFileAsBase64(f);
        if (b64) {
          fileDataMap[fName] = b64;
          fileDataMap[fName.trim()] = b64;
          localStorage.setItem('file_b64_' + fName, b64);
        }
      }
    }

    if (filePbb) {
      const fName = filePbb.name || 'Bukti_PBB_Lompoe.pdf';
      fileNames.push(fName);
      const b64 = await readFileAsBase64(filePbb);
      if (b64) {
        fileDataMap[fName] = b64;
        fileDataMap[fName.trim()] = b64;
        localStorage.setItem('file_b64_' + fName, b64);
      }
    }`;

const newFileReadLoop = `    // Fast 0-millisecond Base64 lookup from pre-cached selection
    const getCachedOrRead = async (f) => {
      if (!f) return null;
      const cached = localStorage.getItem('file_b64_' + f.name) || localStorage.getItem('file_b64_' + f.name.trim());
      if (cached) return cached;
      const b64 = await readFileAsBase64(f);
      if (b64) {
        localStorage.setItem('file_b64_' + f.name, b64);
        localStorage.setItem('file_b64_' + f.name.trim(), b64);
      }
      return b64;
    };

    if (filePengantar) {
      const fName = filePengantar.name || 'Surat_Pengantar_RT.pdf';
      fileNames.push(fName);
      const b64 = await getCachedOrRead(filePengantar);
      if (b64) {
        fileDataMap[fName] = b64;
        fileDataMap[fName.trim()] = b64;
      }
    }

    if (filesLain && filesLain.length > 0) {
      await Promise.all(filesLain.map(async (f) => {
        const fName = f.name || 'KTP_KK_Warga.pdf';
        fileNames.push(fName);
        const b64 = await getCachedOrRead(f);
        if (b64) {
          fileDataMap[fName] = b64;
          fileDataMap[fName.trim()] = b64;
        }
      }));
    }

    if (filePbb) {
      const fName = filePbb.name || 'Bukti_PBB_Lompoe.pdf';
      fileNames.push(fName);
      const b64 = await getCachedOrRead(filePbb);
      if (b64) {
        fileDataMap[fName] = b64;
        fileDataMap[fName.trim()] = b64;
      }
    }`;

if (formWargaCode.includes(oldFileReadLoop)) {
    formWargaCode = formWargaCode.replace(oldFileReadLoop, newFileReadLoop);
    fs.writeFileSync(formWargaPath, formWargaCode, 'utf8');
    console.log('Successfully updated FormWarga.jsx instant submit speed optimization!');
}
