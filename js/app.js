// Personal Dashboard app

// ─── Storage Utilities ────────────────────────────────────────────────────────

const Storage = {
  // Read a value from localStorage; return fallback if missing or unparseable
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },

  // Write a value to localStorage; warn on quota errors
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      if (err.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded — could not save:', key);
      }
    }
  },
};

// ─── Validation Utilities ─────────────────────────────────────────────────────

// Returns true if value is a string with at least one non-whitespace character
function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

// Returns true if value is a valid http or https URL
function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Returns true if value is an integer within [min, max] (inclusive)
function isInRange(value, min, max) {
  return Number.isInteger(value) && value >= min && value <= max;
}

// Returns true if any task in tasks has text matching the given text (case-insensitive, trimmed)
function isDuplicateTask(text, tasks) {
  const normalized = text.trim().toLowerCase();
  return tasks.some((task) => task.text.trim().toLowerCase() === normalized);
}

// Returns true if any link in links has a label matching the given label (case-insensitive, trimmed)
function isDuplicateLink(label, links) {
  const normalized = label.trim().toLowerCase();
  return links.some((link) => link.label.trim().toLowerCase() === normalized);
}

// ─── Theme Module ─────────────────────────────────────────────────────────────

const Theme = {
  _STORAGE_KEY: 'pd_theme',
  _TOGGLE_BTN_ID: 'theme-toggle',

  // Read stored theme preference, apply data-theme to <html>, default to "light"
  init() {
    const theme = Storage.get(this._STORAGE_KEY, 'light');
    this._apply(theme);
  },

  // Flip between "light" and "dark", persist, and update the DOM
  toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    Storage.set(this._STORAGE_KEY, next);
    this._apply(next);
  },

  // Apply a theme value to the document and update the toggle button
  _apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.getElementById(this._TOGGLE_BTN_ID);
    if (btn) {
      if (theme === 'dark') {
        btn.setAttribute('aria-label', 'Switch to light mode');
        btn.textContent = '☀️ Light mode';
      } else {
        btn.setAttribute('aria-label', 'Switch to dark mode');
        btn.textContent = '🌙 Dark mode';
      }
    }
  },
};

// ─── Clock Module ─────────────────────────────────────────────────────────────

// Returns HH:MM string (zero-padded) for the given Date
function formatTime(date) {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

// Returns a human-readable date string, e.g. "Monday, 14 July 2025"
function formatDate(date) {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Returns a greeting phrase based on the hour (0–23)
function getGreeting(hour) {
  if (hour >= 5 && hour <= 11) return 'Good morning';
  if (hour >= 12 && hour <= 17) return 'Good afternoon';
  if (hour >= 18 && hour <= 21) return 'Good evening';
  return 'Good night'; // 22–23 and 0–4
}

const Clock = {
  _STORAGE_KEY: 'pd_name',
  _intervalId: null,

  // Read stored name, start tick interval, render initial state
  init() {
    const timeEl = document.getElementById('clock-time');
    const dateEl = document.getElementById('clock-date');
    const greetingEl = document.getElementById('clock-greeting');

    if (!timeEl || !dateEl || !greetingEl) {
      console.error('Clock: required DOM elements not found');
      return;
    }

    const form = document.getElementById('name-form');
    const input = document.getElementById('name-input');

    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.setName(input.value);
      });

      // Clear error when user types
      input.addEventListener('input', () => {
        const errorEl = document.getElementById('name-error');
        if (errorEl) errorEl.textContent = '';
      });
    }

    this._tick();
    this._intervalId = setInterval(() => this._tick(), 1000);
  },

  // Validate, persist, and re-render greeting with the new name
  setName(name) {
    const errorEl = document.getElementById('name-error');

    if (!isNonEmptyString(name)) {
      if (errorEl) errorEl.textContent = 'Name cannot be empty.';
      return;
    }

    const trimmed = name.trim();
    Storage.set(this._STORAGE_KEY, trimmed);

    if (errorEl) errorEl.textContent = '';

    const input = document.getElementById('name-input');
    if (input) input.value = '';

    this._render(new Date(), trimmed);
  },

  // Internal tick: update time, date, and greeting in the DOM
  _tick() {
    const now = new Date();
    const name = Storage.get(this._STORAGE_KEY, '');
    this._render(now, name);
  },

  // Render clock state to the DOM
  _render(date, name) {
    const timeEl = document.getElementById('clock-time');
    const dateEl = document.getElementById('clock-date');
    const greetingEl = document.getElementById('clock-greeting');

    if (timeEl) timeEl.textContent = formatTime(date);
    if (dateEl) dateEl.textContent = formatDate(date);

    if (greetingEl) {
      const phrase = getGreeting(date.getHours());
      greetingEl.textContent = name ? `${phrase}, ${name}!` : `${phrase}!`;
    }
  },
};

