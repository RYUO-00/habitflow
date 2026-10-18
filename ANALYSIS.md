<analysis>
Step 1 — Decompose screenshots:
Screenshot 1 (Monthly): Year (2026), Month (October), Level (6), XP bar (2,930/3,000), Streak (8), Perfect (2), Completed (283/372), Done % (76%). Grid: habits × 31 days, week bands (violet/blue/teal/lime/pink). Checkboxes per cell. Analysis: per-habit stats (DONE count, NOW streak, BEST streak, % progress bar). Daily score heat strip (coloured cells). Line chart of daily % over time. Top 5 "Strongest" and bottom list "Needs focus".
Screenshot 2 (Week): Week range (Oct 5–11), Boss task (Launch new offer) +100 XP, Week XP (530/1,330) with rank label ("Warming up"), donut ring (54%), Best day (Wed), Cleared days (0), Need focus (Sat). 7 day columns with progress donuts, Big 3 starred tasks (+3x XP), regular task list. Per-day footer: x/y done, +N XP. Wins / Next-week-focus text.

Step 2 — Rules and assumptions:
- XP: 10 per completed habit, 10 per completed regular task, 30 per Big 3, +100 boss task, +50 perfect day (all habits done). Level: size = 500 XP per level, level = floor(sqrt(xp/50)) or linear 500 each. I pick linear: level = floor(XP / 500) + 1, next level at (level * 500). Assumption: user starts at level 1, 500 XP needed per level.
- Streak: count consecutive days ending today where at least one habit was done. Uses user's local date (YYYY-MM-DD). Best streak = max length of any consecutive run in history.
- Perfect day = all active habits completed that day (not archived/deleted). Count from HabitLog.
- Rank labels: <300 = "Warming up", <600 = "On track", <1000 = "Rising", <1500 = "On fire", >=1500 = "Unstoppable".
- Strongest = highest total completions; Needs focus = lowest total completions (among active habits with >0 attempts, else 0).
- Level-up banner + confetti when XP crosses a new level threshold.

Step 3 — Data model changes (optional fields, no breaking changes):
- Habit: add `color` String (hex from palette, default "#c77dff"), `archived` Boolean (default false). No rename/deletion.
- New WeekPlan schema: userId, weekStart (date String "YYYY-MM-DD"), bossTask String, bossDone Boolean (default false), wins String, nextWeek String.
- New Task schema: userId, weekStart String, day String (YYYY-MM-DD), text String, big3 Boolean (default false), completed Boolean (default false), order Number.
- Indexes: {userId, weekStart}, {userId, day}, {habitId, date} (already exists).
- Existing User, HabitLog, Transaction untouched.

Step 4 — API design (all protected by requireAuth, filter userId):
- GET /api/habits — existing (add color, archived filter optional).
- POST /api/habits — add body validation for color.
- PATCH /api/habits/:id — rename, recolour, archive.
- DELETE /api/habits/:id — existing.
- POST /api/habits/:id/toggle — existing.
- GET /api/logs — add ?month=YYYY-MM.
- GET /api/stats/month?month=YYYY-MM — aggregated: habits list, log counts per habit, streak, perfect days, total completed, level, xp, best streak.
- GET /api/stats/year?year=YYYY — yearly heatmap data: array of {date, count} for full year.
- GET /api/weeks?start=YYYY-MM-DD — list week plans.
- POST /api/weeks — create/update week (boss, wins, next).
- GET /api/weeks/:start/tasks — tasks for week.
- POST /api/weeks/:start/tasks — add/update/delete tasks.
- POST /api/tasks/:id/toggle — toggle completed (compute XP update).
- GET /api/badges — compute 7-day, 30-day streak badges, perfect week, 100 completions, return array.
- Analytics endpoints kept.

Step 5 — Frontend design:
Components:
App.jsx — router with /habits (new Monthly Tracker), /week (new Week Planner), /dashboard (restyled), /finance (restyled), /login (restyled). Nav links updated.
CSS variables: --bg-deep:#0d0e14; --card:#16161d; --text:#f0f0f5; --muted:#8a8b92; --accent-violet:#c77dff; --accent-cyan:#00e5e5; --accent-teal:#00d4aa; --accent-lime:#a3ff5c; --accent-yellow:#ffd166; --accent-pink:#ff6b9d. Light theme swaps to warm white.
StatBar — level, XP bar, streak, perfect, completed ring.
HabitGrid — pinned left column names, scrollable right grid, colour-coded week bands.
AnalysisPanel — per-habit stats table, progress bars.
DailyHeatStrip — small squares colour-coded by % completed.
ProgressLineChart — Chart.js line of daily %.
WeekPlanner — header stats, 7-day columns, donuts, Big 3 tasks, footer XP.
DayColumn — donut ring (SVG), task list with pop animation, Big 3 star badge.
Components share state via props; App holds user, theme preference in localStorage only.

Step 6 — Risks & mitigations:
- Timezone: always use ymd(new Date()) local strings, never UTC. All streak calculations compare YYYY-MM-DD strings.
- Performance: grid is 31 columns × habits. On mobile (<900px), horizontal scroll with sticky left column; hide some days or shrink to 7-day view option.
- Race conditions: toggle uses optimistic update (flip checkbox immediately, revert + toast on error). No double-click protection needed beyond debounce in handler.
- Responsive: at 375px, stack all sections vertically; at 768px, 2-column; at 1440px full desktop layout.
- Level-up: compute new level from total XP after each toggle; show banner when level increases.

Step 7 — Implementation plan (only now writing code):
1. Update server/models with optional fields.
2. Add server/routes for stats, weeks, tasks, badges.
3. Update server/index.js if needed (no changes likely).
4. Rewrite client/src/styles.css with dark neon variables + animations.
5. Rewrite pages: Habits → Monthly Tracker (Screenshot 1), add WeekPlanner, restyle Dashboard and Finance, update App and Login.
6. Add confetti/animation helpers (pure CSS + small JS).
7. Verify checklist items.
</analysis>
