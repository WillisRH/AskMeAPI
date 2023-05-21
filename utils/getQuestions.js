const { connection } = require("./mysql");

exports.getQuestions = (id) => {
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

exports.getQuestionsPerProfile = (id) => {
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
