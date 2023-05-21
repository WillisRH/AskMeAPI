const { connection } = require("../utils/mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.loginControl = async (req, res) => {
    console.log("Login attempt detected! " + res.statusCode, req.body);
    try {
        connection.query(
            "SELECT * FROM users WHERE email = ?",
            [req.body.email],
            async (error, results, fields) => {
                if (error) {
                    console.log(error);
                    return res.status(500).send(e.message);
                }
                if (results.length === 0) {
                    return res.status(201).send("user not found");
                }
                const validPass = await bcrypt.compare(
                    req.body.password,
                    results[0].password
                );
                if (!validPass) {
                    console.log("Invalid password detected!");
                    return res.status(202).send("Invalid Password");
                }
                const token = jwt.sign({ id: results[0].id }, "secretkey");
                const email = req.body.email;
                const username = results[0].username;
                const id = results[0].id;
                console.log(id);
                res.status(200).json({ token, email, username, id });
                console.log("Loggin attempt success!");
                console.log("The Token is: " + token);
            }
        );
    } catch (e) {
        res.status(500).send(e.message);
    }
};

// comment willis
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
