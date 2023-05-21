const { connection } = require("../utils/mysql");

exports.removeSpecialUserControl = async (req, res) => {
    const { id } = req.body;

    connection.query(
        "DELETE FROM special_user WHERE id = ?",
        [id],
        (error, results, fields) => {
            if (error) throw error;

            console.log("ID removed from special_user table");
            res.redirect("/addspecialuser");
        }
    );
};
