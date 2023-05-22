const { connection } = require("../utils/mysql");
const jwt = require("jsonwebtoken");

exports.sendUserDataControl = (req, res) => {
    const idparam = req.params.id;
    console.log(
        "userdata fetch detected. " + res.statusCode + `. id = ${idparam}`
    );

    try {
        connection.query(
            "SELECT * FROM users WHERE id = ?",
            [idparam],
            async (error, results, fields) => {
                if (error) {
                    console.log(error);
                    return res.status(500).send(error.message);
                }

                if (results.length === 0) {
                    return res.status(202).send("user not found (202)");
                }

                const token = jwt.sign({ id: idparam }, "secretkey");
                const email = results[0].email;
                const username = results[0].username;
                const id = idparam;
                console.log(`(Userdata) The token is : ${token}`);
                return res.status(200).send({ token, email, username, id });
            }
        );
    } catch (err) {
        return res.status(500).send(err.message);
    }
};
