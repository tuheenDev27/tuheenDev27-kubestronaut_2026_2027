const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 5001; 

// Dynamically pull the MongoDB URI from the environment
const uri = process.env.MONGO_URI || "mongodb://localhost:27017/";
const client = new MongoClient(uri);

const htmlUI = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Node.js Data Retrieval</title>
    <style>
        body { font-family: system-ui, sans-serif; background: #f8fafc; color: #1e293b; padding: 20px; }
        .container { max-width: 900px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 14px; border-bottom: 1px solid #e2e8f0; text-align: left; }
        th { background-color: #f1f5f9; }
        button { background-color: #2563eb; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; float: right; font-weight: bold; }
        .empty { text-align: center; font-style: italic; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <button onclick="refreshData()">🔄 Refresh Data</button>
        <h2>Active Database Records</h2>
        <table>
            <thead><tr><th>ID</th><th>Name</th><th>Role</th></tr></thead>
            <tbody id="table-body"></tbody>
        </table>
    </div>
    <script>
        async function refreshData() {
            const tbody = document.getElementById('table-body');
            tbody.innerHTML = '<tr><td colspan="3" class="empty">Loading...</td></tr>';
            try {
                const res = await fetch('/api/users');
                const users = await res.json();
                tbody.innerHTML = users.length ? '' : '<tr><td colspan="3" class="empty">No records found.</td></tr>';
                users.forEach(u => {
                    tbody.innerHTML += \`<tr><td>\${u._id}</td><td>\${u.name}</td><td>\${u.role}</td></tr>\`;
                });
            } catch (e) {
                tbody.innerHTML = '<tr><td colspan="3" class="empty" style="color:red;">Database error</td></tr>';
            }
        }
        window.onload = refreshData;
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(htmlUI));

app.get('/api/users', async (req, res) => {
    try {
        await client.connect();
        const users = await client.db('user_database').collection('users').find({}).toArray();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Database network failure' });
    }
});

// Listen on all network interfaces inside the container
app.listen(port, '0.0.0.0', () => {
    console.log(`Node.js Reader running on port ${port}`);
    console.log(`Connected to: ${uri}`);
});