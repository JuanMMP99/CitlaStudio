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
        CREATE TABLE IF NOT EXISTS menu_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            available BOOLEAN NOT NULL DEFAULT TRUE
        );

        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL, -- 'inside' or 'outside'
            customer_name TEXT NOT NULL,
            customer_phone TEXT,
            address TEXT, -- Only for outside orders
            delivery_time TEXT, -- Only for outside orders
            table_number TEXT, -- Only for inside orders
            payment_method TEXT NOT NULL,
            payment_amount REAL,
            payment_change REAL,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            menu_item_name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL, -- Price at the time of order
            FOREIGN KEY (order_id) REFERENCES orders(id)
        );

        -- Sample Data Inserts
        INSERT INTO menu_items (name, category, price) VALUES ('Taco de Cuerito', 'tacos', 15);
        INSERT INTO menu_items (name, category, price) VALUES ('1/2 Kilo de Carnitas', 'carnitas', 150);
        );
    `);
})();

// --- API para Citas ---

app.get('/api/citas', async (req, res) => {
    const menuItems = await db.all('SELECT * FROM menu_items');
    res.json(menuItems);
});

app.post('/api/citas', async (req, res) => {
    const { name, category, price, available } = req.body;
    if (!name || !category || !price) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    const result = await db.run(
        'INSERT INTO menu_items (name, category, price, available) VALUES (?, ?, ?, ?)',
        [name, category, price, available]
    );
    res.status(201).json({ id: result.lastID, ...req.body });
});

app.put('/api/citas/:id/confirm', async (req, res) => {
   const { id } = req.params;
    const { available } = req.body;
    await db.run('UPDATE menu_items SET available = ? WHERE id = ?', [available, id]);
    res.json({ message: `Menu Item ${id} updated.` });
});

app.delete('/api/citas/:id', async (req, res) => {
    const { id } = req.params;
    await db.run('DELETE FROM menu_items WHERE id = ?', [id]);
    res.json({ message: `Menu item ${id} eliminada.` });
});


// --- API para Dinámicas ---

app.get('/api/dinamicas', async (req, res) => {
    const orders = await db.all('SELECT * FROM orders ORDER BY id DESC');
    res.json(orders);
});

app.get('/api/dinamicas/:id', async (req, res) => {
    const { id } = req.params;
    const order = await db.get('SELECT * FROM orders WHERE id = ?', [id]);

    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }

    // Fetch order items
    const items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [id]);

    res.json({ ...order, items });
});

app.put('/api/dinamicas/:id/complete', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.run('UPDATE orders SET status = "completed" WHERE id = ?', [id]);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json({ message: `Order ${id} marked as completed.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

app.post('/api/dinamicas', async (req, res) => {
    const { type, customer_name, customer_phone, address, delivery_time, table_number, payment_method, payment_amount, payment_change, items } = req.body;
     if (!customer_name || !payment_method || !items || items.length === 0) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const result = await db.run(
        'INSERT INTO orders (type, customer_name, customer_phone, address, delivery_time, table_number, payment_method, payment_amount, payment_change, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [type, customer_name, customer_phone, address, delivery_time, table_number, payment_method, payment_amount, payment_change, 'pending', new Date().toISOString()]
    );


    res.status(201).json({ id: result.lastID, ...req.body });
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