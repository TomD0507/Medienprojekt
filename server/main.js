const mysql = require("mysql2");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { format } = require("date-fns");

const app = express();

dotenv.config();
app.use(cors());
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  port: process.env.MYSQL_PORT,
  database: process.env.MYSQL_DB,
});

function initTodoDB() {
  // SQL query to create the database only if it does not exist
  /*const sql_createDb = "CREATE DATABASE IF NOT EXISTS medienprojektdb";
  connection.query(sql_createDb, (err, result) => {
    if (err) {
      console.error("Error creating database:", err.message);
      return;
    }
    console.log("Database created or already exists");
  });*/

  // SQL query to drop previous init table
  /*
  const sql_dropTaskTable = "DROP TABLE IF EXISTS todos_init";
  connection.query(sql_dropTaskTable, (err, result) => {
    if (err) throw err;
    console.log("Previous todo table deleted.");
  });

  // SQL query to drop previous subtask table
  const sql_dropSubtaskTable = "DROP TABLE IF EXISTS subtasks_init";
  connection.query(sql_dropSubtaskTable, (err, result) => {
    if (err) throw err;
    console.log("Previous subtasks table deleted.");
  });
  */
  // SQL query to create a dummy table for testing purposes
  const sql_createTaskTable = `
    CREATE TABLE IF NOT EXISTS todos_init (
        userId INT NOT NULL DEFAULT 1,
        todoId INT NOT NULL DEFAULT 1,
        title VARCHAR(255) NOT NULL,
        description MEDIUMTEXT,
        deadline DATETIME,
        priority ENUM('none', 'low', 'medium', 'high') NOT NULL DEFAULT 'none',
        isDone BOOL DEFAULT false,
        todoReminder ENUM('Nie', 'Täglich', 'Wöchentlich', 'Monatlich') DEFAULT 'Nie',
        todoRepeat ENUM('Nie', 'Täglich', 'Wöchentlich', 'Monatlich') DEFAULT 'Nie',
        todoDeleted BOOL DEFAULT 0,
        dateCreated DATETIME NOT NULL,
        dateDeleted DATETIME,
        PRIMARY KEY (userId, todoId)
    )
    `;
  connection.query(sql_createTaskTable, (err, result) => {
    if (err) throw err;
    console.log("Table successfully created");
  });

  // SQL query to create a dummy table for testing purposes
  const sql_createSubtaskTable = `
    CREATE TABLE IF NOT EXISTS subtasks_init (
      id INT NOT NULL AUTO_INCREMENT,
      userId INT NOT NULL DEFAULT 1,
      mainTaskId int NOT NULL,
      name VARCHAR(255) NOT NULL,
      isDone BOOL DEFAULT false,
      PRIMARY KEY (id)
    )
    `;
  connection.query(sql_createSubtaskTable, (err, result) => {
    if (err) throw err;
    console.log("Subtask Table successfully created");
  });


  // SQL query to create a dummy table for testing purposes
  const sql_createUserTable = `
    CREATE TABLE IF NOT EXISTS users_init (
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      tasksCreated int NOT NULL DEFAULT 0,
      tasksDone int NOT NULL DEFAULT 0,
      PRIMARY KEY (id)
    )
    `;
  connection.query(sql_createUserTable, (err, result) => {
    if (err) throw err;
    console.log("User Table successfully created");
  });

  // SQL query to inititalize 5 dummy users and one developer user called "testUser"
  // const sql_insertValue =
  //   "INSERT INTO users_init (name, password) VALUES ?";
  // const value = [
  //   ["user1", "8g96c%MDjRrC:3Sw"],
  //   ["user2", "<kn5%Vn!CwX-5?X$"],
  //   ["user3", "Q>z<68aNqYZ3qta5"],
  //   ["user4", "@#9C4-F4Ejq<.Ufe"],
  //   ["user5", "R}jayT>2NMd7Sc)x"],
  //   ["testUser", "winterMP"]
  // ];
  // connection.query(sql_insertValue, [value], (err, result) => {
  //   if (err) throw err;
  //   console.log("Users succesfully created.");
  // });

  // Delets all the values from a table
  // connection.connect(function (err) {
  //   if (err) throw err;
  //   connection.query("DELETE FROM todos_init", function (err, result, fields) {
  //     if (err) throw err;
  //     console.log("Entries successfully deleted.");
  //   });
  // });

  // SQL query to insert a value into a field
  /*
  const sql_insertValue =
    "INSERT INTO todos_init (userId, todoId, title, description, deadline, dateCreated) VALUES ?";
  const sql_insertSubtask =
    "INSERT INTO subtasks_init (userId, mainTaskId, name) VALUES (1, 42, 'Das ist ein subtask')";
  const value = [
    [1, 42, "TestTodo", "Das ist ein TestTodo", "2008-11-11 13:23:44", "2007-10-12 12:01:34"],
  ];
  connection.query(sql_insertValue, [value], (err, result) => {
    if (err) throw err;
    console.log("Value succesfully inserted");
  });
  connection.query(sql_insertSubtask, (err, result) => {
    if (err) throw err;
    console.log("Subtask succesfully inserted");
  });
  */

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
connection.connect(function (err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }
  console.log("Connected as id " + connection.threadId);

  // Initialises the database
  initTodoDB();
  // Close the connection
  // connection.end();
});

