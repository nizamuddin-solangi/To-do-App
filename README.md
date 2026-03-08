# SmartCal — Perfectionist Edition 📅✨

SmartCal is a stunning, premium, next-generation web application designed for task management. It goes far beyond the basic requirements to deliver a highly interactive and beautiful user experience. 

## 🚀 Features Implemented

This project successfully implements **100% of the Task #8 requirements**, along with several ultra-premium enhancements!

### 1. Advanced Calendar Interface
- Features a dynamic, grid-based monthly calendar view.
- Supports comprehensive calendar navigation (Previous Month / Next Month / Return to Today).
- **Enhancement:** Dates with scheduled tasks display a sleek numeric counter indicating the exact number of pending/completed tasks for that day.
- **Enhancement:** Logic prevents task creation on past dates, locking them into a secure "view-only" mode.

### 2. Comprehensive Task Management (Add/Edit/Delete)
- **Add tasks** seamlessly via a beautifully animated glassmorphism modal popup.
- Task fields include: *Title, Description (optional), Priority (Low/Medium/High), and Due Time.*
- **Enhancement:** By default, new tasks are logically assigned a "Pending" status behind the scenes to streamline the creation flow. The status dropdown is intelligently hidden until a user decides to Edit the task.
- Tasks can be completely **Edited** or permanently **Deleted** (protected by a safety confirmation dialog). 

### 3. Task Status & Dynamic Filtering
- Each task supports "Pending" (⏳) and "Completed" (✅) statuses.
- **Visual distinction:** Completed tasks switch to a `.done-card` style with an animated checkmark, celebrating completion.
- Sidebar includes a highly responsive filter widget to instantly view: **All Tasks**, **Pending Tasks**, or **Completed Tasks**.

### 4. Advanced Analytics Dashboard 📊
- Includes a dedicated "Dashboard" view toggle accessible from the top navigation bar.
- Fully integrated with **Chart.js**.
- Features three dynamic charts:
  1. **Task Status (Doughnut Chart):** Visualizes the split between pending and completed tasks overall.
  2. **Priority Distribution (Pie Chart):** Breaks down task load by Low, Medium, and High importance.
  3. **Recent Activity (Bar Chart):** Tracks pending vs. completed task volume across the last 7 trailing days.

### 5. Persistent Local Storage
- Fully utilizes browser `localStorage` under a unified state. 
- All tasks safely remain intact and perfectly re-render if the browser is entirely refreshed or closed.

### 6. Fully Responsive Design
- Employs modern CSS Grid and Flexbox techniques to guarantee flawless scaling on desktop monitors, tablets, and mobile devices.

---

## 🎨 Ultra-Premium UI / UX Features
This layout was engineered with a supreme focus on visual aesthetics and micro-interactions:
- **Ambient Canvas Effects:** Includes an interactive `cursorGlow`, gently drifting background stars, floating SVG blob gradients, and a celebratory confetti burst upon completing tasks.
- **Custom Fonts:** Leverages ultra-modern typography (`Inter`, `Space Grotesk`, `JetBrains Mono`). 
- **Glassmorphism Components:** Sidebar widgets and Modals feature frosted-glass blur effects (`backdrop-filter`) overlaid onto dark mode bases.
- **Animated Data Rings:** The sidebar features live SVG rings that visually display monthly progress.

## 🛠️ Tech Stack
- **HTML5** (Semantic structure)
- **CSS3** (Variables, Grid/Flexbox, Keyframe Animations, SVG Filters)
- **Vanilla JavaScript** (ES6+, DOM Manipulation, LocalStorage API)
- **Chart.js** (Via CDN for detailed data visualization)
