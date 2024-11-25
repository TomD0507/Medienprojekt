const mysql = require('mysql2')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const { format } = require('date-fns')

const app = express()

dotenv.config();
app.use(cors())
app.use(bodyParser.json())


const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT,
    database: process.env.MYSQL_DB
})

function initTodoDB() {
    // SQL query to create the database only if it does not exist
    const sql_createDb = 'CREATE DATABASE IF NOT EXISTS medienprojektdb';
    connection.query(sql_createDb, (err, result) => {
        if (err) {
            console.error('Error creating database:', err.message);
            return;
        }
        console.log('Database created or already exists');
    });

    // SQL query to drop previous init table
    const sql_dropTaskTable = 'DROP TABLE todos_init';
    connection.query(sql_dropTaskTable, (err, result) => {
        if (err) throw err;
        console.log('Previous todo table deleted.');
    })

    // SQL query to drop previous subtask table
    const sql_dropSubtaskTable = 'DROP TABLE subtasks_init';
    connection.query(sql_dropSubtaskTable, (err, result) => {
        if (err) throw err;
        console.log('Previous subtasks table deleted.');
    })

    // SQL query to create a dummy table for testing purposes
    const sql_createTaskTable = `
    CREATE TABLE IF NOT EXISTS todos_init (
        userId INT NOT NULL DEFAULT 1,
        todoId INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description MEDIUMTEXT,
        deadline DATETIME,
        priority ENUM('none', 'low', 'medium', 'high') NOT NULL DEFAULT 'none',
        isDone BOOL DEFAULT 0,
        todoReminder ENUM('Nie', 'Täglich', 'Wöchentlich', 'Monatlich') DEFAULT 'Nie',
        todoRepeat ENUM('Nie', 'Täglich', 'Wöchentlich', 'Monatlich') DEFAULT 'Nie',
        todoDeleted BOOL DEFAULT 0
    )
    `;

    connection.query(sql_createTaskTable, (err, result) => {
        if (err) throw err;
        console.log('Table successfully created');
    })
    
    // SQL query to create a dummy table for testing purposes
    const sql_createSubtaskTable = 
        'CREATE TABLE IF NOT EXISTS subtasks_init (mainTaskId int NOT NULL, name VARCHAR(255) NOT NULL, isDone BOOL DEFAULT 0)';
    connection.query(sql_createSubtaskTable, (err, result) => {
        if (err) throw err;
        console.log('Subtask Table successfully created');
    })

    
        
    // Delets all the values from a table
    connection.connect(function(err) {
        if (err) throw err;
        connection.query("DELETE FROM todos_init", function (err, result, fields) {
            if (err) throw err;
            console.log('Entries successfully deleted.');
        });
    });

    // SQL query to insert a value into a field
    const sql_insertValue = "INSERT INTO todos_init (userId, title, description, deadline) VALUES ?";
    const sql_insertSubtask ="INSERT INTO subtasks_init (mainTaskId, name) VALUES (1, 'Das ist ein subtask')";
    const value = [[1, 'TestTodo', 'Das ist ein TestTodo', '2008-11-11 13:23:44']];
    connection.query(sql_insertValue, [value], (err, result) => {
        if (err) throw err;
        console.log('Value succesfully inserted');
    })
    connection.query(sql_insertSubtask, (err, result) => {
        if (err) throw err;
        console.log('Subtask succesfully inserted');
    })

    // // Reads all the values from a table
    // connection.connect(function(err) {
    //     if (err) throw err;
    //     connection.query("SELECT * FROM todos_init", function (err, result, fields) {
    //       if (err) throw err;
    //       console.log(result);
    //     });
    // });

    // // Alters the value of a certain todo
    // connection.connect(function(err) {
    //     if (err) throw err;
    //     var sql_update = "UPDATE todos_init SET description = 'Die Beschreibung wurde updated' WHERE title = 'TestTodo'";
    //     connection.query(sql_update, function (err, result) {
    //       if (err) throw err;
    //       console.log(result.affectedRows + " record(s) updated");
    //     });
    //     connection.query("SELECT * FROM todos_init", function (err, result, fields) {
    //         if (err) throw err;
    //         console.log(result);
    //       });
    //   });
}

// Checks if connected properly 
connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
    console.log('Connected as id ' + connection.threadId);
    
    // Initialises the database
    initTodoDB();
    // Close the connection
    // connection.end();
});

app.get("/", (req, res) => {
    res.send("<h1>Hello World!</h1>")
})

app.get("/api", (req, res) => {
    var testData;
    // Reads all the values from a table
    connection.connect(function(err) {
        if (err) throw err;
        connection.query("SELECT * FROM todos_init", function (err, result, fields) {
          if (err) throw err;
          res.json(result);
        });
    });
})


function extractTodo(task) {
    let date;
    if (task.deadline != null) {
        date = format(task.deadline, 'yyyy-MM-dd HH:mm:ss');
    } else {
        date = task.date
    };
    const value = [[task.title, task.description, date, task.priority, task.reminder, task.repeat]];
    return value
}

function extractSubtasks(mainTaskId, task) {
    const subtasks = task.subtasks;
    let subtasksArray = [];
    for (let subtask of subtasks) {
        subtasksArray.push([mainTaskId, subtask.name]);
    };
    return subtasksArray
}
// Creates a new entry for new task
app.post("/new-task", (req, res) => {
    res.sendStatus(200);
    const sql = 'INSERT INTO todos_init (title, description, deadline, priority, todoReminder, todoRepeat) VALUES ?';
    const value = extractTodo(req.body.newTask);
    var mainTaskId = 0;
    connection.query(sql, [value] , (err, result) => {
        if(err) {
            console.log('Failed to store new task.');
        }
        else {
            console.log('New Todo with id:', result.insertId, 'saved.');
            // This is for adding the subtasks with its respective maintaskId to another table
            const subtasks = extractSubtasks(result.insertId, req.body.newTask);
            if (subtasks) {
                const sql_subtask = 'INSERT INTO subtasks_init (mainTaskId, name) VALUES ?';
                connection.query(sql_subtask, [subtasks], function (err, result) {
                    if(err) throw err;
                    console.log("Subtasks successfully inserted.");
                })
            } else {
                console.log("No subtasks were added.");
            }
        }
    })
})

// Gets all the todos in the database
app.get('/read-tasks', (req, res) => {
    const sql = 'SELECT * FROM todos_init';
    connection.query(sql, function(err, result) {
        if (err) {
            console.log('Failed to read tasks from Database');
        }
        else {
            console.log('Read tasks from database successfully');
            res.send(result);
        }
    })
})

// Gets all the subtasks in the database
app.get('/read-subtasks', (req, res) => {
    const sql = 'SELECT * FROM subtasks_init';
    connection.query(sql, function(err, result) {
        if (err) {
            console.log('Failed to read subtasks from Database');
        }
        else {
            if (!result) {
                console.log('No subtasks found!')
            } else {
                console.log('Read subtasks from database successfully');
                res.send(result);
            }
        }
    })
})

app.listen(5000, () => { console.log("Server started on port 5000") })

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