// ─── Timer Module ─────────────────────────────────────────────────────────────

// Returns MM:SS string (zero-padded) for the given number of seconds
function formatTimer(seconds) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

const Timer = {
  _STORAGE_KEY: 'pd_timer_duration',
  _DEFAULT_DURATION: 25,
  _intervalId: null,
  _remaining: 0,       // seconds remaining
  _duration: 25,       // configured duration in minutes
  _audioCtx: null,     // lazy AudioContext

  // Read stored duration, render initial state, attach event listeners
  init() {
    const displayEl = document.getElementById('timer-display');
    if (!displayEl) {
      console.error('Timer: required DOM element #timer-display not found');
      return;
    }

    this._duration = Storage.get(this._STORAGE_KEY, this._DEFAULT_DURATION);
    this._remaining = this._duration * 60;
    this._updateDisplay();

    const startBtn = document.getElementById('timer-start');
    const stopBtn = document.getElementById('timer-stop');
    const resetBtn = document.getElementById('timer-reset');
    const durationForm = document.getElementById('timer-duration-form');
    const durationInput = document.getElementById('timer-duration-input');

    if (startBtn) startBtn.addEventListener('click', () => this.start());
    if (stopBtn) stopBtn.addEventListener('click', () => this.stop());
    if (resetBtn) resetBtn.addEventListener('click', () => this.reset());

    if (durationForm && durationInput) {
      durationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const mins = parseInt(durationInput.value, 10);
        this.setDuration(mins);
      });

      // Clear error when user types
      durationInput.addEventListener('input', () => {
        const errorEl = document.getElementById('timer-duration-error');
        if (errorEl) errorEl.textContent = '';
      });
    }
  },

  // Begin countdown interval (1000ms ticks)
  start() {
    if (this._intervalId !== null) return; // already running
    if (this._remaining <= 0) return;      // nothing to count down

    this._intervalId = setInterval(() => {
      this._remaining -= 1;
      this._updateDisplay();
      if (this._remaining <= 0) {
        this._finish();
      }
    }, 1000);
  },

  // Clear interval, preserve remaining time
  stop() {
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  },

  // Clear interval, restore to configured duration
  reset() {
    this.stop();
    this._remaining = this._duration * 60;
    this._updateDisplay();

    // Remove flash class if present
    const displayEl = document.getElementById('timer-display');
    if (displayEl) displayEl.classList.remove('timer--flash');
  },

  // Validate and persist a new duration (in minutes), update display
  setDuration(mins) {
    const errorEl = document.getElementById('timer-duration-error');

    if (!isInRange(mins, 1, 120)) {
      if (errorEl) errorEl.textContent = 'Duration must be between 1 and 120 minutes.';
      return;
    }

    if (errorEl) errorEl.textContent = '';

    this._duration = mins;
    Storage.set(this._STORAGE_KEY, mins);

    // Only update remaining time if timer is not running
    if (this._intervalId === null) {
      this._remaining = mins * 60;
      this._updateDisplay();
    }

    const durationInput = document.getElementById('timer-duration-input');
    if (durationInput) durationInput.value = '';
  },

  // Called when countdown reaches 0: stop, beep, flash
  _finish() {
    this.stop();
    this._playBeep();

    const displayEl = document.getElementById('timer-display');
    if (displayEl) displayEl.classList.add('timer--flash');
  },

  // Play a short beep via Web Audio API (lazy init, silently skipped if unavailable)
  _playBeep() {
    try {
      if (!this._audioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        this._audioCtx = new AudioCtx();
      }

      const ctx = this._audioCtx;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.8);
    } catch {
      // Silently skip if Web Audio API is unavailable
    }
  },

  // Update the timer display DOM element
  _updateDisplay() {
    const displayEl = document.getElementById('timer-display');
    if (displayEl) displayEl.textContent = formatTimer(this._remaining);
  },
};

