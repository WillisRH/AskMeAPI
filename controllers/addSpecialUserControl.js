const { connection } = require("../utils/mysql");

exports.addSpecialUserGetControl = async (req, res) => {
    try {
        connection.query(
            "SELECT special_user.id, users.username FROM special_user LEFT JOIN users ON special_user.id = users.id",
            function (error, results, fields) {
                if (error) {
                    console.error(error);
                    res.status(500).send("An error occurred");
                    return;
                }
                const specialUsers = results.map((result) => ({
                    id: result.id,
                    username: result.username,
                }));
                res.render("addspuser.ejs", { specialUsers });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

exports.addSpecialUserPostControl = (req, res) => {
    const id = req.body.id; // assuming the submitted form contains a field named "id"
    if (isNaN(id)) {
        res.send("Bukan Angka!");
        return;
    }

    connection.query(
        "INSERT INTO special_user (id) VALUES (?)",
        [id],
        (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send("Error inserting data into database");
            } else {
                console.log(`Special user ${id} added to database`);
                res.redirect("/addspecialuser"); // redirect to a page that lists all special users
            }
        }
    );
};
