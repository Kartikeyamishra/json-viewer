let editor = null;

window.onload = function () {
  const container = document.getElementById("jsoneditor");
  editor = new JSONEditor(container, {
    mode: 'tree',
    modes: ['tree', 'code', 'text']
  });

  // File upload support
  document.getElementById('file-upload').addEventListener('change', handleFileUpload);

  // Drag & drop support on textarea
  const textarea = document.getElementById('json-input');
  textarea.addEventListener('dragover', e => e.preventDefault());
  textarea.addEventListener('drop', handleFileDrop);
};

// Load raw JSON input to editor with detailed error reporting and highlighting error position
function loadToEditor() {
  const textarea = document.getElementById('json-input');
  const input = textarea.value;
  try {
    const parsed = JSON.parse(input);
    editor.set(parsed);

    // Clear any previous selection
    textarea.setSelectionRange(0, 0);
    textarea.focus();

  } catch (e) {
    let message = e.message;
    let positionMatch = message.match(/at position (\d+)/);
    if (!positionMatch) {
      positionMatch = message.match(/position (\d+)/);
    }

    if (positionMatch) {
      const pos = Number(positionMatch[1]);
      // Calculate line and column for alert
      let lines = input.substring(0, pos).split('\n');
      let lineNumber = lines.length;
      let columnNumber = lines[lines.length - 1].length + 1;

      // Highlight error position in textarea
      textarea.focus();
      textarea.setSelectionRange(pos, pos + 1);

      alert(`Invalid JSON at line ${lineNumber}, column ${columnNumber}:\n${e.message}`);
    } else {
      alert("Invalid JSON:\n" + e.message);
    }
  }
}

// Extract JSON from editor and put it in textarea
function getFromEditor() {
  try {
    const json = editor.get();
    document.getElementById('json-input').value = JSON.stringify(json, null, 2);
  } catch (e) {
    alert('Editor content is not valid JSON.');
  }
}

// Clear textarea and editor
function clearAll() {
  document.getElementById('json-input').value = '';
  editor.set({});
}

// Change the editor's view mode
function changeMode(newMode) {
  try {
    const currentData = editor.get();
    editor.setMode(newMode);
    editor.set(currentData);
  } catch (e) {
    alert("Can't switch mode: " + e.message);
  }
}

// Handle file upload
function handleFileUpload(event) {
  const file = event.target.files[0];
  readJSONFile(file);
}

// Handle drag-drop event
function handleFileDrop(event) {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  readJSONFile(file);
}

// Read content of JSON file
function readJSONFile(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    document.getElementById('json-input').value = e.target.result;
    loadToEditor();
  };
  reader.readAsText(file);
}

// Copy formatted JSON from editor
function copyToClipboard() {
  try {
    const json = editor.get();
    const formatted = JSON.stringify(json, null, 2);
    navigator.clipboard.writeText(formatted)
      .then(() => alert("Copied from viewer"))
      .catch(err => alert("Failed to copy: " + err));
  } catch (e) {
    alert("Editor content is not valid JSON.");
  }
}

// Export JSON as a .json file
function downloadJSON() {
  try {
    const json = editor.get();
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = "data.json";
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    alert("Invalid JSON in editor");
  }
}

// Save JSON to localStorage
function saveToLocal() {
  try {
    const json = editor.get();
    localStorage.setItem("savedJSON", JSON.stringify(json));
    alert("Saved to browser storage");
  } catch (e) {
    alert("Cannot save: Invalid JSON");
  }
}

// Load JSON from localStorage
function loadFromLocal() {
  const saved = localStorage.getItem("savedJSON");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      editor.set(parsed);
    } catch (e) {
      alert("Failed to load saved JSON");
    }
  } else {
    alert("No saved data found");
  }
}

// Toggle dark mode theme
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  document.getElementById('jsoneditor').classList.toggle('dark-editor');
}
