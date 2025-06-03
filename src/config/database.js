const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../../database/cop30.db');

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        db.run(`CREATE TABLE IF NOT EXISTS Angels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            city TEXT NOT NULL,
            availability TEXT NOT NULL,
            contact TEXT NOT NULL,
            visitors_count INTEGER DEFAULT 0 -- Nova coluna para contar visitantes
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS Visitors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            country TEXT NOT NULL,
            interest TEXT NOT NULL,
            contact TEXT NOT NULL
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS Associations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            angel_id INTEGER,
            visitor_id INTEGER,
            FOREIGN KEY (angel_id) REFERENCES Angels(id),
            FOREIGN KEY (visitor_id) REFERENCES Visitors(id)
        )`);
        // Nova tabela para usuários
        db.run(`CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user' -- 'angel', 'visitor', 'admin', etc.
        )`);
    }
});

db.serialize(() => {
    // Todas as operações de banco de dados subsequentes serão enfileiradas e executadas uma após a outra
});

module.exports = db;