// ─── Todo Module ──────────────────────────────────────────────────────────────

const Todo = {
  _STORAGE_KEY: 'pd_tasks',
  _tasks: [],

  // Load tasks from localStorage, render list, attach add-form listener
  init() {
    const form = document.getElementById('todo-form');
    const list = document.getElementById('todo-list');

    if (!form || !list) {
      console.error('Todo: required DOM elements not found');
      return;
    }

    this._tasks = Storage.get(this._STORAGE_KEY, []);
    this._render();

    const input = document.getElementById('todo-input');
    const errorEl = document.getElementById('todo-error');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (input) this.addTask(input.value);
    });

    if (input && errorEl) {
      input.addEventListener('input', () => {
        errorEl.textContent = '';
      });
    }
  },

  // Validate, deduplicate, append task, persist, re-render
  addTask(text) {
    const errorEl = document.getElementById('todo-error');
    const input = document.getElementById('todo-input');

    if (!isNonEmptyString(text)) {
      if (errorEl) errorEl.textContent = 'Task cannot be empty.';
      return;
    }

    if (isDuplicateTask(text, this._tasks)) {
      if (errorEl) errorEl.textContent = 'A task with this name already exists.';
      return;
    }

    if (errorEl) errorEl.textContent = '';

    const id = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : Date.now().toString();

    this._tasks.push({ id, text: text.trim(), completed: false });
    this._save();
    this._render();

    if (input) input.value = '';
  },

  // Validate, deduplicate (excluding self), update task, persist, re-render
  editTask(id, newText) {
    const taskIndex = this._tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) return;

    if (!isNonEmptyString(newText)) return;

    // Check for duplicates excluding the task being edited
    const otherTasks = this._tasks.filter((t) => t.id !== id);
    if (isDuplicateTask(newText, otherTasks)) return;

    this._tasks[taskIndex].text = newText.trim();
    this._save();
    this._render();
  },

  // Flip completed flag, persist, re-render
  toggleComplete(id) {
    const task = this._tasks.find((t) => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    this._save();
    this._render();
  },

  // Remove task by id, persist, re-render
  deleteTask(id) {
    this._tasks = this._tasks.filter((t) => t.id !== id);
    this._save();
    this._render();
  },

  // Persist current tasks array to Storage
  _save() {
    Storage.set(this._STORAGE_KEY, this._tasks);
  },

  // Render the full task list to the DOM
  _render() {
    const list = document.getElementById('todo-list');
    if (!list) return;

    list.innerHTML = '';

    this._tasks.forEach((task) => {
      const article = document.createElement('article');
      article.classList.add('todo-item');
      article.dataset.id = task.id;

      // Checkbox for complete toggle
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.setAttribute('aria-label', `Mark "${task.text}" as complete`);
      checkbox.addEventListener('change', () => this.toggleComplete(task.id));

      // Task text (normal view)
      const textEl = document.createElement('span');
      textEl.classList.add('todo-item__text');
      textEl.textContent = task.text;
      if (task.completed) textEl.classList.add('todo-task--completed');

      // Inline edit container (hidden by default)
      const editContainer = document.createElement('div');
      editContainer.classList.add('todo-edit-container');
      editContainer.hidden = true;

      const editInput = document.createElement('input');
      editInput.type = 'text';
      editInput.value = task.text;
      editInput.setAttribute('aria-label', 'Edit task text');

      const editError = document.createElement('span');
      editError.classList.add('todo-edit-error');
      editError.setAttribute('aria-live', 'polite');

      const saveBtn = document.createElement('button');
      saveBtn.type = 'button';
      saveBtn.textContent = 'Save';
      saveBtn.classList.add('btn--save');

      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.textContent = 'Cancel';
      cancelBtn.classList.add('btn--cancel');

      editContainer.append(editInput, editError, saveBtn, cancelBtn);

      // Double-click text to edit
      textEl.addEventListener('dblclick', () => {
        textEl.hidden = true;
        editInput.value = task.text;
        editError.textContent = '';
        editContainer.hidden = false;
        editInput.focus();
      });

      editInput.addEventListener('input', () => { editError.textContent = ''; });

      saveBtn.addEventListener('click', () => {
        const newText = editInput.value;
        if (!isNonEmptyString(newText)) {
          editError.textContent = 'Task cannot be empty.';
          return;
        }
        const otherTasks = this._tasks.filter((t) => t.id !== task.id);
        if (isDuplicateTask(newText, otherTasks)) {
          editError.textContent = 'A task with this name already exists.';
          return;
        }
        this.editTask(task.id, newText);
      });

      cancelBtn.addEventListener('click', () => {
        editContainer.hidden = true;
        textEl.hidden = false;
      });

      // Delete button (red, right side)
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.textContent = 'Delete';
      deleteBtn.classList.add('btn--delete');
      deleteBtn.setAttribute('aria-label', `Delete task: ${task.text}`);
      deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

      article.append(checkbox, textEl, editContainer, deleteBtn);
      list.appendChild(article);
    });
  },
};

