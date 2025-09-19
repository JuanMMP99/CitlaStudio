const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let db;

(async () => {
    db = await open({
        filename: './citlastudio.db',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS citas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            service TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            confirmed BOOLEAN DEFAULT FALSE
        );

        CREATE TABLE IF NOT EXISTS dinamicas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            type TEXT NOT NULL
        );
    `);
})();

// --- API para Citas ---

app.get('/api/citas', async (req, res) => {
    const citas = await db.all('SELECT * FROM citas ORDER BY id DESC');
    res.json(citas);
});

app.post('/api/citas', async (req, res) => {
    const { name, phone, service, date, time } = req.body;
    if (!name || !phone || !service || !date || !time) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    const result = await db.run(
        'INSERT INTO citas (name, phone, service, date, time) VALUES (?, ?, ?, ?, ?)',
        [name, phone, service, date, time]
    );
    res.status(201).json({ id: result.lastID, ...req.body });
});

app.put('/api/citas/:id/confirm', async (req, res) => {
    const { id } = req.params;
    await db.run('UPDATE citas SET confirmed = TRUE WHERE id = ?', [id]);
    res.json({ message: `Cita ${id} confirmada.` });
});

app.delete('/api/citas/:id', async (req, res) => {
    const { id } = req.params;
    await db.run('DELETE FROM citas WHERE id = ?', [id]);
    res.json({ message: `Cita ${id} eliminada.` });
});


// --- API para Dinámicas ---

app.get('/api/dinamicas', async (req, res) => {
    const dinamicas = await db.all('SELECT * FROM dinamicas ORDER BY id DESC');
    res.json(dinamicas);
});

app.post('/api/dinamicas', async (req, res) => {
    const { title, description, type } = req.body;
     if (!title || !description || !type) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    const result = await db.run(
        'INSERT INTO dinamicas (title, description, type) VALUES (?, ?, ?)',
        [title, description, type]
    );
    res.status(201).json({ id: result.lastID, ...req.body });
});

app.delete('/api/dinamicas/:id', async (req, res) => {
    const { id } = req.params;
    await db.run('DELETE FROM dinamicas WHERE id = ?', [id]);
    res.json({ message: `Dinámica ${id} eliminada.` });
});


app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});