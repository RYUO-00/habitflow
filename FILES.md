Files to ADD or REPLACE:

SERVER (REPLACE):
- server/models.js (add optional fields + new schemas)
- server/routes.js (add stats, week, task, badge routes)
- server/auth.js (no change needed, but kept)
- server/index.js (no change)

CLIENT (REPLACE):
- client/src/styles.css (full dark neon theme + animations)
- client/src/App.jsx (new router + theme toggle)
- client/src/api.js (add ymd, keep base)
- client/src/pages/Login.jsx (restyled)
- client/src/pages/Habits.jsx (replaced with full Monthly Tracker from Screenshot 1)
- client/src/pages/WeekPlanner.jsx (new Week Planner from Screenshot 2)
- client/src/pages/Dashboard.jsx (restyled charts)
- client/src/pages/Finance.jsx (restyled theme)
- client/src/pages/Legal.jsx (no structural change, style updates via CSS)
- client/index.html (add confetti CDN? No, pure CSS animation is fine. Keep as-is.)

NEW CLIENT FILES:
- client/src/components/StatBar.jsx
- client/src/components/HabitGrid.jsx
- client/src/components/AnalysisPanel.jsx
- client/src/components/HeatStrip.jsx
- client/src/components/LineChart.jsx
- client/src/components/DonutRing.jsx
- client/src/components/XPBar.jsx
- client/src/components/DayColumn.jsx
- client/src/components/LevelUpBanner.jsx

DEPENDENCIES (add to client/package.json):
- confetti-canvas (optional, but we can use pure CSS confetti; we'll skip extra package and use a pure CSS animation for confetti to avoid dependency issues)
Actually, to keep it simple and avoid new npm packages that might break, I'll implement confetti with a small inline component using pure CSS keyframes.
No new npm packages needed (Chart.js already installed).

MIGRATION NOTES:
- Existing User, Habit (with new optional color/archived), HabitLog, Transaction collections load unchanged.
- New collections (WeekPlan, Task) start empty; existing users see empty planner.
- Habit add endpoint now accepts optional color; existing habits get default violet.