app.get("/", (req, res) => {
  res.send("<h1>Hello World!</h1>");
});
/*
app.get("/api", (req, res) => {
  // Reads all the values from a table
  connection.connect(function (err) {
    if (err) throw err;
    connection.query(
      "SELECT * FROM todos_init",
      function (err, result, fields) {
        if (err) throw err;
        res.json(result);
      }
    );
  });
});
*/

// Function to create a NEW Todoarray from a request body for SQL INSERT
// @PARAM: reqBody is the body of the request sent
function createTodo(reqBody) {
  let date;
  let dateNow = format(Date.now(), "yyyy-MM-dd HH:mm:ss");
  if (reqBody.newTask.deadline != null) {
    date = format(reqBody.newTask.deadline, "yyyy-MM-dd HH:mm:ss");
  } else {
    date = reqBody.newTask.date;
  }
  const value = [
    [
      reqBody.userID,
      reqBody.newTask.id,
      reqBody.newTask.title,
      reqBody.newTask.description,
      date,
      reqBody.newTask.priority,
      reqBody.newTask.reminder,
      reqBody.newTask.repeat,
      dateNow
    ],
  ];
  return value;
}

// Function to extract a NEW Subtaskarray from a request body for SQL INSERT
// @PARAM: reqBody is the body of the request sent
function extractNewSubtasks(reqBody) {
  const subtasks = reqBody.newTask.subtasks;
  let subtasksArray = [];
  for (let subtask of subtasks) {
    subtasksArray.push([reqBody.userID, reqBody.newTask.id, subtask.name]);
  }
  return subtasksArray;
}

// Creates a new entry for new task
app.post("/new-task", (req, res) => {
  res.sendStatus(200);
  const sql =
    "INSERT INTO todos_init (userId, todoId, title, description, deadline, priority, todoReminder, todoRepeat, dateCreated) VALUES ?";
  const value = createTodo(req.body);
  connection.query(sql, [value], (err, result) => {
    if (err) {
      console.log("Failed to store new task.");
    } else {
      console.log("New Todo with id:", req.body.newTask.id, "saved.");
      // This is for adding the subtasks with its respective maintaskId to another table
      const subtasks = extractNewSubtasks(req.body);
      if (subtasks.length != 0) {
        const sql_subtask =
          "INSERT INTO subtasks_init (userId, mainTaskId, name) VALUES ?";
        connection.query(sql_subtask, [subtasks], function (err, result) {
          if (err) {
            console.log(err);
          } else {
            console.log("Subtasks successfully inserted.");
          }
        });
      } else {
        console.log("No subtasks were added.");
      }
    }
  });
});


// Function to UPDATE an ALREADY EXISTING Todoarray from a request body for SQL INSERT
// @PARAM: reqBody is the body of the request sent
function extractTodo(reqBody) {
  let date;
  if (reqBody.updatedTask.deadline != null) {
    date = format(reqBody.updatedTask.deadline, "yyyy-MM-dd HH:mm:ss");
  } else {
    date = null;
  }

  let dateDeleted = null;
  if(reqBody.updatedTask.deleted) {
    dateDeleted = format(Date.now(), "yyyy-MM-dd HH:mm:ss");
  }
  const value = [
      reqBody.updatedTask.title,
      reqBody.updatedTask.description,
      date,
      reqBody.updatedTask.priority,
      reqBody.updatedTask.done,
      reqBody.updatedTask.reminder,
      reqBody.updatedTask.repeat,
      reqBody.updatedTask.deleted,
      dateDeleted,
      reqBody.userID,
      reqBody.updatedTask.id
  ];
  return value;
}

