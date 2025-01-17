const mysql = require("mysql2");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cron = require("node-cron");
// const bcrypt = require("bcrypt");
const argon2 = require("argon2");
const nodemailer = require("nodemailer");

const { format } = require("date-fns");
const { errorMonitor } = require("nodemailer/lib/xoauth2");

const app = express();

dotenv.config();
app.use(cors());
app.use(bodyParser.json());


// Transport for e-mail notification
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  // secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})


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
      email VARCHAR(255),
      PRIMARY KEY (id)
    )
    `;
  connection.query(sql_createUserTable, (err, result) => {
    if (err) throw err;
    console.log("User Table successfully created");
  });
  // Create users_pixels table
const sql_createUsersPixelsTable = `
CREATE TABLE IF NOT EXISTS users_pixels (
  id INT NOT NULL AUTO_INCREMENT,
  userId INT NOT NULL,
  pixels INT DEFAULT 0,
  PRIMARY KEY (id),
  FOREIGN KEY (userId) REFERENCES users_init(id) ON DELETE CASCADE
)
`;
connection.query(sql_createUsersPixelsTable, (err, result) => {
if (err) throw err;
console.log("Users Pixels Table successfully created");
});

// Create stats table
const sql_createStatsTable = `
CREATE TABLE IF NOT EXISTS stats (
  id INT NOT NULL AUTO_INCREMENT,
  userId INT NOT NULL,
  interactions INT DEFAULT 0,
  lastLogin TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (userId) REFERENCES users_init(id) ON DELETE CASCADE
)
`;
connection.query(sql_createStatsTable, (err, result) => {
if (err) throw err;
console.log("Stats Table successfully created");
});
const sql_createSettingsTable = `
  CREATE TABLE IF NOT EXISTS settings (
    id INT NOT NULL AUTO_INCREMENT,
    mode INT DEFAULT 0,
    PRIMARY KEY (id)
  )
