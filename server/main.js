const mysql = require('mysql2')
const express = require('express')
const cors = require('cors')

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'medienprojekt',
    port: "3307"
})

const corsOptions = {
    origin: 'http://localhost:5173', // Replace with your frontend's URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these HTTP methods
    allowedHeaders: ['Content-Type'] // Allow these headers
};
const app = express()
app.use(cors(corsOptions))

// Demodaten
const demo = {
    user: [
        {
            "id": "007",
            "name": "Omit"
        }
    ],
    todos: [
        {
            "id": "001",
            "userID": "007",
            "title": "Medienprojekt aufsetzen",
            "description": "Pls"
        }
    ]
}

// Checks if connected properly 
connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
    console.log('connected as id ' + connection.threadId);

    // SQL query to create the database only if it does not exist
    const sql = 'CREATE DATABASE IF NOT EXISTS medienprojektdb';
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error creating database:', err.message);
            return;
        }
        console.log('Database created or already exists:', result);

        // Hier könnte man die Tabellen initialisieren, falls noch nicht vorhanden

    });

    // Close the connection
    connection.end();
});

// ROUTES TO FETCH TODOS
app.get("/api/todos", (req, res) => {
    const sql = 'SELECT * FROM todos';

    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching todos:', err.message);
            res.status(500).send('Error fetching todos');
            return;
        }
        res.status(200).json(result);
    });
});

// ROUTES TO ADD A NEW TODO
app.post("/api/todos", express.json(), (req, res) => {
    const { 
        userID,
        title,
        description,
        subtasks,
        priority,
        deadline,
        reminder,
        repeat,
        done = false,
        deleted = false
    } = req.body;

    if (!userID || !title) {
        return res.status(400).json({ error: 'UserID and title are required' });
    }

    const sql = 
        'INSERT INTO todos (userID, title, description, priority, deadline, reminder, repeat, done, deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const taskValues = [
        userID,
        title,
        description,
        priority || "none",
        deadline ? new Date(deadline) : null,
        reminder || "Nie",
        repeat || "Nie",
        done,
        deleted
    ];
    connection.query(sql, taskValues, (err, result) => {
        if (err) {
            console.error('Error inserting todo:', err.message);
            res.status(500).send('Error adding todo');
            return;
        }

        if (Array.isArray(subtasks) && subtasks.length > 0) {
            const subtaskSQL = 'INSERT INTO subtasks (todoID, name, done) VALUES ?';
            const subtaskValues = subtasks.map(subtask => [taskID, subtask.name, subtask.done || false]);

            connection.query(subtaskSQL, [subtaskValues], (subtaskErr) => {
                if (subtaskErr) {
                    console.error('Error inserting subtasks:', subtaskErr.message);
                    res.status(500).send('Error adding subtasks');
                    return;
                }

                // Respond with the newly created task and subtasks
                res.status(201).json({
                    id: result.insertId,
                    userID,
                    title,
                    description,
                    priority,
                    deadline,
                    reminder,
                    repeat,
                    done,
                    deleted,
                    subtasks: subtasks.map(subtask => ({
                        name: subtask.name,
                        done: subtask.done || false
                    })),
                    created_at: new Date()
                });
            });
        } else {
            // If no subtasks, respond with the task only
            res.status(201).json({
                id: taskID,
                userID,
                title,
                description,
                priority,
                deadline,
                reminder,
                repeat,
                done,
                deleted,
                subtasks: [],
                created_at: new Date()
            });
        }
    });
});

// DELETE a todo by id
app.delete("/api/todos/:id", (req, res) => {
    const todoId = req.params.id;

    if (!todoId) {
        return res.status(400).json({ error: "Todo ID is required" });
    }

    const sql = "DELETE FROM todos WHERE id = ?";
    connection.query(sql, [todoId], (err, result) => {
        if (err) {
            console.error("Error deleting todo:", err.message);
            res.status(500).send("Error deleting todo");
            return;
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Todo not found" });
        }

        res.status(200).json({ message: "Todo deleted successfully", id: todoId });
    });
});

// Update a todo by ID
app.put("/api/todos/:id", express.json(), (req, res) => {
    const todoId = req.params.id;
    const { title, description } = req.body;

    if (!title && !description) {
        return res.status(400).json({ error: "Title or description is required to update" });
    }

    const sql = "UPDATE todos SET title = ?, description = ? WHERE id = ?";
    connection.query(sql, [title || null, description || null, todoId], (err, result) => {
        if (err) {
            console.error("Error updating todo:", err.message);
            res.status(500).send("Error updating todo");
            return;
        }

        // Check if a row was actually updated
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Todo not found" });
        }

        res.status(200).json({ message: "Todo updated successfully", id: todoId });
    });
});


// Handling middle-ware errors
app.use((err, req, res, next) => {
    console.error("Unexpected Error:", err.stack);
    res.status(500).json({ error: "An unexpected error occurred. Please try again later." });
});

// Handling unknown routes errors
app.use((req, res) => {
    res.status(404).json({ error: "Endpoint not found" });
});


// Relics from the first iteration of testing backend
app.get("/", (req, res) => {
    res.send("<h1>Hello World!</h1>")
})

app.get("/api", (req, res) => {
    // Hier könnte Ihr Code stehen (Daten aus Datenbank ziehen)
    res.json({"users": ["userOne", "userTwo", "userThree"]})
})

app.listen(5000, () => { console.log("Server started on port 5000") })
