# Implementation Plan: Personal Dashboard

## Overview

Implement a single-page personal dashboard as three files (`index.html`, `css/style.css`, `js/app.js`) using semantic HTML5, vanilla CSS with custom properties, and modular vanilla JavaScript. All state is persisted via `localStorage`. Tests use Vitest + jsdom + fast-check.

## Tasks

- [x] 1. Project scaffolding and test environment setup
  - Create the directory structure: `css/`, `js/`, `tests/unit/`, `tests/property/`
  - Add `package.json` with Vitest and fast-check as dev dependencies
  - Add `vitest.config.js` configured for jsdom environment
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 2. Implement Storage and Validation utilities
  - [x] 2.1 Implement `Storage` module in `js/app.js`
    - Write `Storage.get(key, fallback)` — JSON.parse with try/catch, returns fallback on failure
    - Write `Storage.set(key, value)` — JSON.stringify with try/catch, logs warning on QuotaExceededError
    - _Requirements: 5.7, 7.4, 2.3, 3.x, 4.3, 8.3_
  - [ ]* 2.2 Write unit tests for Storage (`tests/unit/storage.test.js`)
    - Test `get()` returns fallback on corrupted JSON
    - Test `set()` handles QuotaExceededError gracefully
    - _Requirements: 5.7, 7.4_
  - [x] 2.3 Implement `Validation` utilities in `js/app.js`
    - Write `isNonEmptyString(value)`, `isValidUrl(value)`, `isInRange(value, min, max)`, `isDuplicateTask(text, tasks)`, `isDuplicateLink(label, links)`
    - _Requirements: 5.2, 6.1, 7.6, 4.5_
  - [ ]* 2.4 Write unit tests for Validation (`tests/unit/validation.test.js`)
    - Test each utility with valid, invalid, and edge-case inputs
    - _Requirements: 5.2, 6.1, 7.6, 4.5_

- [x] 3. Implement Theme module
  - [x] 3.1 Implement `Theme` module in `js/app.js`
    - Write `Theme.init()` — reads `pd_theme` from localStorage, applies `data-theme` to `<html>`, defaults to `"light"`
    - Write `Theme.toggle()` — flips theme, persists new value
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  - [ ]* 3.2 Write unit tests for Theme (`tests/unit/theme.test.js`)
    - Test toggle changes `data-theme` attribute
    - Test default light theme when localStorage is empty
    - _Requirements: 8.2, 8.5_
  - [ ]* 3.3 Write property test for Theme — Property 22: Theme persistence round-trip (`tests/property/theme.property.test.js`)
    - **Property 22: Theme persistence round-trip**
    - **Validates: Requirements 8.3, 8.4**

- [x] 4. Implement Clock module
  - [x] 4.1 Implement `Clock` module in `js/app.js`
    - Write `Clock.init()` — reads `pd_name`, starts `setInterval` tick every 1000 ms
    - Write `Clock.setName(name)` — updates stored name, re-renders greeting
    - Implement `formatTime(date)`, `formatDate(date)`, and `getGreeting(hour)` as internal helpers
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 2.4, 2.5_
  - [ ]* 4.2 Write unit tests for Clock (`tests/unit/clock.test.js`)
    - Test default greeting renders without a name
    - Test time display updates on tick using fake timers
    - _Requirements: 1.1, 2.5_
  - [ ]* 4.3 Write property tests for Clock — Properties 1–5 (`tests/property/clock.property.test.js`)
    - **Property 1: Time format correctness** — `fc.date()` → result matches `/^\d{2}:\d{2}$/`
    - **Property 2: Date format correctness** — `fc.date()` → result contains weekday, day, month, year
    - **Property 3: Greeting phrase by hour** — `fc.integer({ min: 0, max: 23 })` → exactly one phrase, full coverage
    - **Property 4: Name appears in greeting** — `fc.string({ minLength: 1 })` → rendered greeting contains name
    - **Property 5: Name persistence round-trip** — `fc.string()` → re-init produces greeting with same name
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.2, 2.3, 2.4**

- [ ] 5. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement Timer module
  - [x] 6.1 Implement `Timer` module in `js/app.js`
    - Write `Timer.init()` — reads `pd_timer_duration`, renders initial state, defaults to 25 min
    - Write `Timer.start()`, `Timer.stop()`, `Timer.reset()`, `Timer.setDuration(mins)`
    - Implement `formatTimer(seconds)` helper
    - Implement finish notification: Web Audio API beep (lazy AudioContext) + CSS flash class
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5_
  - [ ]* 6.2 Write unit tests for Timer (`tests/unit/timer.test.js`)
    - Test default 25-minute load
    - Test start/stop state transitions using fake timers
    - Test finish notification fires at 00:00
    - Test audio fallback when AudioContext is unavailable
    - _Requirements: 3.1, 3.2, 3.3, 3.5_
  - [ ]* 6.3 Write property tests for Timer — Properties 6–10 (`tests/property/timer.property.test.js`)
    - **Property 6: Timer display format** — `fc.integer({ min: 0, max: 7200 })` → result matches `MM:SS`
    - **Property 7: Reset restores configured duration** — `fc.integer({ min: 1, max: 120 })` → display shows `d:00` after reset
    - **Property 8: Valid duration updates display** — `fc.integer({ min: 1, max: 120 })` → display shows `d:00`
    - **Property 9: Duration persistence round-trip** — `fc.integer({ min: 1, max: 120 })` → re-init applies d
    - **Property 10: Invalid duration rejected** — `fc.oneof(fc.integer({ max: 0 }), fc.integer({ min: 121 }))` → error shown, duration unchanged
    - **Validates: Requirements 3.4, 3.6, 4.2, 4.3, 4.4, 4.5**

