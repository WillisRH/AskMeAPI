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
                username VARCHAR(255),
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
  id INT(11),
  questionid INT(11),
  question VARCHAR(255) NOT NULL, 
  token VARCHAR(255)
)`;

const createTableSql2 = `CREATE TABLE questionhandler (
  id INT(11),
  questionid INT(11), 
  questiontitle VARCHAR(255) NOT NULL
)`;

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

connection.query(checkTableSql, ['questionhandler'], function (error, results, fields) {
  if (error) throw error;
  if (results.length === 0) {
    connection.query(createTableSql2, function (error, results, fields) {
      if (error) throw error;
      console.log('Table created (questionhandler)');
    });
  } else {
    console.log('Table already exists (questionhandler)');
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

app.get('/', (req, res) => {
    res.render('home.ejs')
})

app.post('/register', async (req, res) => {
    const randomNumber = Math.floor(Math.random() * Math.pow(10, 12));
    console.log('Register attempt detected! ' + res.statusCode, req.body);
    try {




        connection.query('SELECT * FROM users WHERE email = ? OR username = ?', [req.body.email, req.body.username], async (error, results, fields) => {
            if (results.length > 0) {
                console.log('Email or username is already exist!')
                return res.status(400).send('Email or username already exists');
            }
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            generateUniqueId(connection).then((id2) => {
                connection.query('INSERT INTO users (id, username, email, password) VALUES (?,?,?,?)', [id2, req.body.username, req.body.email, hashedPassword], async (error, results, fields) => {
                    res.status(201).send('User Created');
                    console.log('User created.', hashedPassword)
                });
            })
            
            
        });

        
        
    } catch (e) {
        res.status(500).send(e.message);
    }

});



// app.post('/login', async (req, res) => {
//     // const isFailed = false;
//     console.log('Login attempt detected! ' + res.statusCode, req.body);
//     try {
//         connection.query('SELECT * FROM users WHERE email = ?', [req.body.email], async (error, results, fields) => {
//             if (error) {
//                 console.log(error);
//                 return res.status(500).send(e.message);
//             }
//         if (results.length === 0) {
//             return res.status(400).send('user not found');
//         }
//         const validPass = await bcrypt.compare(req.body.password, results[0].password);
//         if (!validPass) {
//             console.log("Invalid password detected!")
//             return res.status(400).send('Invalid Password');
//         }
//         const token = jwt.sign({ id: results[0].id }, 'secretkey');
//         const email = req.body.email;
//         res.status(200).json({ token, email });
//         console.log('Loggin attempt success!')
//         console.log("The Token is: " + token)
//         });
//     } catch (e) {
//         res.status(500).send(e.message);
//     }
// });

app.post('/login', async (req, res) => {
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
      const email = req.body.email;
      const username = results[0].username;
      const id = results[0].id;
      console.log(id)
      res.status(200).json({ token, email, username, id });
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
        const questionid = req.body.id;
        console.log(req.body);
        const sql = 'INSERT INTO question (id,question, questionid) VALUES (?,?,?)';
        connection.query(sql, [id, question, questionid], function (error, results, fields) {
            if (error) {
                console.error(error);
                res.status(500).send({ error: 'An error occurred while inserting the question.' });
            } else {
                console.log("|-------------------------|")
                console.log('A new record inserted!');
                console.log('ID: ' + id);
                console.log('QuestionID: ' + questionid)
                console.log('A new Question appeared: \"' + question + "\"")
                console.log("|-------------------------|")
                console.log("")
                console.log("")
                res.status(200).send({ message: 'Question submitted successfully.' });
            }
        });
    });
});

const getQuestions = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT id, question, questionid FROM question WHERE questionid = ${id}`;
    connection.query(sql, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

const getQuestionsPerProfile = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT id, questionid, questiontitle FROM questionhandler WHERE id = ${id}`;
    connection.query(sql, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

// const getQuestionsTitle = (questionid) => {
//   return new Promise((resolve, reject) => {
//     const query = `SELECT * FROM questionhandler WHERE questionid = ${questionid}`;
//     connection.query(sql, (error, results) => {
//       if (error) {
//         reject(error);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

app.post('/getquestiontitle/:id', async (req, res) => {
  const questionid = req.params.id;

  const query = `SELECT * FROM questionhandler WHERE questionid = ${questionid}`;
  connection.query(query, (error, results, fields) => {
    if (error) {
      res.send({ error: 'Error fetching data from database' });
      return;
    }

    if (results.length === 0) {
      res.send({ error: 'Question not found' });
      return;
    }

    // Send the response
    res.json({ questiontitle: results[0].questiontitle });
  });
});




app.post('/questionsprofilelist/:id', async (req, res) => {
  const id = req.params.id;
  console.log('Questions getting attempt detected! ' + res.statusCode);
  try {
    const questions = await getQuestionsPerProfile(id);
    res.json(questions);
    console.log('Successfully sending the questionsprofile list! (SUCCESS)')
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving questionsprofile from the database.');
    console.log('Error retrieving questionsprofile from the database. (500)')
  }
})

app.post('/submitquestionprofilelist', async (req, res) => {
  const userid = req.body.userid;
  const question = req.body.question;

  try {
    let randomIntString = await generateUniqueId(connection);
    const sql = 'INSERT INTO questionhandler (id, questionid, questiontitle) VALUES (?, ?, ?)';
    connection.query(sql, [userid, randomIntString, question], function (error, results, fields) {
      if (error) {
        throw error;
      }
      res.status(200).json({ message: 'Success saving the question into the database!' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error when creating question!'});
  }
});

app.post('/getusernamebyquestionid/:id', async (req, res) => {
  const questionId = req.params.id;

  // Query the question table to get the question
  connection.query('SELECT * FROM questionhandler WHERE questionid = ?', [questionId], (error, results) => {
    if (error) throw error;

    // Get the id from the question row
    const id = results[0].id;
    console.log(id)
    // Query the user table to get the username
    connection.query(`SELECT * FROM users WHERE id = ${id}`, (error, results) => {
      if (error) throw error;

      const username = results[0].username;
      res.json(username);
    });
  });
});

app.post('/questionslist', async (req, res) => {
  console.log('Questions getting attempt detected! ' + res.statusCode);
  const id = req.body.id;
  try {
    const questions = await getQuestions(id);
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

// app.get('/profile', (req, res) => {
//   const token = req.cookies.token;
//   const email = req.cookies.email;

//   if (!token || !email) {
//     return res.json({ error: 'No token or email found in cookie' });
//   }

//   return res.json({ token: token, email: email });
// });


app.post('/status', (req, res) => {
    res.status(200).send('Server is running.');
    console.log('Someone is pinged to this API!')
});

// TODO Bikin Profile, Kelarin UI, Cookies, and more.

app.listen(3000, () => console.log('Server started on port 3000'));