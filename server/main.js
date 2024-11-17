const mysql = require('mysql2')
const express = require('express')
const cors = require('cors')

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'medienprojekt',
    port: "3307"
  })
const app = express()
app.use(cors())

//Checks if connected properly 
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

app.get("/", (req, res) => {
    res.send("<h1>Hello World!</h1>")
})

app.get("/api", (req, res) => {
    // Hier könnte Ihr Code stehen (Daten aus Datenbank ziehen)
    res.json({"users": ["userOne", "userTwo", "userThree"]})
})

app.listen(5000, () => { console.log("Server started on port 5000") })
