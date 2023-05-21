const express = require('express');
const app = express();
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const mysql = require('mysql');
const cors = require('cors');
require("dotenv").config();
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

const createTableSql3 = `CREATE TABLE special_user (
  id INT(11) PRIMARY KEY
)`;

connection.query(checkTableSql, ['special_user'], function (error, results, fields) {
  if (error) throw error;
  if (results.length === 0) {
    connection.query(createTableSql3, function (error, results, fields) {
      if (error) throw error;
      console.log('Table created (special_user)');
    });
  } else {
    console.log('Table already exists (special_user)');
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

const acceptedIps = process.env.ACCEPTEDIP ? process.env.ACCEPTEDIP.split(',') : null;

const checkIpMiddleware = (req, res, next) => {
  const acceptedIps = process.env.ACCEPTEDIP;
  if (!acceptedIps) {
    return next(); // skip this middleware if ACCEPTEDIP is not defined
  }
  const ip = req.ip.replace(/[^0-9.]/g, '');
  if (acceptedIps.split(',').includes(ip)) {
    next(); // continue to the next middleware or route
  } else {
    res.status(403).send('Access Denied'); // return a 403 Forbidden response
    console.log(`[DENIED] Someone is pinged to this API! (${req.ip})`)
  }
};
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cors());
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

const requestsPerIP = {};

// Array to keep track of blocked IP addresses
const blockedIPs = [];

// POST route to turn off the server
// app.post("/emergencyoff", (req, res) => {
//   const ip = req.ip;
//   const password = req.body.password;

//   if (blockedIPs.includes(ip)) {
//     res.status(403).send("Access Denied. Your IP address has been blocked.");
//     return;
//   }

//   if (password === process.env.emergencypass) {
//     res.status(200).send("Server is turning off...");

//     // Terminate the Node.js process
//     process.exit();
//   } else if (password === null || password === undefined) {
//     res.status(401).send("Password must be exist!");
//   } else {
//     // Increment the count for the number of requests from this IP address
//     requestsPerIP[ip] = requestsPerIP[ip] ? requestsPerIP[ip] + 1 : 1;
//     const attempts = requestsPerIP[ip] || 0;
//     if (attempts >= 3) {
//       blockedIPs.push(ip);
//       res.status(403).send(`Access Denied. Your IP address has been blocked.`);
//       return;
//     }
//     res.status(401).send(`Wrong Password! Attempt ${attempts}`);
//   }
// });

const blockedEmails = {};

app.post('/emergencyoff', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (blockedIPs[req.ip] >= 3 || blockedEmails[email] >= 3) {
    console.log(`Blocked IP: ${req.ip}`);
    console.log(`Blocked email: ${email}`);
    return res.status(429).send('Too many requests! Your IP and your E-Mail is blocked! Please try again later.');
  }

  try {
    connection.query('SELECT * FROM users WHERE email = ?', [email], async (error, results, fields) => {
      if (error) {
        console.log(error);
        return res.status(500).send(error.message);
      }
      if (results.length === 0) {
        blockedEmails[email] = blockedEmails[email] ? blockedEmails[email] + 1 : 1;
        return res.status(400).send('User not found');
      }
      const validPass = await bcrypt.compare(password, results[0].password);
      if (!validPass) {
        console.log('Invalid password detected!');
        blockedIPs[req.ip] = blockedIPs[req.ip] ? blockedIPs[req.ip] + 1 : 1;
        blockedEmails[email] = blockedEmails[email] ? blockedEmails[email] + 1 : 1;
        return res.status(400).send(`Invalid Password (Attempt ${blockedIPs[req.ip]}/3)`);
      }
      const token = jwt.sign({ id: results[0].id }, 'secretkey');
      console.log('The Token is: ' + token);
      console.log('Server is turning off...');
      res.status(400).send('Server is turning off...');
      process.exit();
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
});

app.post('/register', checkIpMiddleware, async (req, res) => {
    const randomNumber = Math.floor(Math.random() * Math.pow(10, 12));
    console.log('Register attempt detected! ' + res.statusCode, req.body);
    try {




        connection.query('SELECT * FROM users WHERE email = ? OR username = ?', [req.body.email, req.body.username], async (error, results, fields) => {
            if (results.length > 0) {
                console.log('Email or username is already exist!')
                return res.status(202).send('Email or username already exists');
            }
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            generateUniqueId(connection).then((id2) => {
                connection.query('INSERT INTO users (id, username, email, password) VALUES (?,?,?,?)', [id2, req.body.username, req.body.email, hashedPassword], async (error, results, fields) => {
                    res.status(200).send('User Created');
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

app.post('/login', checkIpMiddleware, async (req, res) => {
  console.log('Login attempt detected! ' + res.statusCode, req.body);
  try {
      connection.query('SELECT * FROM users WHERE email = ?', [req.body.email], async (error, results, fields) => {
          if (error) {
              console.log(error);
              return res.status(500).send(e.message);
          }
      if (results.length === 0) {
          return res.status(202).send('user not found (202)');
      }
      const validPass = await bcrypt.compare(req.body.password, results[0].password);
      if (!validPass) {
          console.log("Invalid password detected!")
          return res.status(201).send('Invalid Password (201)');
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

// app.post('/senduserdata', checkIpMiddleware, async (req, res) => {
//   console.log('Userdata fetch detected. ' + res.statusCode, req.body);
//   try {
//       connection.query('SELECT * FROM users WHERE email = ?', [req.body.email], async (error, results, fields) => {
//           if (error) {
//               console.log(error);
//               return res.status(500).send(e.message);
//           }
//       if (results.length === 0) {
//           return res.status(202).send('user not found (202)');
//       }
//       const token = jwt.sign({ id: results[0].id }, 'secretkey');
//       const email = req.body.email;
//       const username = results[0].username;
//       const id = results[0].id;
//       res.status(200).json({ token, email, username, id });
//       console.log("{Userdata} The Token is: " + token)
//       });
//   } catch (e) {
//       res.status(500).send(e.message);
//   }
// });

app.post('/senduserdata/:id', checkIpMiddleware, async (req, res) => {
  const idparam = req.params.id;
  console.log('Userdata fetch detected. ' + res.statusCode, idparam);
  try {
      connection.query('SELECT * FROM users WHERE id = ?', [idparam], async (error, results, fields) => {
          if (error) {
              console.log(error);
              return res.status(500).send(e.message);
          }
      if (results.length === 0) {
          return res.status(202).send('user not found (202)');
      }
      const token = jwt.sign({ id: idparam }, 'secretkey');
      const email = results[0].email;
      const username = results[0].username;
      const id = idparam;
      res.status(200).json({ token, email, username, id });
      console.log("{Userdata} The Token is: " + token)
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

// app.post('/submit', function (req, res) {
//     generateUniqueId(connection).then((id) => {
//         const question = req.body.question;
//         const questionid = req.body.id;
//         console.log(req.body);
//         const sql = 'INSERT INTO question (id,question, questionid) VALUES (?,?,?)';
//         connection.query(sql, [id, question, questionid], function (error, results, fields) {
//             if (error) {
//                 console.error(error);
//                 res.status(500).send({ error: 'An error occurred while inserting the question.' });
//             } else {
//                 console.log("|-------------------------|")
//                 console.log('A new record inserted!');
//                 console.log('ID: ' + id);
//                 console.log('QuestionID: ' + questionid)
//                 console.log('A new Question appeared: \"' + question + "\"")
//                 console.log("|-------------------------|")
//                 console.log("")
//                 console.log("")
//                 res.status(200).send({ message: 'Question submitted successfully.' });
//             }
//         });
//     });
// });

app.post('/submit', checkIpMiddleware, function (req, res) {
  generateUniqueId(connection).then((id) => {
      const question = req.body.question;
      const questionid = req.body.id;
      console.log(req.body);
      const checkSql = 'SELECT COUNT(*) AS count FROM questionhandler WHERE questionid = ?';
      connection.query(checkSql, [questionid], function (error, results, fields) {
          if (error) {
              console.error(error);
              res.status(500).send({ error: 'An error occurred while checking the question ID.' });
          } else {
              const count = results[0].count;
              if (count > 0) {
                  const insertSql = 'INSERT INTO question (id,question, questionid) VALUES (?,?,?)';
                  connection.query(insertSql, [id, question, questionid], function (error, results, fields) {
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
              } else {
                  res.status(400).send({ error: 'Invalid question ID.' });
              }
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

app.post('/getquestiontitle/:id', checkIpMiddleware, async (req, res) => {
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




app.post('/questionsprofilelist/:id', checkIpMiddleware, async (req, res) => {
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

app.post('/submitquestionprofilelist', checkIpMiddleware, async (req, res) => {
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

app.post('/getusernamebyquestionid/:id', checkIpMiddleware, async (req, res) => {
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

app.post('/questionslist', checkIpMiddleware, async (req, res) => {
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

app.post('/questions/:id', checkIpMiddleware, (req, res) => {
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

app.post('/questions/:id/delete', checkIpMiddleware, (req, res) => {
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


app.post('/session/:id/delete', checkIpMiddleware, (req, res) => {
  // Get the ID of the question from the request parameters
  console.log('Question deleting attempt detected! ' + res.statusCode);
  const qid = req.params.id;
  const query = `DELETE FROM questionhandler WHERE questionid = ${qid}`;
  try {
    connection.query(query, function (error, results, fields) {
        if (error) throw error;
        res.status(200).send(`Successfully deleting the session! (Session ID: ${qid})`);
        console.log(`Successfully deleting the session! (Session ID: ${qid})`)
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

app.get('/addspecialuser', async (req, res) => {
  try {
    connection.query('SELECT special_user.id, users.username FROM special_user LEFT JOIN users ON special_user.id = users.id', function(error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send('An error occurred');
        return;
      }
      const specialUsers = results.map(result => ({
        id: result.id,
        username: result.username,
      }));
      res.render('addspuser.ejs', { specialUsers });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/addspecialuser', checkIpMiddleware, (req, res) => {
  const id = req.body.id; // assuming the submitted form contains a field named "id"
  if(isNaN(id)) {
    res.send('Bukan Angka!')
    return
  }

  connection.query(
    'INSERT INTO special_user (id) VALUES (?)',
    [id],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error inserting data into database');
      } else {
        console.log(`Special user ${id} added to database`);
        res.redirect('/addspecialuser') // redirect to a page that lists all special users
      }
    }
  );
});

app.post('/specialuserlist', checkIpMiddleware, async (req, res) => {
  connection.query('SELECT id FROM special_user', function(error, results, fields) {
    if (error) throw error;
    const ids = results.map(result => result.id);
    console.log(ids);
    res.json(ids);
  });
});

app.post('/removespecialuser', checkIpMiddleware, async (req, res) => {
  const { id } = req.body;

  connection.query('DELETE FROM special_user WHERE id = ?', [id], (error, results, fields) => {
    if (error) throw error;

    console.log('ID removed from special_user table')
    res.redirect('/addspecialuser') 
  });
});

app.post('/status', checkIpMiddleware, (req, res) => {
    res.status(200).send('Server is running.');
    console.log(`Someone is pinged to this API! (${req.ip})`)
});

// TODO Bikin Profile, Kelarin UI, Cookies, and more.

app.listen(3000, () => console.log('Server started on port 3000'));