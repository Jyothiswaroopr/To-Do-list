const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database("todo.db");

// Create tables
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, user_id INTEGER, task TEXT)");
});

//Register a user
app.post("/register", (req, res) => {
    const { username, password } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({ error: "Error hashing password" });
        db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hash], function (err) {
            if (err) return res.status(400).json({ error: "Username already taken" });
            res.json({ message: "User registered!" });
        });
    });
});

//Login user
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (!user) return res.status(400).json({ error: "Invalid credentials" });
        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                res.json({ userId: user.id });
            } else {
                res.status(400).json({ error: "Invalid credentials" });
            }
        });
    });
});

//Add Task 
app.post("/add-task", (req, res) => {
    const { userId, task } = req.body;
    db.run("INSERT INTO tasks (user_id, task) VALUES (?, ?)", [userId, task], function () {
        res.json({ id: this.lastID, task });
    });
});

// Get Tasks
app.get("/tasks", (req, res) => {
    const userId = req.query.userId; // Fetch user ID from the query
    db.all("SELECT * FROM tasks WHERE user_id = ?", [userId], (err, tasks) => {
        res.json(tasks);
    });
});

//Delete Task 
app.post("/delete-task", (req, res) => {
    const { id, userId } = req.body;
    db.run("DELETE FROM tasks WHERE id = ? AND user_id = ?", [id, userId], function () {
        res.json({ message: "Task deleted" });
    });
});

app.listen(3000, () => console.log("Server running on port 3000"));
