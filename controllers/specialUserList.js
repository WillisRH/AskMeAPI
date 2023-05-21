const { connection } = require("../utils/mysql");

exports.specialUserListControl = async (req, res) => {
    connection.query(
        "SELECT id FROM special_user",
        function (error, results, fields) {
            if (error) throw error;
            const ids = results.map((result) => result.id);
            console.log(ids);
            res.json(ids);
        }
    );
};