// ─── Links Module ─────────────────────────────────────────────────────────────

const Links = {
  _STORAGE_KEY: 'pd_links',
  _links: [],

  // Load links from localStorage, render panel, attach add-form listener
  init() {
    const form = document.getElementById('links-form');
    const list = document.getElementById('links-list');

    if (!form || !list) {
      console.error('Links: required DOM elements not found');
      return;
    }

    this._links = Storage.get(this._STORAGE_KEY, []);
    this._render();

    const labelInput = document.getElementById('links-label-input');
    const urlInput = document.getElementById('links-url-input');
    const labelError = document.getElementById('links-label-error');
    const urlError = document.getElementById('links-url-error');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const label = labelInput ? labelInput.value : '';
      const url = urlInput ? urlInput.value : '';
      this.addLink(label, url);
    });

    if (labelInput && labelError) {
      labelInput.addEventListener('input', () => {
        labelError.textContent = '';
      });
    }

    if (urlInput && urlError) {
      urlInput.addEventListener('input', () => {
        urlError.textContent = '';
      });
    }
  },

  // Validate label and url, append link, persist, re-render
  addLink(label, url) {
    const labelError = document.getElementById('links-label-error');
    const urlError = document.getElementById('links-url-error');
    const labelInput = document.getElementById('links-label-input');
    const urlInput = document.getElementById('links-url-input');

    let valid = true;

    if (!isNonEmptyString(label)) {
      if (labelError) labelError.textContent = 'Label cannot be empty.';
      valid = false;
    } else {
      if (labelError) labelError.textContent = '';
    }

    if (!isValidUrl(url)) {
      if (urlError) urlError.textContent = 'Please enter a valid URL (http or https).';
      valid = false;
    } else {
      if (urlError) urlError.textContent = '';
    }

    if (!valid) return;

    const id = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : Date.now().toString();

    this._links.push({ id, label: label.trim(), url });
    this._save();
    this._render();

    if (labelInput) labelInput.value = '';
    if (urlInput) urlInput.value = '';
  },

  // Remove link by id, persist, re-render
  deleteLink(id) {
    this._links = this._links.filter((link) => link.id !== id);
    this._save();
    this._render();
  },

  // Persist current links array to Storage
  _save() {
    Storage.set(this._STORAGE_KEY, this._links);
  },

  // Render all links to the DOM
  _render() {
    const list = document.getElementById('links-list');
    if (!list) return;

    list.innerHTML = '';

    this._links.forEach((link) => {
      const div = document.createElement('div');

      const anchor = document.createElement('a');
      anchor.href = link.url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.textContent = link.label;

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.textContent = 'Delete';
      deleteBtn.setAttribute('aria-label', `Delete link: ${link.label}`);
      deleteBtn.addEventListener('click', () => this.deleteLink(link.id));

      div.append(anchor, deleteBtn);
      list.appendChild(div);
    });
  },
};

// ─── App Initialization ───────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  Clock.init();
  Timer.init();
  Todo.init();
  Links.init();

  // Wire theme toggle button
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => Theme.toggle());
  }
});
