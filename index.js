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
                id INT AUTO_INCREMENT PRIMARY KEY,
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


app.use(bodyParser.json());


app.get('/' && '/register' && '/login', (req, res) => {
    res.send('This is AskMe API')
})

app.post('/register', async (req, res) => {
    console.log('Register attempt detected! ' + res.statusCode, req.body);
    try {
        connection.query('SELECT * FROM users WHERE email = ?', [req.body.email], async (error, results, fields) => {
            if (results.length > 0) {
                return res.status(400).send('email already exists');
            }
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            connection.query('INSERT INTO users (email, password) VALUES (?,?)', [req.body.email, hashedPassword], async (error, results, fields) => {
                res.status(201).send('User Created');
                console.log('User created.', hashedPassword)
            });
            
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

app.get('/status', (req, res) => {
    res.status(200).send('Server is running.');
});

app.listen(3000, () => console.log('Server started on port 3000'));