Manual Test Checklist — HabitFlow Redesign
-----------------------------------------------
1. Load app at `/habits` → see dark neon theme, stat bar with level/XP/streak/perfect/completed ring.
2. Click a checkbox on a habit → checkbox turns green with checkmark, UI updates instantly; reload stats.
3. Click future-day checkbox → disabled (opacity .35), no action.
4. Add new habit with name → appears in grid with violet dot; delete it.
5. Switch month with previous/next buttons → grid updates to correct number of days.
6. Visit `/week` → see 7-day columns, donuts, Big 3 inputs; add a task and tick it.
7. Set a boss task, save → XP updates; tick it → week XP increases by 100.
8. Visit `/dashboard` → charts load with real data, dark theme applied.
9. Visit `/finance` → add income/expense transaction, see balance calculated, theme matches.
10. Toggle theme button (moon/sun) → light theme activates, variables switch, text remains readable.
11. Resize browser to 375px → layout stacks vertically, grid scrolls horizontally with sticky habit names.
12. Resize to 768px → 2-column layout visible.
13. Resize to 1440px → full desktop layout with analysis sidebar visible.
14. Tick enough habits to cross level threshold → level-up banner appears with confetti dots, then fades after 4s.
15. Log out and log back in → user data (habits, transactions, planner tasks) persists.
