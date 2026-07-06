const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 3000;
const MONGO_URI = 'mongodb://localhost:27017/';

// ─── Core Logic: fetch users from MongoDB ───────────────────────────────────
async function fetchUsersFromDb() {
  let client;
  try {
    client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 2000 });
    await client.connect();

    const db = client.db('user_database');
    const collection = db.collection('users');

    const count = await collection.countDocuments({});
    if (count === 0) {
      console.log('The database is currently empty.');
      return [];
    }

    const users = await collection.find({}).toArray();
    return users;
  } catch (err) {
    console.error('Database connection error:', err.message);
    return [];
  } finally {
    if (client) await client.close();
  }
}

// ─── API Route ───────────────────────────────────────────────────────────────
app.get('/api/users', async (req, res) => {
  const users = await fetchUsersFromDb();
  res.json(users);
});

// ─── UI (replaces Tkinter window) ────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>MongoDB Architecture Viewer</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: Arial, sans-serif;
      background: #f1f5f9;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100vh;
      padding: 40px 20px;
    }

    .card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 700px;
      padding: 30px;
    }

    h1 {
      font-size: 22px;
      color: #1e293b;
      text-align: center;
      margin-bottom: 24px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    thead {
      background: #2563eb;
      color: white;
    }

    thead th {
      padding: 12px 16px;
      text-align: left;
      font-size: 14px;
      letter-spacing: 0.5px;
    }

    tbody tr:nth-child(even) { background: #f8fafc; }
    tbody tr:hover { background: #e0eaff; transition: background 0.2s; }

    tbody td {
      padding: 11px 16px;
      font-size: 14px;
      color: #334155;
      border-bottom: 1px solid #e2e8f0;
      word-break: break-all;
    }

    .empty-row td {
      text-align: center;
      color: #94a3b8;
      font-style: italic;
    }

    .btn-wrap { text-align: center; }

    button {
      background: #2563eb;
      color: white;
      border: none;
      padding: 10px 28px;
      font-size: 15px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
    }

    button:hover { background: #1d4ed8; }
    button:disabled { background: #93c5fd; cursor: not-allowed; }

    #status {
      text-align: center;
      font-size: 13px;
      color: #64748b;
      margin-top: 10px;
      min-height: 20px;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Active Database Records</h1>

    <table>
      <thead>
        <tr>
          <th>Database ID</th>
          <th>Name</th>
          <th>Role</th>
        </tr>
      </thead>
      <tbody id="tableBody">
        <tr class="empty-row">
          <td colspan="3">Loading...</td>
        </tr>
      </tbody>
    </table>

    <div class="btn-wrap">
      <button id="refreshBtn" onclick="refreshTable()">🔄 Refresh Data</button>
    </div>
    <div id="status"></div>
  </div>

  <script>
    async function refreshTable() {
      const tbody = document.getElementById('tableBody');
      const btn = document.getElementById('refreshBtn');
      const status = document.getElementById('status');

      btn.disabled = true;
      btn.textContent = 'Fetching...';
      status.textContent = '';

      try {
        const res = await fetch('/api/users');
        const users = await res.json();

        tbody.innerHTML = '';

        if (!users.length) {
          tbody.innerHTML = \`
            <tr class="empty-row">
              <td colspan="3">Database is empty — no records found</td>
            </tr>\`;
          status.textContent = 'No records in the database.';
          return;
        }

        users.forEach(user => {
          const tr = document.createElement('tr');
          tr.innerHTML = \`
            <td>\${user._id ?? 'N/A'}</td>
            <td>\${user.name ?? 'Unknown'}</td>
            <td>\${user.role ?? 'Unknown'}</td>
          \`;
          tbody.appendChild(tr);
        });

        status.textContent = \`Loaded \${users.length} record(s).\`;
      } catch (err) {
        tbody.innerHTML = \`
          <tr class="empty-row">
            <td colspan="3">⚠️ Could not connect to the server</td>
          </tr>\`;
        status.textContent = 'Error: ' + err.message;
      } finally {
        btn.disabled = false;
        btn.textContent = '🔄 Refresh Data';
      }
    }

    // Auto-load on startup (mirrors refresh_table call in build_ui)
    refreshTable();
  </script>
</body>
</html>`);
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`MongoDB Architecture Viewer running at http://localhost:${PORT}`);
});