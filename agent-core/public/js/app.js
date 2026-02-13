document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const statusSection = document.getElementById('status-section');
  const resultSection = document.getElementById('result-section');
  const reportContent = document.getElementById('report-content');
  const progressBar = document.getElementById('progress');
  const statusText = document.getElementById('status-text');

  // Drag & Drop events
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  });

  dropZone.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      handleFile(fileInput.files[0]);
    }
  });

  async function handleFile(file) {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }

    // UI Updates
    dropZone.classList.add('hidden');
    statusSection.classList.remove('hidden');
    resultSection.classList.add('hidden');
    updateStatus('Uploading...', 10);

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      updateStatus('Analyzing document...', 30);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();

      updateStatus('Analysis complete!', 100);
      setTimeout(() => {
        showResult(data.report);
      }, 1000);
    } catch (error) {
      console.error(error);
      updateStatus('Error occurred during analysis.', 0);
      alert('Analysis failed. Check console for details.');
      dropZone.classList.remove('hidden'); // Reset
      statusSection.classList.add('hidden');
    }
  }

  function updateStatus(message, percent) {
    statusText.textContent = message;
    progressBar.style.width = `${percent}%`;
  }

  function showResult(markdown) {
    statusSection.classList.add('hidden');
    resultSection.classList.remove('hidden');
    reportContent.innerText = markdown; // Basic text rendering for now

    // Add a "Start Over" button logic if needed
  }
});
