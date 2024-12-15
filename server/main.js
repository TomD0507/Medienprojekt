const mysql = require("mysql2");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cron = require("node-cron");
const bcrypt = require("bcrypt");
const { format } = require("date-fns");

const app = express();

dotenv.config();
app.use(cors());
app.use(bodyParser.json());

const connection = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  port: process.env.MYSQL_PORT,
  database: process.env.MYSQL_DB,
  waitForConnections: true,  // Wait for an available connection (default: true)
  connectionLimit: 50,       // Maximum number of connections in the pool
  queueLimit: 0              // Max number of queries allowed to wait in the queue before rejection
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
        todoReminder VARCHAR(255) DEFAULT 'Nie',
        todoRepeat ENUM('Nie', 'Täglich', 'Wöchentlich', 'Monatlich') DEFAULT 'Nie',
        todoDeleted BOOL DEFAULT 0,
        dateCreated DATETIME NOT NULL,
        dateDeleted DATETIME,
        isRepeated BOOL DEFAULT false,
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
      displayName VARCHAR(255) DEFAULT NULL,
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
}

initTodoDB();
app.post("/create-dummy-users", (req, res) => {
  // SQL query to insert multiple users into the database
  const sql_insertValue =
    "INSERT INTO users_init (name, password, displayName) VALUES ?";

  // Predefined values for users
  const value = [
    ["user1", "8g96c%MDjRrC:3Sw", "user1"],
    ["user2", "<kn5%Vn!CwX-5?X$", "user2"],
    ["user3", "Q>z<68aNqYZ3qta5", "user3"],
    ["user4", "@#9C4-F4Ejq<.Ufe", "user4"],
    ["user5", "R}jayT>2NMd7Sc)x", "user5"],
    ["testUser", "winterMP", "testUser"]
  ];

  // Execute the query to insert users
  connection.query(sql_insertValue, [value], (err, result) => {
    if (err) {
      console.error("Error inserting users:", err);
      return res.status(500).json({ error: "Failed to create users" });
    }
    
    console.log("Users successfully created.");
    res.status(200).json({ message: "Users successfully created." });
  });
});

app.get("/", (req, res) => {
  res.send("<h1>Hello World!</h1>");
});

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
app.post("/update-task", async (req, res) => {
  try {
    res.sendStatus(200);
    
    const subtasks = extractSubtasks(req.body);
    const task = extractTodo(req.body);

    // Deleting all the subtasks (they either get added back, extended or deleted after all), task[9] is userId and task[10] is taskId
    const sql_delete = "DELETE FROM subtasks_init WHERE userId = ? AND mainTaskId = ?";
    await helperQuery(sql_delete, [task[9], task[10]]);
    // connection.query(sql_delete, [task[9], task[10]], function(err, result) {
    //   if (err) throw err;
    //   else console.log("Updating subtasks...");
    // });

    
    // Updating the main task nevertheless
    const sql_update =
      "UPDATE todos_init SET title = ?, description = ?, deadline = ?, priority = ?, isDone = ?, todoReminder = ?, todoRepeat = ?, todoDeleted = ?, dateDeleted = ? WHERE userId = ? AND todoId = ?";
    await helperQuery(sql_update, task);
    // connection.query(sql, task, function(err, result) {
    //   if (err) {
    //     throw err;
    //     console.log("Failed to update task.");
    //   } else {
    //     // task[8] is the maintaskID
    //     console.log("Task with id:", task[10], "successfully updated.");
    //   }
    // });
    

    // Updating the subtasks
    if (subtasks.length != 0) {
      const sql_newSubtasks = "INSERT INTO subtasks_init (userId, mainTaskId, name, isDone) VALUES ?";
      await helperQuery(sql_newSubtasks, [subtasks]);
      // connection.query(sql_newSubtasks, [subtasks], function(err, result) {
      //   if (err) throw err;
      //   else console.log("Subtasks were successfully updated!");
      // });
    } 
  } catch (err) {
    console.log(err);
  }
});


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
      console.log("Failed to read tasks from Database:", err);
    } else {
      console.log("Read tasks from database successfully");
      res.send(result);
    }
  });
});

