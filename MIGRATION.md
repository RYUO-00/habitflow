Migration note — v1-working → redesign
------------------------------------------
- Existing User, Habit (with new optional `color` and `archived` fields), HabitLog, Transaction collections load unchanged.
- Existing habits will show with default violet color (`#c77dff`) and `archived: false`.
- New collections `WeekPlan` and `Task` start empty; planner shows empty week.
- All existing routes (`/habits`, `/logs`, `/analytics/*`, `/transactions`) remain and return the same shapes with optional extra data.
- Theme choice is stored only in `localStorage` and applies via CSS `data-theme` attribute.
- No existing user data needs to be migrated manually.
