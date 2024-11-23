const mysql = require('mysql2')
const express = require('express')
const cors = require('cors')

const dotenv = require('dotenv')
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT,
    database: process.env.MYSQL_DB
  })
const app = express()
app.use(cors())

// Checks if connected properly 
connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
    console.log('Connected as id ' + connection.threadId);
    
    // SQL query to create the database only if it does not exist
    const sql_createDb = 'CREATE DATABASE IF NOT EXISTS medienprojektdb';
    connection.query(sql_createDb, (err, result) => {
        if (err) {
            console.error('Error creating database:', err.message);
            return;
        }
        console.log('Database created or already exists');
    });

    // SQL query to create a dummy table for testing purposes
    const sql_createTable = 
        'CREATE TABLE IF NOT EXISTS todos_init (userId int NOT NULL, todoId int NOT NULL primary key AUTO_INCREMENT, title VARCHAR(255) NOT NULL, description MEDIUMTEXT, subtasks VARCHAR(255) DEFAULT "[""]", deadline DATETIME, priority ENUM("none", "low", "medium", "high") NOT NULL, isDone BOOL DEFAULT 0, todoReminder varchar(255) DEFAULT "Nie", todoRepeat varchar(255) DEFAULT "Nie", todoDeleted BOOL DEFAULT 0)';
        connection.query(sql_createTable, (err, result) => {
            if (err) throw err;
            console.log('Table successfully created');
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
    const value = [[1, 'TestTodo', 'Das ist ein TestTodo', '2008-11-11 13:23:44']];
    connection.query(sql_insertValue, [value], (err, result) => {
        if (err) throw err;
        console.log('Value succesfully inserted');
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
    // res.json({"users": ["userOne", "userTwo", "userThree"]})
})

// Creates a new entry for new task
app.post("/new-task", (req, res) => {
    console.log(req.body);
    const sql = 'INSERT INTO todos_init (task) VALUES (?)';
    connection.query(sql, [req.body.jsonString] , (err, result) => {
        if(err) {
            console.log('Failed to store new task.');
        }
        else {
            console.log('New Todo saved.')
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