- [x] 7. Implement Todo module
  - [x] 7.1 Implement `Todo` module in `js/app.js`
    - Write `Todo.init()` — loads `pd_tasks` from localStorage, renders list
    - Write `Todo.addTask(text)` — validates non-empty, deduplicates, appends with `crypto.randomUUID()` id
    - Write `Todo.editTask(id, newText)` — validates, deduplicates, updates and persists
    - Write `Todo.toggleComplete(id)` — flips `completed` flag, persists
    - Write `Todo.deleteTask(id)` — removes by id, persists
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 6.1, 6.2, 6.3_
  - [ ]* 7.2 Write unit tests for Todo (`tests/unit/todo.test.js`)
    - Test edit UI appears on click
    - Test inline error shown on duplicate add
    - Test inline error shown on duplicate edit
    - _Requirements: 5.3, 6.2, 6.3_
  - [ ]* 7.3 Write property tests for Todo — Properties 11–17 (`tests/property/todo.property.test.js`)
    - **Property 11: Task addition grows the list** — `fc.string({ minLength: 1 })` → list length +1
    - **Property 12: Task edit persistence round-trip** — two `fc.string({ minLength: 1 })` → re-init shows updated text
    - **Property 13: Complete toggle is a round-trip** — toggle twice → original `completed` state restored
    - **Property 14: Task deletion removes the task** — `fc.array(..., { minLength: 1 })` → length -1, task gone
    - **Property 15: Task list loads from localStorage** — `fc.array(fc.record({...}))` → all tasks rendered correctly
    - **Property 16: Duplicate add rejected** — case-variant of existing text → list unchanged
    - **Property 17: Duplicate edit rejected** — two distinct texts → edit to other's text rejected
    - **Validates: Requirements 5.2, 5.4, 5.5, 5.6, 5.8, 6.1, 6.3**

- [ ] 8. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement Links module
  - [x] 9.1 Implement `Links` module in `js/app.js`
    - Write `Links.init()` — loads `pd_links` from localStorage, renders panel
    - Write `Links.addLink(label, url)` — validates label (non-empty) and URL (http/https via `new URL()`), appends with id
    - Write `Links.deleteLink(id)` — removes by id, persists
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  - [ ]* 9.2 Write unit tests for Links (`tests/unit/links.test.js`)
    - Test inline error shown on invalid URL submission
    - Test inline error shown on empty label submission
    - _Requirements: 7.6_
  - [ ]* 9.3 Write property tests for Links — Properties 18–21 (`tests/property/links.property.test.js`)
    - **Property 18: Valid link renders with correct href and target** — `fc.string({ minLength: 1 })`, `fc.webUrl()` → anchor has correct href and `target="_blank"`
    - **Property 19: Link deletion removes the link** — `fc.array(..., { minLength: 1 })` → length -1, link gone
    - **Property 20: Link list loads from localStorage** — `fc.array(fc.record({...}))` → all links rendered correctly
    - **Property 21: Invalid link submission rejected** — empty label or invalid URL → list unchanged
    - **Validates: Requirements 7.2, 7.3, 7.5, 7.6**

- [x] 10. Create `index.html` with semantic HTML5
  - Build the full `index.html` using semantic elements throughout:
    - `<header>` wrapping the greeting, `<time>` element for the clock, and name input form with `<label>`
    - `<main>` wrapping all widget sections
    - `<section aria-label="Focus Timer">` for the timer widget with `<label>` for duration input and `<button>` elements for Start/Stop/Reset
    - `<section aria-label="To-Do List">` for the task widget with `<label>` for task input and `<button>` elements for Add/Edit/Complete/Delete; `<article>` for each task item
    - `<nav aria-label="Quick Links">` for the links panel with `<label>` elements for label/URL inputs and `<button>` for Add/Delete
    - `<button>` for the theme toggle (not `<div>` or `<span>`)
    - Appropriate `aria-label` and `aria-live` attributes on dynamic regions
    - All form inputs paired with explicit `<label>` elements
  - _Requirements: 1.1, 2.1, 3.x, 4.1, 5.1, 7.1, 8.1, 9.1, 10.1, 10.2_

- [x] 11. Create `css/style.css`
  - Define CSS custom properties for all color tokens scoped to `[data-theme="light"]` and `[data-theme="dark"]`
  - Style all five widget sections, the header, and the theme toggle button
  - Add the timer flash animation CSS class triggered on finish
  - Ensure responsive layout suitable for desktop and mobile viewports
  - _Requirements: 3.5, 5.5, 8.1, 8.2, 9.2_

- [x] 12. Wire all modules in `js/app.js` and connect to DOM
  - Add the `DOMContentLoaded` listener that calls `Theme.init()`, `Clock.init()`, `Timer.init()`, `Todo.init()`, `Links.init()` in order
  - Attach all event listeners (name form submit, timer buttons, task add/edit/delete/complete, link add/delete, theme toggle) to the DOM elements defined in `index.html`
  - Verify each module's `init()` guards against missing DOM elements with a console error
  - _Requirements: 1.1, 2.1, 3.1–3.6, 4.1–4.5, 5.1–5.8, 6.1–6.3, 7.1–7.6, 8.1–8.5_

- [x] 13. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at logical milestones
- Property tests validate universal correctness properties using fast-check (min 100 runs each)
- Unit tests validate specific examples, edge cases, and error conditions
- The Web Audio API `AudioContext` must be created lazily on first user interaction to comply with browser autoplay policies
