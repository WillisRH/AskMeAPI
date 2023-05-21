function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function generateUniqueId(connection) {
    return new Promise((resolve, reject) => {
        let randomInt = getRandomInt(999999999999) + 100000000000; // 12 digits
        let randomIntString = randomInt.toString().padStart(12, "0");

        // Query the database to see if the id already exists
        const sql = "SELECT COUNT(*) as count FROM users WHERE id = ?";
        connection.query(
            sql,
            [randomIntString],
            function (error, results, fields) {
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
            }
        );
    });
}

module.exports = {
    generateUniqueId,
};
