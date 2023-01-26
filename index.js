const express = require('express');
const app = express();
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const mysql = require('mysql');

/**
 * 
 * Database thing
 * 
*/

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'userdata',
  charset: 'utf8mb4'
});

connection.connect(err => {
    if (err) {
        console.log(err);
    }
    else {
        console.log("Connected to database");
        connection.query(
            `CREATE TABLE IF NOT EXISTS users (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                token VARCHAR(255) 
            )`,
            (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Table created");
                }
            }
        );
    }
});

const checkTableSql = 'SHOW TABLES LIKE ?';
const createTableSql = `CREATE TABLE question (
  id INT(11) AUTO_INCREMENT PRIMARY KEY,
  question VARCHAR(255) NOT NULL
)`;

const sqlusers = `CREATE TABLE IF NOT EXISTS users (
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  loggedin BOOLEAN DEFAULT FALSE
)`;


connection.query(sqlusers, ['users'], function (error, results, fields) {
  if (error) throw error;
  if (results.length === 0) {
    connection.query(createTableSql, function (error, results, fields) {
      if (error) throw error;
      console.log('Table created (users)');
    });
  } else {
    console.log('Table already exists (users)');
  }
});

connection.query(checkTableSql, ['question'], function (error, results, fields) {
  if (error) throw error;
  if (results.length === 0) {
    connection.query(createTableSql, function (error, results, fields) {
      if (error) throw error;
      console.log('Table created (question)');
    });
  } else {
    console.log('Table already exists (question)');
  }
});

// connection.query("INSERT INTO users (email, password) VALUES ('user@example.com','password')", function (err, result) {
//     if (err) throw err;
//     console.log("User created");
// });

/**
 * 
 * Express thing
 * 
 */

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true })); 

app.use(bodyParser.json());


function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
  
  function generateUniqueId(connection) {
    return new Promise((resolve, reject) => {
        let randomInt = getRandomInt(999999999999) + 100000000000; // 12 digits
        let randomIntString = randomInt.toString().padStart(12, '0');
  
      // Query the database to see if the id already exists
      const sql = 'SELECT COUNT(*) as count FROM users WHERE id = ?';
      connection.query(sql, [randomIntString], function (error, results, fields) {
        if (error) {
          reject(error);
        } else {
          // If the id already exists, generate a new random id
          if (results[0].count > 0) {
            resolve(generateUniqueId(connection));
          } else {
            // If the id is unique, return it
            resolve(randomIntString);
          }
        }
      });
    });
  }

app.get('/' && '/register' && '/login', (req, res) => {
    res.send('This is AskMe API')
})

app.post('/register', async (req, res) => {
    const randomNumber = Math.floor(Math.random() * Math.pow(10, 12));
    console.log('Register attempt detected! ' + res.statusCode, req.body);
    try {
        connection.query('SELECT * FROM users WHERE email = ?', [req.body.email], async (error, results, fields) => {
            if (results.length > 0) {
                console.log('email is already exist!')
                return res.status(400).send('email already exists');
            }
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            generateUniqueId(connection).then((id2) => {
                connection.query('INSERT INTO users (id, email, password) VALUES (?,?,?)', [id2, req.body.email, hashedPassword], async (error, results, fields) => {
                    res.status(201).send('User Created');
                    console.log('User created.', hashedPassword)
                });
            })
            
            
        });
        
    } catch (e) {
        res.status(500).send(e.message);
    }

});



app.post('/login', async (req, res) => {
    // const isFailed = false;
    console.log('Login attempt detected! ' + res.statusCode, req.body);
    try {
        connection.query('SELECT * FROM users WHERE email = ?', [req.body.email], async (error, results, fields) => {
            if (error) {
                console.log(error);
                return res.status(500).send(e.message);
            }
        if (results.length === 0) {
            return res.status(400).send('user not found');
        }
        const validPass = await bcrypt.compare(req.body.password, results[0].password);
        if (!validPass) {
            console.log("Invalid password detected!")
            return res.status(400).send('Invalid Password');
        }
        const token = jwt.sign({ id: results[0].id }, 'secretkey');
        res.status(200).json({ token });
        console.log('Loggin attempt success!')
        console.log("The Token is: " + token)
        });
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// Submit logical.
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function generateUniqueId(connection) {
    return new Promise((resolve, reject) => {
        let randomInt = getRandomInt(99999) + 10000;
        let randomIntString = randomInt.toString().padStart(5, '0');

        // Query the database to see if the id already exists
        const sql = 'SELECT COUNT(*) as count FROM question WHERE id = ?';
        connection.query(sql, [randomIntString], function (error, results, fields) {
            if (error) {
                reject(error);
            } else {
                // If the id already exists, generate a new random id
                if (results[0].count > 0) {
                    resolve(generateUniqueId(connection));
                } else {
                    // If the id is unique, return it
                    resolve(randomIntString);
                }
            }
        });
    });
}

app.post('/submit', function (req, res) {
    generateUniqueId(connection).then((id) => {
        const question = req.body.question;
        const sql = 'INSERT INTO question (id,question) VALUES (?, ?)';
        connection.query(sql, [id, question], function (error, results, fields) {
            if (error) {
                console.error(error);
                res.status(500).send({ error: 'An error occurred while inserting the question.' });
            } else {
                console.log("|-------------------------|")
                console.log('A new record inserted!');
                console.log('ID: ' + id);
                console.log('A new Question appeared: \"' + question + "\"")
                console.log("|-------------------------|")
                console.log("")
                console.log("")
                res.status(200).send({ message: 'Question submitted successfully.' });
            }
        });
    });
});

const getQuestions = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id, question FROM question';
    connection.query(sql, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

app.post('/questionslist', async (req, res) => {
  console.log('Questions getting attempt detected! ' + res.statusCode);
  try {
    const questions = await getQuestions();
    res.json(questions);
    console.log('Successfully sending the questions list! (SUCCESS)')
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving questions from the database.');
    console.log('Error retrieving questions from the database. (500)')
  }
})

app.post('/questions/:id', (req, res) => {
  // Get the ID of the question from the request parameters
  console.log('Question getting attempt detected! ' + res.statusCode);
  const id = req.params.id;
  const query = `SELECT * FROM question WHERE id = ${id}`;
  try {
    connection.query(query, function (error, results, fields) {
        if (error) throw error;
        res.status(200).send(results[0]);
        console.log('Successfully sending the question! (SUCCESS)')
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

app.post('/questions/:id/delete', (req, res) => {
  // Get the ID of the question from the request parameters
  console.log('Question deleting attempt detected! ' + res.statusCode);
  const id = req.params.id;
  const query = `DELETE FROM question WHERE id = ${id}`;
  try {
    connection.query(query, function (error, results, fields) {
        if (error) throw error;
        res.status(200).send(`Successfully deleting the question! (Question ID: ${id})`);
        console.log(`Successfully deleting the question! (Question ID: ${id})`)
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

app.post('/status', (req, res) => {
    res.status(200).send('Server is running.');
    console.log('Someone is pinged to this API!')
});

app.listen(3000, () => console.log('Server started on port 3000'));