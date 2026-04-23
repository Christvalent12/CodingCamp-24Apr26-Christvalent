# Requirements Document

## Introduction

A personal dashboard web app built with HTML, CSS, and Vanilla JavaScript. It runs entirely in the browser with no backend — all data is persisted via the Local Storage API. The dashboard provides a greeting with the current time and date, a configurable focus (Pomodoro) timer, a to-do list, and a quick links panel. It also supports light/dark mode theming and a custom user name in the greeting.

## Glossary

- **Dashboard**: The single-page web application described in this document.
- **Timer**: The focus (Pomodoro) countdown timer component.
- **Task**: A to-do item managed by the to-do list component.
- **Link**: A user-saved URL shortcut displayed in the quick links panel.
- **Local_Storage**: The browser's `localStorage` API used for client-side persistence.
- **Theme**: The visual color scheme of the Dashboard (light or dark).
- **Greeting**: The time-aware welcome message displayed at the top of the Dashboard.

---

## Requirements

### Requirement 1: Greeting and Date/Time Display

**User Story:** As a user, I want to see the current time, date, and a personalized greeting, so that I have an at-a-glance overview when I open the dashboard.

#### Acceptance Criteria

1. THE Dashboard SHALL display the current time in HH:MM format, updated every second.
2. THE Dashboard SHALL display the current date in a human-readable format (e.g., "Monday, 14 July 2025").
3. WHEN the current hour is between 05:00 and 11:59, THE Greeting SHALL display "Good morning".
4. WHEN the current hour is between 12:00 and 17:59, THE Greeting SHALL display "Good afternoon".
5. WHEN the current hour is between 18:00 and 21:59, THE Greeting SHALL display "Good evening".
6. WHEN the current hour is between 22:00 and 04:59, THE Greeting SHALL display "Good night".

---

### Requirement 2: Custom Name in Greeting

**User Story:** As a user, I want to set my name so that the greeting message addresses me personally.

#### Acceptance Criteria

1. THE Dashboard SHALL provide an input field for the user to enter their name.
2. WHEN the user submits a non-empty name, THE Dashboard SHALL display the name as part of the Greeting (e.g., "Good morning, Alex").
3. WHEN the user submits a name, THE Dashboard SHALL persist the name in Local_Storage.
4. WHEN the Dashboard loads, THE Dashboard SHALL retrieve the stored name from Local_Storage and display it in the Greeting.
5. IF no name is stored in Local_Storage, THEN THE Greeting SHALL display a generic greeting without a name (e.g., "Good morning").

---

### Requirement 3: Focus Timer

**User Story:** As a user, I want a countdown timer so that I can track focused work sessions.

#### Acceptance Criteria

1. THE Timer SHALL default to a 25-minute countdown on initial load.
2. WHEN the user presses the Start button, THE Timer SHALL begin counting down in one-second intervals.
3. WHEN the user presses the Stop button, THE Timer SHALL pause the countdown at the current remaining time.
4. WHEN the user presses the Reset button, THE Timer SHALL stop the countdown and restore the duration to the configured session length.
5. WHEN the countdown reaches 00:00, THE Timer SHALL stop automatically and display a visual or audible notification to the user.
6. THE Timer SHALL display the remaining time in MM:SS format at all times.

---

### Requirement 4: Configurable Pomodoro Duration

**User Story:** As a user, I want to change the timer duration so that I can adapt focus sessions to my workflow.

#### Acceptance Criteria

1. THE Dashboard SHALL provide an input field that accepts a session duration in whole minutes (minimum 1, maximum 120).
2. WHEN the user sets a valid duration and the Timer is not running, THE Timer SHALL update its configured session length to the new value.
3. WHEN the user sets a valid duration, THE Dashboard SHALL persist the configured duration in Local_Storage.
4. WHEN the Dashboard loads, THE Dashboard SHALL retrieve the stored duration from Local_Storage and apply it as the Timer's session length.
5. IF the user enters a value outside the range of 1 to 120 minutes, THEN THE Dashboard SHALL display a validation error and retain the previous valid duration.

---

### Requirement 5: To-Do List

