  let notesArray = [];    
  let editModeId = null;
  const noteTitleInput = document.getElementById('noteTitle');
  const noteDescInput = document.getElementById('noteDesc');
  const addNoteBtn = document.getElementById('addNoteBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const notesContainer = document.getElementById('notesContainer');
  const searchInput = document.getElementById('searchInput');
  const formFeedback = document.getElementById('formFeedback');
  
  function saveToLocalStorage() {
    localStorage.setItem('noteIt_notes', JSON.stringify(notesArray));
  }
  
  function loadNotesFromStorage() {
    const stored = localStorage.getItem('noteIt_notes');
    notesArray = stored ? JSON.parse(stored) : [];
    renderNotes(); 
  }
  
  function renderNotes() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    let filteredNotes = [...notesArray];

    if (searchTerm !== '') {
      filteredNotes = notesArray.filter(note => note.title.toLowerCase().includes(searchTerm));
    }

    if (filteredNotes.length === 0) {
      notesContainer.innerHTML = `<div class="empty-state">No notes yet — ${searchTerm ? 'try a different search' : 'create your first note above'}</div>`;
      return;
    }

    let html = '';
    filteredNotes.forEach(note => {
      html += `
        <div class="note-card" data-note-id="${note.id}">
          <div class="note-title">${escapeHtml(note.title) || 'Untitled'}</div>
          <div class="note-desc">${escapeHtml(note.description) || 'No description provided.'}</div>
          <div class="card-actions">
            <button class="edit-btn" data-id="${note.id}">Edit</button>
            <button class="delete-btn" data-id="${note.id}">Delete</button>
          </div>
        </div>
      `;
    });

    notesContainer.innerHTML = html;

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(btn.getAttribute('data-id'));
        startEditNote(id);
        e.stopPropagation();
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(btn.getAttribute('data-id'));
        deleteNoteById(id);
        e.stopPropagation();
      });
    });
  }
  
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }
  
  function handleAddOrUpdateNote() {
    let title = noteTitleInput.value.trim();
    let description = noteDescInput.value.trim();

    if (title === "") {
      formFeedback.innerText = "Title cannot be empty!";
      formFeedback.style.color = "#b91c1c";
      setTimeout(() => { formFeedback.innerText = ""; }, 1800);
      return;
    }
    
    if (editModeId !== null) {
      const index = notesArray.findIndex(n => n.id === editModeId);
      if (index !== -1) {
        notesArray[index] = { ...notesArray[index], title: title, description: description };
        saveToLocalStorage();
        renderNotes();
        resetForm();
        formFeedback.innerText = "Note updated!";
        formFeedback.style.color = "#6f6258";
        setTimeout(() => { formFeedback.innerText = ""; }, 1500);
      }
    } else {
      const newNote = {
        id: Date.now(),
        title: title,
        description: description
      };
      notesArray.unshift(newNote);  
      saveToLocalStorage();
      renderNotes();
      resetForm();
      formFeedback.innerText = "Note added successfully!";
      formFeedback.style.color = "#6f6258";
      setTimeout(() => { formFeedback.innerText = ""; }, 1500);
    }
  }

  function deleteNoteById(id) {
    notesArray = notesArray.filter(note => note.id !== id);
    saveToLocalStorage();
    if (editModeId === id) {
      resetForm();
    }
    renderNotes();
    formFeedback.innerText = "Note deleted permanently";
    formFeedback.style.color = "#6f655d";
    setTimeout(() => { formFeedback.innerText = ""; }, 1200);
  }
  
  function startEditNote(id) {
    const note = notesArray.find(n => n.id === id);
    if (note) {
      editModeId = id;
      noteTitleInput.value = note.title;
      noteDescInput.value = note.description;
      addNoteBtn.innerText = "Update Note";
      addNoteBtn.style.background = "#5b4f46";
      cancelEditBtn.style.display = 'inline-flex';
      formFeedback.innerText = "Editing mode: Modify and click Update.";
      formFeedback.style.color = "#7a6f66";
      document.querySelector('.notes-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function resetForm() {
    noteTitleInput.value = '';
    noteDescInput.value = '';
    editModeId = null;
    addNoteBtn.innerText = "Add Note";
    addNoteBtn.style.background = "#6f6258";
    cancelEditBtn.style.display = 'none';
    formFeedback.innerText = "";
  }

  function handleSearch() {
    renderNotes();
  }

  function setupSmoothNavigation() {
    const navButtons = document.querySelectorAll('[data-nav]');
    const heroBtn = document.getElementById('heroAddNoteBtn');

    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const sectionId = btn.dataset.nav + '-section';
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    if (heroBtn) {
      heroBtn.addEventListener('click', () => {
        document.getElementById('notes-section').scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => noteTitleInput.focus(), 400);
      });
    }
  }

  addNoteBtn.addEventListener('click', handleAddOrUpdateNote);
  cancelEditBtn.addEventListener('click', resetForm);
  searchInput.addEventListener('input', handleSearch);

  noteTitleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddOrUpdateNote();
    }
  });

  loadNotesFromStorage();
  setupSmoothNavigation();