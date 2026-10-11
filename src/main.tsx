@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

:root {
  --bg: #f4f7fb;
  --panel: #ffffff;
  --primary: #0f766e;
  --primary-soft: #ccfbf1;
  --secondary: #1d4ed8;
  --success: #15803d;
  --warning: #d97706;
  --danger: #dc2626;
  --text: #0f172a;
  --muted: #64748b;
  --border: #e2e8f0;
}

* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: 'Inter', system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
}
button, input, select, textarea { font: inherit; }
button { cursor: pointer; }

a { color: inherit; }

.app-shell { min-height: 100vh; display: flex; flex-direction: column; }
.topbar {
  background: linear-gradient(135deg, #0f172a, #0f766e);
  color: white;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
}
.brand h1 { margin: 0; font-size: 1.3rem; }
.brand small { opacity: 0.85; }
.topbar-actions { display: flex; gap: 10px; align-items: center; }
.small-badge {
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.18);
  color: white;
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 0.75rem;
}
.layout { display: flex; flex: 1; }
.sidebar {
  width: 260px;
  background: #fff;
  border-right: 1px solid var(--border);
  padding: 16px 12px;
}
.nav-group { display: flex; flex-direction: column; gap: 8px; }
.nav-item {
  padding: 12px 14px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  text-align: left;
  font-weight: 700;
  color: var(--text);
}
.nav-item:hover { background: #f8fafc; }
.nav-item.active {
  background: var(--primary-soft);
  border-color: rgba(15, 118, 110, 0.2);
  color: var(--primary);
}
.content { flex: 1; padding: 20px; }
.card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
}
.card h3, .card h4 { margin-top: 0; }
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}
.stat-card {
  background: linear-gradient(180deg, #fff, #f8fafc);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 18px;
}
.stat-card .label { color: var(--muted); font-size: 0.8rem; }
.stat-card .value { font-size: 1.8rem; font-weight: 800; }
.grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 0.8rem; color: var(--muted); font-weight: 700; }
.field input, .field select, .field textarea {
  width: 100%;
  border: 1px solid var(--border);
  background: white;
  border-radius: 10px;
  padding: 10px 12px;
  color: var(--text);
}
.field textarea { min-height: 80px; resize: vertical; }
.btn {
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  font-weight: 700;
}
.btn-primary { background: var(--primary); color: white; }
.btn-success { background: var(--success); color: white; }
.btn-warning { background: var(--warning); color: white; }
.btn-secondary { background: #e2e8f0; color: var(--text); }
.actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
.kpi-row { display: flex; gap: 12px; flex-wrap: wrap; }
.kpi {
  background: #f8fafc;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px 12px;
  min-width: 120px;
}
.muted { color: var(--muted); }
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  text-align: left;
  vertical-align: top;
}
th {
  background: #f8fafc;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
}
.inline-row { display: flex; align-items: center; gap: 10px; }
.spacer { flex: 1; }
@media (max-width: 960px) {
  .layout { display: block; }
  .sidebar { width: 100%; border-right: none; border-bottom: 1px solid var(--border); }
  .grid-2 { grid-template-columns: 1fr; }
}

@media print {
  .no-print, .sidebar, .topbar { display: none !important; }
  body { background: white; }
  .content { padding: 0; }
  .card, .print-area { box-shadow: none; border: none; }
  .print-area { display: block; }
}
