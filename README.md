# Expense Tracker (static)

A simple, local-only expense tracker built with HTML, CSS and JavaScript. It stores expenses in browser localStorage and includes a small doughnut chart (Chart.js CDN).

Features:
- Add expenses (title, amount, category, date)
- Edit and delete items
- Filter by month
- Total and monthly totals
- Category breakdown chart (doughnut)

How to run:
1. Open `index.html` in your browser (double-click or right-click -> Open with).
2. Add expenses and they'll be persisted to localStorage.

Notes:
- This is a static demo; no server required.
- Works offline except Chart.js if your browser can't access CDN (you can vendor the script if needed).