**User Story:** As a user, I want to manage a list of tasks so that I can track what I need to accomplish.

#### Acceptance Criteria

1. THE Dashboard SHALL provide an input field and an Add button for creating new Tasks.
2. WHEN the user submits a non-empty task name, THE Dashboard SHALL add the Task to the list and display it.
3. WHEN the user clicks the Edit button on a Task, THE Dashboard SHALL allow the user to modify the Task's text inline.
4. WHEN the user confirms an edit, THE Dashboard SHALL update the Task's text and persist the change in Local_Storage.
5. WHEN the user clicks the Complete button on a Task, THE Dashboard SHALL mark the Task as done with a visual indicator (e.g., strikethrough).
6. WHEN the user clicks the Delete button on a Task, THE Dashboard SHALL remove the Task from the list.
7. WHEN any Task is added, edited, completed, or deleted, THE Dashboard SHALL persist the full task list to Local_Storage.
8. WHEN the Dashboard loads, THE Dashboard SHALL retrieve and display all Tasks stored in Local_Storage.

---

### Requirement 6: Prevent Duplicate Tasks

**User Story:** As a user, I want the dashboard to block duplicate tasks so that my to-do list stays clean and unambiguous.

#### Acceptance Criteria

1. WHEN the user attempts to add a Task whose text matches an existing Task (case-insensitive), THE Dashboard SHALL reject the submission.
2. WHEN a duplicate Task is rejected, THE Dashboard SHALL display an inline error message indicating the Task already exists.
3. WHEN the user attempts to edit a Task to a text value that matches another existing Task (case-insensitive), THE Dashboard SHALL reject the edit and display an inline error message.

---

### Requirement 7: Quick Links

**User Story:** As a user, I want to save and access my favorite website links so that I can navigate to them quickly from the dashboard.

#### Acceptance Criteria

1. THE Dashboard SHALL provide input fields for a link label and a URL, and an Add button for saving new Links.
2. WHEN the user submits a valid label and URL, THE Dashboard SHALL display the Link as a clickable button that opens the URL in a new browser tab.
3. WHEN the user clicks the Delete button on a Link, THE Dashboard SHALL remove the Link from the panel.
4. WHEN any Link is added or deleted, THE Dashboard SHALL persist the full link list to Local_Storage.
5. WHEN the Dashboard loads, THE Dashboard SHALL retrieve and display all Links stored in Local_Storage.
6. IF the user submits an empty label or an invalid URL, THEN THE Dashboard SHALL display a validation error and not save the Link.

---

### Requirement 8: Light / Dark Mode

**User Story:** As a user, I want to toggle between light and dark themes so that I can use the dashboard comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a toggle control (e.g., button or switch) to switch between the light Theme and the dark Theme.
2. WHEN the user activates the toggle, THE Dashboard SHALL apply the selected Theme to all visible UI elements immediately without a page reload.
3. WHEN the user selects a Theme, THE Dashboard SHALL persist the Theme preference in Local_Storage.
4. WHEN the Dashboard loads, THE Dashboard SHALL retrieve the stored Theme preference from Local_Storage and apply it before rendering content.
5. IF no Theme preference is stored in Local_Storage, THEN THE Dashboard SHALL apply the light Theme by default.

---

### Requirement 9: File Structure

**User Story:** As a developer, I want a clean, predictable file structure so that the codebase is easy to navigate and maintain.

#### Acceptance Criteria

1. THE Dashboard SHALL be structured with exactly one HTML file at the project root (e.g., `index.html`).
2. THE Dashboard SHALL contain exactly one CSS file located inside a `css/` directory.
3. THE Dashboard SHALL contain exactly one JavaScript file located inside a `js/` directory.
4. THE Dashboard SHALL require no build tools, package managers, or backend server to run.

---

### Requirement 10: Browser Compatibility

**User Story:** As a user, I want the dashboard to work across modern browsers so that I can use it regardless of my preferred browser.

#### Acceptance Criteria

1. THE Dashboard SHALL function correctly in the latest stable versions of Chrome, Firefox, Edge, and Safari.
2. THE Dashboard SHALL use only standard Web APIs (DOM, localStorage, setInterval) with no external dependencies.
