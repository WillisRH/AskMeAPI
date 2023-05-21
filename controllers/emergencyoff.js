const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
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

const emergencyOff = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if (blockedIPs[req.ip] >= 3 || blockedEmails[email] >= 3) {
        console.log(`Blocked IP: ${req.ip}`);
        console.log(`Blocked email: ${email}`);
        return res
            .status(429)
            .send(
                "Too many requests! Your IP and your E-Mail is blocked! Please try again later."
            );
    }

    try {
        connection.query(
            "SELECT * FROM users WHERE email = ?",
            [email],
            async (error, results, fields) => {
                if (error) {
                    console.log(error);
                    return res.status(500).send(error.message);
                }
                if (results.length === 0) {
                    blockedEmails[email] = blockedEmails[email]
                        ? blockedEmails[email] + 1
                        : 1;
                    return res.status(400).send("User not found");
                }
                const validPass = await bcrypt.compare(
                    password,
                    results[0].password
                );
                if (!validPass) {
                    console.log("Invalid password detected!");
                    blockedIPs[req.ip] = blockedIPs[req.ip]
                        ? blockedIPs[req.ip] + 1
                        : 1;
                    blockedEmails[email] = blockedEmails[email]
                        ? blockedEmails[email] + 1
                        : 1;
                    return res
                        .status(400)
                        .send(
                            `Invalid Password (Attempt ${blockedIPs[req.ip]}/3)`
                        );
                }
                const token = jwt.sign({ id: results[0].id }, "secretkey");
                console.log("The Token is: " + token);
                console.log("Server is turning off...");
                res.status(400).send("Server is turning off...");
                process.exit();
            }
        );
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
};

module.exports = {
    emergencyOff,
};