// Function to extract a Subtaskarray from a request body of an updatedTask for SQL INSERT
// @PARAM: reqBody is the body of the request sent
function extractSubtasks(reqBody) {
  const subtasks = reqBody.updatedTask.subtasks;
  let subtasksArray = [];
  for (let subtask of subtasks) {
    subtasksArray.push([reqBody.userID, reqBody.updatedTask.id, subtask.name, subtask.done]);
  }
  return subtasksArray;
}


// Updates a already existing task
app.post("/update-task", (req, res) => {
  res.sendStatus(200);
  const subtasks = extractSubtasks(req.body);
  const task = extractTodo(req.body);
  
  // Deleting all the subtasks (they either get added back, extended or deleted after all), task[9] is userId and task[10] is taskId
  const sql_delete = "DELETE FROM subtasks_init WHERE userId = ? AND mainTaskId = ?";
  connection.query(sql_delete, [task[9], task[10]], function(err, result) {
    if (err) throw err;
    else console.log("Updating subtasks...");
  });

  // Updating the main task nevertheless
  const sql =
    "UPDATE todos_init SET title = ?, description = ?, deadline = ?, priority = ?, isDone = ?, todoReminder = ?, todoRepeat = ?, todoDeleted = ?, dateDeleted = ? WHERE userId = ? AND todoId = ?";
  connection.query(sql, task, function(err, result) {
    if (err) {
      throw err;
      console.log("Failed to update task.");
    } else {
      // task[8] is the maintaskID
      console.log("Task with id:", task[10], "successfully updated.");
    }
  });

  // Updating the subtasks
  if (subtasks.length != 0) {
    const sql_newSubtasks = "INSERT INTO subtasks_init (userId, mainTaskId, name, isDone) VALUES ?";
    connection.query(sql_newSubtasks, [subtasks], function(err, result) {
      if (err) throw err;
      else console.log("Subtasks were successfully updated!");
    });
  }
})


// Deletes an existing todo
app.post("/delete-task", (req, res) => {
  const sql = "UPDATE todos_init SET todoDeleted = ?, dateDeleted = ? WHERE userId = ? AND mainTaskId = ?";
  connection.query(sql, [true, Date.now(), req.body.userID, req.body.deletedTask.id], function(err, result) {
    if (err) throw err;
    else console.log("Task with id:", req.body.deletedTask.id, "was successfuly deleted!");
  })
})

// Gets all the todos in the database
app.get("/read-tasks", (req, res) => {
  const userId = req.query.id;
  const sql = "SELECT * FROM todos_init WHERE userId = ?";
  connection.query(sql, [userId], function (err, result) {
    if (err) {
      console.log("Failed to read tasks from Database");
      console.log(err);
    } else {
      console.log("Read tasks from database successfully");
      res.send(result);
    }
  });
});

// Gets all the subtasks in the database
app.get("/read-subtasks", (req, res) => {
  const sql = "SELECT * FROM subtasks_init";
  connection.query(sql, function (err, result) {
    if (err) {
      console.log("Failed to read subtasks from Database");
    } else {
      if (!result) {
        console.log("No subtasks found!");
      } else {
        console.log("Read subtasks from database successfully");
        res.send(result);
      }
    }
  });
});

// Checks if the username and password exist and returns id + name if it does
app.get("/login-user", (req, res) => {
  const sql = "SELECT * FROM users_init WHERE name = ? AND password = ?";
  connection.query(sql, [req.query.name, req.query.pw], function (err, result) {
    if (err) {
      console.log("Login call attempt failed!");
    } else {
      res.json({ id: result[0].id, name: result[0].name });
    }
  });
});

// Checks if the username and password exist and returns id + name if it does
app.get("/exists-user", (req, res) => {
  const sql = "SELECT EXISTS (SELECT 1 FROM users_init WHERE name = ?) AS user_exists";
  connection.query(sql, [req.query.name], function (err, result) {
    if (err) {
      console.log("Checking if user exists-call attempt failed!");
    } else {
      const userExists = result[0].user_exists === 1;
      res.json({ userExists: userExists });
    }
  });
});

// Registers a new user
app.post("/register-user", (req, res) => {
  const sql =
    "INSERT INTO users_init (name, password) VALUES (?, ?)";
  console.log(req.body);
  connection.query(sql, [req.body.name, req.body.pw], (err, result) => {
    if (err) throw err;
    console.log("User succesfully registered.");
  });
})

app.listen(5000, '0.0.0.0', () => {
  console.log('Backend läuft auf Port 5000');
});
