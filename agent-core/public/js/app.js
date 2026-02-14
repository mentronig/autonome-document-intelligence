document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const navAnalyze = document.getElementById('nav-analyze');
  const navConfig = document.getElementById('nav-config');
  const viewAnalyze = document.getElementById('view-analyze');
  const viewConfig = document.getElementById('view-config');

  // Analyze Elements
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const statusSection = document.getElementById('status-section');
  const resultSection = document.getElementById('result-section');
  const reportViewer = document.getElementById('report-viewer');
  const progressBar = document.getElementById('progress');
  const statusText = document.getElementById('status-text');

  // Language Logic
  const langSelect = document.getElementById('lang-select');

  async function updateLanguage(lang) {
    try {
      const response = await fetch(`./locales/${lang}.json`);
      if (!response.ok) throw new Error(`Could not load language: ${lang}`);
      const t = await response.json();

      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
          el.innerText = t[key];
        }
      });
      localStorage.setItem('adi_lang', lang);
    } catch (err) {
      console.error('Error loading translations:', err);
    }
  }

  // Init Language
  const savedLang = localStorage.getItem('adi_lang') || 'de';
  if (langSelect) {
    langSelect.value = savedLang;
    langSelect.addEventListener('change', (e) => {
      updateLanguage(e.target.value);
    });
    updateLanguage(savedLang);
  }

  const reportTabs = document.querySelectorAll('.tab-btn');
  const analyzeConfigSelect = document.getElementById('analyze-config-select');
  const analyzedFilenameDisplay = document.getElementById('analyzed-filename');

  // Config Elements
  const configSelect = document.getElementById('config-select');
  const btnLoadConfig = document.getElementById('btn-load-config');
  const btnSaveConfig = document.getElementById('btn-save-config');
  const btnAddComponent = document.getElementById('btn-add-component');
  const confBankName = document.getElementById('conf-bankName');
  const confMessages = document.getElementById('conf-messages');
  const componentsList = document.getElementById('components-list');

  // State
  let currentAnalysisResult = null;

  // Initial Load
  loadConfigsList();

  // ...

  async function loadConfigsList() {
    try {
      const res = await fetch('/api/configs');
      const data = await res.json();

      // Reset both dropdowns
      configSelect.innerHTML = '<option value="">Select a profile...</option>';
      if (analyzeConfigSelect) {
        analyzeConfigSelect.innerHTML = '<option value="">-- Select Profile --</option>';
      }

      data.forEach((item) => {
        const filename = typeof item === 'string' ? item : item.filename;
        const displayName = typeof item === 'string' ? item : item.name;

        // Add to Config Editor Dropdown
        const optionConf = document.createElement('option');
        optionConf.value = filename;
        optionConf.textContent = displayName;
        configSelect.appendChild(optionConf);

        // Add to Analyze Dropdown
        if (analyzeConfigSelect) {
          const optionAnalyze = document.createElement('option');
          optionAnalyze.value = filename;
          optionAnalyze.textContent = displayName;
          analyzeConfigSelect.appendChild(optionAnalyze);
        }
      });
    } catch (e) {
      console.error('Failed to load configs', e);
    }
  }


  // --- Navigation Logic ---
  navAnalyze.addEventListener('click', () => switchView('analyze'));
  navConfig.addEventListener('click', () => {
    switchView('config');
    loadConfigsList();
  });

  function switchView(viewName) {
    if (viewName === 'analyze') {
      viewAnalyze.classList.remove('hidden');
      viewConfig.classList.add('hidden');
      navAnalyze.classList.add('active');
      navConfig.classList.remove('active');
    } else {
      viewAnalyze.classList.add('hidden');
      viewConfig.classList.remove('hidden');
      navAnalyze.classList.remove('active');
      navConfig.classList.add('active');
    }
  }

  // --- Analyze Logic (Upload & Reports) ---

  // Drag & Drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
  });
  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) handleFile(fileInput.files[0]);
  });

  async function handleFile(file) {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }

    // Check Configuration Selection
    const selectedConfig = analyzeConfigSelect.value;
    if (!selectedConfig) {
      alert('Please select a Bank Profile configuration before analyzing.');
      return;
    }

    // UI Reset
    dropZone.classList.add('hidden');
    statusSection.classList.remove('hidden');
    resultSection.classList.add('hidden');

    // Show filename in status
    const statusFilename = document.getElementById('status-filename');
    if (statusFilename) statusFilename.textContent = `Analyzing: ${file.name}`;

    updateStatus('Initializing connection...', 0);

    const liveCrList = document.getElementById('live-cr-list');
    if (liveCrList) liveCrList.innerHTML = ''; // Clear previous logs

    // Setup SSE for Progress
    const eventSource = new EventSource('/api/progress');
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.message) {
        if (data.message.startsWith('CR_FOUND:')) {
          const liveCrList = document.getElementById('live-cr-list');
          if (liveCrList) {
            const li = document.createElement('li');
            li.textContent = data.message.replace('CR_FOUND:', '').trim();
            liveCrList.appendChild(li);
            liveCrList.scrollTop = liveCrList.scrollHeight;
          }
        } else {
          // Standard update
          updateStatus(data.message, 50);
        }
      }
    };

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('configName', selectedConfig);

    try {
      updateStatus('Starting upload...', 10);

      const response = await fetch('/api/analyze', { method: 'POST', body: formData });

      if (!response.ok) {
        let errorMessage = 'Analyse fehlgeschlagen.';
        try {
          const errorData = await response.json();
          if (errorData.error) errorMessage = errorData.error;
        } catch (e) {
          console.error('Could not parse error response JSON', e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      currentAnalysisResult = data.data; // Store result

      updateStatus('Analysis complete!', 100);
      setTimeout(() => showResult(file.name), 500); // Pass filename
    } catch (error) {
      console.error(error);
      const userMsg = error.message || 'Ein unbekannter Fehler ist aufgetreten.';

      updateStatus(`FEHLER: ${userMsg}`, 0);
      alert(`Fehler bei der Analyse:\n\n${userMsg}`);

      dropZone.classList.remove('hidden');
      statusSection.classList.add('hidden');
    } finally {
      eventSource.close();
    }
  }

  function updateStatus(message, percent) {
    statusText.textContent = message;
    progressBar.style.width = `${percent}%`;
  }

  function showResult(filename) {
    statusSection.classList.add('hidden');
    resultSection.classList.remove('hidden');

    // Set filename subtitle
    if (analyzedFilenameDisplay && filename) {
      analyzedFilenameDisplay.textContent = `Analyzed File: ${filename}`;
    }

    // Default to Management Report
    renderReport('mgmt');
    updateActiveTab('mgmt');
  }

  // Report Tabs
  reportTabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.tab;
      renderReport(type);
      updateActiveTab(type);
    });
  });

  function updateActiveTab(type) {
    reportTabs.forEach((btn) => {
      if (btn.dataset.tab === type) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  }

  function renderReport(type) {
    if (!currentAnalysisResult) return;
    let content = '';
    switch (type) {
      case 'ba':
        content = currentAnalysisResult.baReport;
        break;
      case 'tech':
        content = currentAnalysisResult.techReport;
        break;
      case 'mgmt':
        content = currentAnalysisResult.mgmtReport;
        break;
    }
    // Parse markdown to HTML using marked.js
    /* global marked */
    reportViewer.innerHTML = marked.parse(content);
  }

  // Report Actions
  const btnCopyReport = document.getElementById('btn-copy-report');
  const btnDownloadReport = document.getElementById('btn-download-report');

  btnCopyReport.addEventListener('click', () => {
    if (!reportViewer.innerText) return;
    navigator.clipboard.writeText(reportViewer.innerText).then(() => {
      const originalText = btnCopyReport.textContent;
      btnCopyReport.textContent = '✅ Copied!';
      setTimeout(() => (btnCopyReport.textContent = originalText), 2000);
    });
  });

  btnDownloadReport.addEventListener('click', () => {
    if (!reportViewer.innerText) return;
    const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
    const blob = new Blob([reportViewer.innerText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${activeTab}_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  });

  const btnNewAnalysis = document.getElementById('btn-new-analysis');
  if (btnNewAnalysis) {
    btnNewAnalysis.addEventListener('click', () => {
      // Reset UI
      resultSection.classList.add('hidden');
      statusSection.classList.add('hidden');
      dropZone.classList.remove('hidden');

      // Clear Data
      currentAnalysisResult = null;
      reportViewer.innerHTML = '';
      if (analyzedFilenameDisplay) analyzedFilenameDisplay.textContent = '';
      if (statusText) statusText.textContent = 'Ready';
      if (progressBar) progressBar.style.width = '0%';
      const liveCrList = document.getElementById('live-cr-list');
      if (liveCrList) liveCrList.innerHTML = '';

      // Reset Input
      fileInput.value = '';
    });
  }

  // --- Configuration Logic ---



  btnLoadConfig.addEventListener('click', async () => {
    const filename = configSelect.value;
    if (!filename) return;
    try {
      const res = await fetch(`/api/configs/${filename}`);
      const config = await res.json();
      populateForm(config);
    } catch {
      alert('Failed to load config');
    }
  });

  btnSaveConfig.addEventListener('click', async () => {
    const filename = configSelect.value || `${confBankName.value || 'new_profile'}.json`;
    const config = scrapeForm();

    try {
      const res = await fetch(`/api/configs/${filename}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        alert('Saved successfully!');
        loadConfigsList(); // Refresh list in case name changed
      }
    } catch {
      alert('Failed to save');
    }
  });

  function populateForm(config) {
    confBankName.value = config.bankName || '';
    confMessages.value = (config.managedMessages || []).join(', ');
    componentsList.innerHTML = '';
    (config.components || []).forEach(addComponentRow);
  }

  function scrapeForm() {
    const components = [];
    document.querySelectorAll('.component-row').forEach((row) => {
      components.push({
        name: row.querySelector('.cmp-name').value,
        type: row.querySelector('.cmp-type').value,
        keywords: row.querySelector('.cmp-keywords').value.split(',').map((s) => s.trim()),
      });
    });

    return {
      bankName: confBankName.value,
      managedMessages: confMessages.value.split(',').map((s) => s.trim()),
      components,
    };
  }

  btnAddComponent.addEventListener('click', () => addComponentRow());

  function addComponentRow(data = {}) {
    const div = document.createElement('div');
    div.className = 'component-row';
    div.innerHTML = `
            <input type="text" class="cmp-name" placeholder="Name" value="${data.name || ''}">
            <select class="cmp-type">
                <option value="fachlich" ${data.type === 'fachlich' ? 'selected' : ''}>Fachlich</option>
                <option value="technisch" ${data.type === 'technisch' ? 'selected' : ''}>Technisch</option>
            </select>
            <input type="text" class="cmp-keywords" placeholder="Keywords" value="${(data.keywords || []).join(', ')}">
            <button class="btn-remove">X</button>
        `;
    div.querySelector('.btn-remove').addEventListener('click', () => div.remove());
    componentsList.appendChild(div);
  }
});