// Gets all the subtasks in the database
app.get("/read-subtasks", (req, res) => {
  const userId = req.query.id;
  const sql = "SELECT * FROM subtasks_init WHERE userId = ?";
  connection.query(sql, [userId],function (err, result) {
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

// Helper function to login a user
function loginUser(username, password) {
  const sql = "SELECT * FROM users_init WHERE name = ?";
  connection.query(sql, [username], function (err, result) {
    if (err) {
      console.log("Login call attempt failed!");
    // } else if (result.length === 0) {
    //   // Kein Benutzer mit passendem Namen und Passwort gefunden
    //   res.json({ id: -1, name: "" });
    } else if (result.length === 0) {
      console.log("Did not find a user with this name.")
    } else {
      const user = result[0];
      console.log(user.name);
      const match = bcrypt.compareSync(password, user.password);
      if (match) {
        console.log("Login successful.");
        // res.json({ id: user.id, name: user.displayName });
      } else {
        console.log("Invalid password");
      }
    }
  });
}

// Checks if the username and password exist and returns id + name if it does
app.get("/login-user", (req, res) => {
  const sql = "SELECT * FROM users_init WHERE name = ? AND password = ?";
  connection.query(sql, [req.query.name, req.query.pw], function (err, result) {
    if (err) {
      console.log("Login call attempt failed!");
    } else if (result.length === 0) {
      // Kein Benutzer mit passendem Namen und Passwort gefunden
      res.json({ id: -1, name: "" });
    } else {
      res.json({ id: result[0].id, name: result[0].displayName });
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

//get a list of all Usernames registered
app.get("/get-user-list", (req, res)=>{
  const sql="SELECT name,displayName FROM users_init";
  connection.query(sql,[], function (err, result){
    if (err) {
      console.log("Error getting userlist!");
    } else {
      res.send(result);
    }
  });
});

// Logic for handling repeatable tasks
function handleRepeatingTasks() {
  const sql_getTasks = `
    SELECT userId, todoId, title, description, deadline, todoRepeat, dateCreated
    FROM todos_init
    WHERE deadline < NOW() AND todoRepeat != 'Nie' AND todoDeleted = FALSE AND isRepeated = FALSE
  `;
  // Query for getting all the relevant tasks
  connection.query(sql_getTasks, function (err, result) {
    if (err) {
      console.log("Error when getting all the tasks:", err)
    } else {
      const repeatableTasks = result;
      for (const task of repeatableTasks) {
        const newDeadline = nextDeadline(task.deadline, task.todoRepeat);
        const currentTime = format(Date.now(), "yyyy-MM-dd HH:mm:ss");
        const prio = (task.priority == null) ? "none" : task.priority;
        const reminder = (task.todoReminder == null) ? "Nie" : task.todoReminder
        getMaxTodoId(function(err, maxId) {
          if (err) {
            console.error("Error fetching max TodoId:", err);
          } else {
            const taskArray = [task.userId, maxId, task.title, task.description, newDeadline, prio, reminder, task.todoRepeat, currentTime]
            
            // Query for creating the new repeated tasks
            const sql_setRepeatedTask = `
              INSERT INTO todos_init (userId, todoId, title, description, deadline, priority, todoReminder, todoRepeat, dateCreated) VALUES ?
            `
            connection.query(sql_setRepeatedTask, [[taskArray]], function (err_1, _) {
              if (err_1) {
                console.log("Error when inserting the new repeatable Tasks into DB:", err_1);
              } else {
                console.log("Repeating tasks successfully initialized!");
              }
            });
            
            // Query for updating the bool flag of the repeated tasks
            const sql_update = "UPDATE todos_init SET isRepeated = TRUE WHERE todoId = ?";
            connection.query(sql_update, [task.todoId], function(err_2, _) {
              if (err_2) {
                console.log("Error when updating bool flag for repeated:", err_2);
              }
            });

            // Query for getting all the subtasks to be repeated:
            const sql_getSubtasks = `
              SELECT userId, name
              FROM subtasks_init
              WHERE mainTaskId = ?
            `;
            connection.query(sql_getSubtasks, [task.todoId], function(err_sub, result_sub) {
              if (err_sub) {
                console.log("Error when fetching subtasks of repeatable task:", err_sub);
              } else {
                // Query for inserting repeating subtasks
                subtasks = result_sub;
                for (subtask of subtasks) {
                  const sql_setRepeatedSubtask = `
                    INSERT INTO subtasks_init (userId, mainTaskId, name) VALUES (?,?,?)
                  `;
                  connection.query(sql_setRepeatedSubtask, [task.userId, maxId, subtask.name], function(err_sub_insert, _) {
                    if (err_sub_insert) {
                      console.log("Error when inserting the new subtasks:", err_sub_insert);
                    } else  {
                      console.log("Repeating subtasks successfully initialized!");
                    }
                  });
                }
              }
            })
          }
        });
      } 
    };
  });
};

// Helper function to calculate the next deadline (extendable for further reapeatable options)
function nextDeadline(deadline, todoRepeat) {
  const currentDeadline = new Date(deadline);
  switch(todoRepeat) {
    case "Täglich": {
      currentDeadline.setDate(currentDeadline.getDate() + 1);
      return format(new Date(currentDeadline.toISOString()), "yyyy-MM-dd HH:mm:ss");
    }
    case "Wöchentlich": {
      currentDeadline.setDate(currentDeadline.getDate() + 7);
      return format(new Date(currentDeadline.toISOString()), "yyyy-MM-dd HH:mm:ss");
    }
    case "Monatlich": {
      currentDeadline.setMonth(currentDeadline.getMonth() + 1);
      return format(new Date(currentDeadline.toISOString()), "yyyy-MM-dd HH:mm:ss");
    }
    default: return null;
  }
}

// Helper function to get the highest ID from the table
function getMaxTodoId(callback) {
  const sql = "SELECT MAX(todoId) AS maxTodoId FROM todos_init"
  connection.query(sql, function (err, result) {
    if (err) {
      console.log("Failed getting the highest id from the table!");
      callback(err, null);
    } else {
      const maxIds = result[0];
      const maxId = maxIds.maxTodoId + 1;
      callback(null, maxId);
    }
  });
}

// Helper function to get hash a password
function hashPassword(password) {
  const saltRounds = 10; // Value between 10 and 12 is considered safe
  return bcrypt.hashSync(password, saltRounds);
}

// Helper function to delete user
function deleteUser(username) {
  const sql = 
    "DELETE FROM users_init WHERE name = ?"
  connection.query(sql, [username], (err, result) => {
    if (err) {
      console.log("Could not delete username:", err)
    } else {
      console.log("Successfully deleted user with username:", username);
    }
  })
}

// Helper function to register a new user
function registerUser(userName, password) {
  const sql =
    "INSERT INTO users_init (name, password, displayName) VALUES (?, ?, ?)";
  const passwordHash = hashPassword(password);
  connection.query(sql, [userName, passwordHash, userName], (err, result) => {
    if (err) throw err;
    console.log("User succesfully registered.");
  });
}

// Helper function for queries
async function helperQuery(sql, params) {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve(err);
    })
  })
}

// Registers a new user
app.post("/register-user", (req, res) => {
  registerUser(req.body.name, req.body.pw);
})

app.listen(5000, '0.0.0.0', () => {
  console.log('Backend läuft auf Port 5000');
});

// Schedule the repeating task handler to run daily at midnight
cron.schedule('0 0 * * *', () => {
  console.log('Checking for repeating tasks...');
  handleRepeatingTasks();
});
