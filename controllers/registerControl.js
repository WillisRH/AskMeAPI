const { connection } = require("../utils/mysql");
const bcrypt = require("bcrypt");

exports.registerControl = async (req, res) => {
    const randomNumber = Math.floor(Math.random() * Math.pow(10, 12));
    console.log("Register attempt detected! " + res.statusCode, req.body);
    try {
        connection.query(
            "SELECT * FROM users WHERE email = ? OR username = ?",
            [req.body.email, req.body.username],
            async (error, results, fields) => {
                if (error) {
                    console.log(error, error.message);
                    return res.status(205).send("error kocak");
                }
                console.log(results);
                if (results.length != 0) {
                    console.log("Email or username is already exist!");
                    return res
                        .status(400)
                        .send("Email or username already exists");
                }
                const salt = await bcrypt.genSalt();
                const hashedPassword = await bcrypt.hash(
                    req.body.password,
                    salt
                );
                generateUniqueId(connection).then((id2) => {
                    connection.query(
                        "INSERT INTO users (id, username, email, password) VALUES (?,?,?,?)",
                        [
                            id2,
                            req.body.username,
                            req.body.email,
                            hashedPassword,
                        ],
                        async (error, results, fields) => {
                            res.status(201).send("User Created");
                            console.log("User created.", hashedPassword);
                        }
                    );
                });
            }
        );
    } catch (e) {
        res.status(500).send(e.message);
    }
};