`;

connection.query(sql_createSettingsTable, (err, result) => {
  if (err) throw err;
  console.log("Settings Table successfully created.");
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
function createTodo(reqBody,userId) {
  let date;
  let dateNow = format(Date.now(), "yyyy-MM-dd HH:mm:ss");
  if (reqBody.newTask.deadline != null) {
    date = format(reqBody.newTask.deadline, "yyyy-MM-dd HH:mm:ss");
  } else {
    date = reqBody.newTask.date;
  }
  const value = [
    [
      userId,
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
function extractNewSubtasks(reqBody,userId) {
  const subtasks = reqBody.newTask.subtasks;
  let subtasksArray = [];
  for (let subtask of subtasks) {
    subtasksArray.push([userId, reqBody.newTask.id, subtask.name]);
  }
  return subtasksArray;
}

async function getUserId(body) {
  return new Promise((resolve, reject) => {
    const { name, password } = body;

    if (!name || !password) {
      return resolve(-1); // Missing credentials
    }

    // Query to fetch user by name
    const sql = "SELECT * FROM users_init WHERE name = ?";
    connection.query(sql, [name], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return reject(err); // Internal error
      }

      if (results.length === 0) {
        console.log("User not found.");
        return resolve(-1); // User not found
      }

      const user = results[0];
      const hashedPassword = user.password;

      // Compare the provided password with the hashed password
      const isMatch = bcrypt.compareSync(password, hashedPassword);
      if (!isMatch) {
        console.log("Invalid password.");
        return resolve(-1); // Invalid password
      }

      console.log("Authentication successful.");
      resolve(user.id); // Return the userId
    });
  });}
// Creates a new entry for new task
app.post("/new-task", async (req, res) => {
  const userId = await getUserId(req.body);

  if (userId === -1) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const sql =
    "INSERT INTO todos_init (userId, todoId, title, description, deadline, priority, todoReminder, todoRepeat, dateCreated) VALUES ?";
  const value = createTodo(req.body,userId);
  connection.query(sql, [value], (err, result) => {
    if (err) {
      console.log("Failed to store new task.");
    } else {
      console.log("New Todo with id:", req.body.newTask.id, "saved.");
      // This is for adding the subtasks with its respective maintaskId to another table
      const subtasks = extractNewSubtasks(req.body,userId);
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
function extractTodo(reqBody,userId) {
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
      userId,
      reqBody.updatedTask.id
  ];
  return value;
}

// Function to extract a Subtaskarray from a request body of an updatedTask for SQL INSERT
// @PARAM: reqBody is the body of the request sent
function extractSubtasks(reqBody,userId) {
  const subtasks = reqBody.updatedTask.subtasks;
  let subtasksArray = [];
  for (let subtask of subtasks) {
    subtasksArray.push([userId, reqBody.updatedTask.id, subtask.name, subtask.done]);
  }
  return subtasksArray;
}

app.post("/update-task", async (req, res) => {
  try {const userId = await getUserId(req.body);

    if (userId === -1) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const subtasks = extractSubtasks(req.body,userId);
    const task = extractTodo(req.body,userId);

    // Ensure task has all required fields
    if (!task || task.length < 11) {
      return res.status(400).json({ error: "Invalid task data" });
    }

    // Fetch user by name
    const sqlUser = "SELECT * FROM users_init WHERE name = ?";
    connection.query(sqlUser, [name], async (err, users) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (users.length === 0) {
        console.log("User not found.");
        return res.status(404).json({ message: "User not found" });
      }

      const user = users[0];
      const hashedPassword = user.password;

      // Authenticate the password
      const match = authenticate(password, hashedPassword); // Ensure `authenticate` is implemented securely
      if (!match) {
        console.log("Invalid password.");
        return res.status(401).json({ message: "Invalid password" });
      }

      // Delete existing subtasks for the task
      const sqlDeleteSubtasks = `
        DELETE FROM subtasks_init 
        WHERE userId = ? AND mainTaskId = ?`;
      await helperQuery(sqlDeleteSubtasks, [user.id, task.id]);

      // Update the main task
      const sqlUpdateTask = `
        UPDATE todos_init 
        SET title = ?, description = ?, deadline = ?, priority = ?, 
            isDone = ?, todoReminder = ?, todoRepeat = ?, todoDeleted = ?, dateDeleted = ? 
        WHERE userId = ? AND todoId = ?`;
      const taskData = [
        task.title,
        task.description,
        task.deadline,
        task.priority,
        task.isDone,
        task.todoReminder,
        task.todoRepeat,
        task.todoDeleted,
        task.dateDeleted,
        user.id,
        task.id,
      ];
      await helperQuery(sqlUpdateTask, taskData);

      // Insert new subtasks if they exist
      if (subtasks.length > 0) {
        const sqlInsertSubtasks = `
          INSERT INTO subtasks_init (userId, mainTaskId, name, isDone) 
          VALUES ?`;
        const subtaskData = subtasks.map((subtask) => [
          user.id,
          task.id,
          subtask.name,
          subtask.isDone,
        ]);
        await helperQuery(sqlInsertSubtasks, [subtaskData]);
      }

      console.log("Task updated successfully.");
      res.status(200).json({ message: "Task updated successfully", taskId: task.id });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Deletes an existing todo
app.post("/delete-task", async(req, res) => {
  const userId = await getUserId(req.body);

  if (userId === -1) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const sql = "UPDATE todos_init SET todoDeleted = ?, dateDeleted = ? WHERE userId = ? AND mainTaskId = ?";
  connection.query(sql, [true, Date.now(), userId, req.body.deletedTask.id], function(err, result) {
    if (err) throw err;
    else console.log("Task with id:", req.body.deletedTask.id, "was successfuly deleted!");
  })
})

// Gets all the todos in the database
app.get("/read-tasks", async (req, res) => {
  const userId = await getUserId(req.query);

  if (userId === -1) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
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
app.get("/read-subtasks", async (req, res) => {
  const userId = await getUserId(req.query);

  if (userId === -1) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
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
// Checks if the username and password exist and returns id + name if it does
app.get("/login-user", async (req, res) => {
  try {
    const { name, pw } = req.query;

    if (!name || !pw) {
      return res.status(400).json({ id: -1, mode: 0, pixels: 0, message: "Missing name or password" });
    }

    // Fetch user by name
    const sqlUser = "SELECT * FROM users_init WHERE name = ?";
    connection.query(sqlUser, [name], async (err, users) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ id: -1, mode: 0, pixels: 0, message: "Internal server error" });
      }

      if (users.length === 0) {
        console.log("User not found.");
        return res.status(404).json({ id: -1, mode: 0, pixels: 0, message: "User not found" });
      }

      const user = users[0];
      const hashedPassword = user.password;

      // Authenticate the password
      const match = authenticate(pw, hashedPassword); // Ensure `authenticate` is implemented correctly
      if (!match) {
        console.log("Invalid password.");
        return res.status(401).json({ id: -1, mode: 0, pixels: 0, message: "Invalid password" });
      }

      // Fetch user's pixels and mode
      const sqlPixels = "SELECT * FROM users_pixels WHERE userid = ?";
      connection.query(sqlPixels, [user.id], (err, pixelsResult) => {
        if (err) {
          console.error("Error fetching user pixels:", err);
          return res.status(500).json({ id: -1, mode: 0, pixels: 0, message: "Internal server error" });
        }

        const pixelsData = pixelsResult[0] || { pixels: 0, mode: 0 };
        console.log("Login successful.");
        res.status(200).json({
          id: user.id,
          mode: currentMode ,
          pixels: pixelsData.pixels || 0,
          message: "Login successful",
        });
      });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ id: -1, mode: 0, pixels: 0, message: "Internal server error" });
  }
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

// Sets the e-mail adress for an user
app.post("/update-email", async(req, res) => {
  try {
    const userId = await getUserId(req.body);

  if (userId === -1) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
    res.sendStatus(200);
    const sql = "UPDATE users_init SET email=? WHERE id = ?";
    const email = req.body.email;
    
    connection.query(sql, [email, userId], function (err, _) {
      if (err) {
        console.log("Error setting the E-Mail:", err);
        throw err;
      } else {
        console.log("E-Mail has been set successfully!");
      }
    })
  } catch (err) {
    console.log(err);
    throw err;
  }
})

// Deletes the e-mail adress for an user
app.post("/delete-email", async(req, res) => {
  try {const userId = await getUserId(req.body);

    if (userId === -1) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.sendStatus(200);
    const sql = "UPDATE users_init SET email= NULL WHERE id = ?";
    
    connection.query(sql, [userId], function (err, _) {
      if (err) {
        console.log("Error deleting the E-Mail:", err);
        throw err;
      } else {
        console.log("E-Mail has been deleted successfully!");
      }
    })
  } catch (err) {
    console.log(err);
    throw err;
  }
})

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
async function hashPassword(password) {
  try {
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1
    });
    return hash;
  } catch (err) {
    console.error("Something went wrong hashing a password:", err);
    throw err;
  }
}

// Helper function to authenticate with password and stored hash
async function authenticate(password, hashedPassword) {
  try {
    const match = await argon2.verify(hashedPassword, password);
    if (match) {
      console.log("Authentication successful!");
    } else {
      console.log("Authentication failed!")
    }
    return match;
  } catch (err) {
    console.error("Error while authentification process:", err);
    throw err;
  }
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
async function registerUser(userName, password) {
  // SQL to insert the new user into the users_init table
  const sql_insertUser = "INSERT INTO users_init (name, password, displayName) VALUES (?, ?, ?)";
  const passwordHash = await hashPassword(password);

  connection.query(sql_insertUser, [userName, passwordHash, userName], (err, result) => {
    if (err) {
      console.error("Error registering user:", err);
      throw err;
    }

    // Get the generated userId from the inserted user
    const userId = result.insertId; // This is the auto-generated user ID

    console.log("User successfully registered with ID:", userId);

    // Insert into users_pixels table
    const sql_insertPixels = "INSERT INTO users_pixels (userId, mode, pixels) VALUES (?, ?, ?)";
    connection.query(sql_insertPixels, [userId, 0, 0], (err, result) => {
      if (err) {
        console.error("Error inserting into users_pixels:", err);
        throw err;
      }
      console.log("User pixels entry successfully created.");
    });

    // Insert into stats table
    const sql_insertStats = "INSERT INTO stats (userId, interactions) VALUES (?, ?)";
    connection.query(sql_insertStats, [userId, 0], (err, result) => {
      if (err) {
        console.error("Error inserting into stats:", err);
        throw err;
      }
      console.log("User stats entry successfully created.");
    });
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


/**
 * API for sending an E-Mail 
 * @param { to, subject, text, html}, the frontend it needs an e-mail (receiver) as to,
 * the subject, a text and optionally an html body 
 */
app.post("/send-email", async (req, res) => {
  const { to, subject, text, html } = req.body;
  try {
    const result = await sendMail(to, subject, text, html);
    res.status(200).json({ message: "Email sent succfessfully", result});
  } catch (err) {
    res.status(500).json({ message: "Error while sending an email", err })
  }
});


// Function for sending an email
const sendMail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    });
    console.log('Email successfully sent: %s', info.messageId);
    return info;
  } catch (err) {
    console.error('Error occurred while sending:', error);
    throw error;
  }
};

// Helper that checks if you need a reminder
function needRemind(deadline, todoRepeat) {
  const deadlineDate = new Date(deadline);
  const currentDate = new Date(Date.now());
  switch(todoRepeat) {
    case "1 Stunde vorher": {
      const oneHourEarlier = new Date(deadlineDate.getTime() - 60 * 60 * 1000); // Current time - 1 hour in ms
      if (
        currentDate.getFullYear() === oneHourEarlier.getFullYear() &&
        currentDate.getMonth() === oneHourEarlier.getMonth() &&
        currentDate.getDate() === oneHourEarlier.getDate() &&
        currentDate.getHours() === oneHourEarlier.getHours() &&
        currentDate.getMinutes() === oneHourEarlier.getMinutes()
      ) {
        console.log("Reminder für eine Stunde vorher triggered!");
        return 1;
      }else {
        return -1;
      }
    }
    case "6 Stunden vorher": {
      const sixHoursEarlier = new Date(deadlineDate.getTime() - 6 * 60 * 60 * 1000); // Current time - 6 hour in ms
      if (
        currentDate.getFullYear() === sixHoursEarlier.getFullYear() &&
        currentDate.getMonth() === sixHoursEarlier.getMonth() &&
        currentDate.getDate() === sixHoursEarlier.getDate() &&
        currentDate.getHours() === sixHoursEarlier.getHours() &&
        currentDate.getMinutes() === sixHoursEarlier.getMinutes()
      ) {
        console.log("Reminder für sechs Stunden vorher triggered!");
        return 6;
      } else {
        return -1;
      }
    }
    case "12 Stunden vorher": {
      const twelveHoursEarlier = new Date(deadlineDate.getTime() - 12 * 60 * 60 * 1000); // Current time - 12 hour in ms
      if (
        currentDate.getFullYear() === twelveHoursEarlier.getFullYear() &&
        currentDate.getMonth() === twelveHoursEarlier.getMonth() &&
        currentDate.getDate() === twelveHoursEarlier.getDate() &&
        currentDate.getHours() === twelveHoursEarlier.getHours() &&
        currentDate.getMinutes() === twelveHoursEarlier.getMinutes()
      ) {
        console.log("Reminder für zwölf Stunden vorher triggered!");
        return 12;
      } else {
        return -1;
      }
    }
    case "1 Tag vorher": {
      const oneDayEarlier = new Date(deadlineDate.getTime() - 24 * 60 * 60 * 1000); // Current time - 1 day in ms
      if (
        currentDate.getFullYear() === oneDayEarlier.getFullYear() &&
        currentDate.getMonth() === oneDayEarlier.getMonth() &&
        currentDate.getDate() === oneDayEarlier.getDate() &&
        currentDate.getHours() === oneDayEarlier.getHours() &&
        currentDate.getMinutes() === oneDayEarlier.getMinutes()
      ) {
        console.log("Reminder für einen Tag vorher triggered!");
        return 24;
      } else {
        return -1;
      }
    }
    case "3 Tage vorher": {
      const threeDaysEarlier = new Date(deadlineDate.getTime() - 3 * 24 * 60 * 60 * 1000); // Current time - 3 days in ms
      if (
        currentDate.getFullYear() === threeDaysEarlier.getFullYear() &&
        currentDate.getMonth() === threeDaysEarlier.getMonth() &&
        currentDate.getDate() === threeDaysEarlier.getDate() &&
        currentDate.getHours() === threeDaysEarlier.getHours() &&
        currentDate.getMinutes() === threeDaysEarlier.getMinutes()
      ) {
        console.log("Reminder für drei Tage vorher triggered!");
        return 72;
      } else {
        return -1;
      }
    }
    case "1 Woche vorher": {
      const oneWeekEarlier = new Date(deadlineDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Current time - 3 days in ms
      if (
        currentDate.getFullYear() === oneWeekEarlier.getFullYear() &&
        currentDate.getMonth() === oneWeekEarlier.getMonth() &&
        currentDate.getDate() === oneWeekEarlier.getDate() &&
        currentDate.getHours() === oneWeekEarlier.getHours() &&
        currentDate.getMinutes() === oneWeekEarlier.getMinutes()
      ) {
        console.log("Reminder für eine Woche vorher triggered!");
        return 168;
      } else {
        return -1;
      }
    }
    default: return -1;
  }
}

// Logic for handling reminder
function handleReminder() {
  const sql_getTasks = `
    SELECT t.userId, t.title, t.deadline, t.todoReminder, u.email AS userEmail
    FROM todos_init t
    INNER JOIN users_init u ON t.userId = u.id
    WHERE isDone = FALSE AND todoReminder != 'Nie' AND todoDeleted = FALSE
  `;
  // Query for getting all the relevant tasks
  connection.query(sql_getTasks, function (error, result) {
    if (error) {
      console.log("Error when getting all the tasks for reminding:", error)
    } else {
      const reminderTasks = result;
      for (const task of reminderTasks) {
        if(!task.userEmail) {
          console.log(`No email saved for this user with id: ${task.userId}, task "${task.title}" was skipped.`);
          continue;
        }
        const needsReminder = needRemind(task.deadline, task.todoReminder);
        if (needsReminder > 0) {
          const reminderHours = {
            1: "in 1 Stunde",
            6: "in 6 Stunden",
            12: "in 12 Stunden",
            24: "in 1 Tag",
            72: "in 3 Tagen",
            168: "in 1 Woche",
          }[needsReminder];

          if (reminderHours) {
            transporter.sendMail(
              {
                from: process.env.EMAIL_USER,
                to: task.userEmail, // Use the user's email from the database
                subject: "Reminder für einen deiner Tasks!",
                text: `Dein Task "${task.title}" fällt ${reminderHours} an!`,
              },
              (err, info) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log(info);
                }
              }
            );
          } else {
            console.log("-1 was returned or invalid reminder case.");
          }
        };
      };
    };
  });
};


cron.schedule('* * * * *', () => {
  console.log("New minute");
  handleReminder(); // Check every minute
});

module.exports = sendMail;

// mode 
let currentMode = 0; // Default mode value

const readModeFromDatabase = () => {
  const sql = "SELECT mode FROM settings WHERE id = 1"; // Assuming only one row in settings table
  connection.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching mode from database:", err);
    } else if (result.length > 0) {
      currentMode = result[0].mode;
      console.log("Current mode loaded from database:", currentMode);
    } else {
      console.log("No mode found in database, using default mode.");
    }
  });
};

// Call the function on server startup
readModeFromDatabase();

app.post("/update-mode", (req, res) => {
  const { mode } = req.body; // Assuming mode is passed in the request body

  if (typeof mode !== "number") {
    return res.status(400).json({ error: "Mode must be a number" });
  }

  // Update the mode in the database
  const sql_updateMode = "UPDATE settings SET mode = ? WHERE id = 1";
  connection.query(sql_updateMode, [mode], (err, result) => {
    if (err) {
      console.error("Error updating mode in database:", err);
      return res.status(500).json({ error: "Failed to update mode" });
    }

    // Update the mode in memory
    currentMode = mode;
    console.log("Mode updated to:", currentMode);

    res.status(200).json({ message: "Mode updated successfully", mode: currentMode });
  });
});

//pwall
const pixelstates = {};
// Endpoint to handle pixel submission
app.post("/pixels/submit", (req, res) => {
  const { currentUserID, changes } = req.body;

  // Validate input
  if (!currentUserID || !Array.isArray(changes)) {
    return res.status(400).json({ error: "Invalid input data" });
  }

  // Ensure the userID exists in pixelstates
  if (!pixelstates[currentUserID]) {
    pixelstates[currentUserID] = [];
  }

  // Add the changes to the user's pixel data
  changes.forEach((change) => {
    pixelstates[currentUserID].push({
      xCoordinate: change.xCoordinate,
      yCoordinate: change.yCoordinate,
      color: change.color,
      timestamp: new Date(change.timestamp), // Ensure timestamp is a Date object
    });
  });

  // Respond with a success message
  res.status(200).json({ message: "Pixels submitted successfully!" });
});

// Endpoint to get pixel data for debugging or visualization
app.get("/pixels", (req, res) => {
  res.status(200).json(pixelstates);
});