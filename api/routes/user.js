module.exports.read = function(request, response, connectionPool) {
    connectionPool.getConnection(function(error, connection) {
        if (error && connection !== null && connection !== undefined) {
            connection.release();
            response.json({"code" : 500, "status" : "Error in database connection"});
            return;
        } else if (error) {
            response.json({"code" : 500, "status" : "Error in database connection"});
            return;
        } else {
            var query = "select * from user order by last_name, first_name, email";

            connection.query(query, function(error,rows){
                connection.release();
                if (!error) {
                    response.json(rows);
                    return;
                } else {
                    response.json({"code" : 500, "status" : "Error in database query"});
                    return;         
                }
            });
        }
    });
}

module.exports.login = function(request, response, connectionPool, md5) {
    connectionPool.getConnection(function(error, connection) {
        if (error && connection !== null && connection !== undefined) {
            connection.release();
            response.json({"code" : 500, "status" : "Error in database connection"});
            return;
        } else if (error) {
            response.json({"code" : 500, "status" : "Error in database connection"});
            return;
        } else {
            var email    = request.body.email,
                password = md5(request.body.password);

            var query = "select *, count(*) as is_correct_login from user where email = ? and password = ?";

            connection.query(query, [email,password], function(error, rows) {
                connection.release();
                if (!error) {
                    response.json(rows);
                    return;
                } else {
                    response.json({"code" : 500, "status" : "Error in database query"});
                    return;
                }
            });
        }
    });
}

module.exports.create = function(request, response, connectionPool, md5) {
    connectionPool.getConnection(function(error, connection) {
        if (error && connection !== null && connection !== undefined) {
            connection.release();
            response.json({"code" : 500, "status" : "Error in database connection"});
            return;
        } else if (error) {
            response.json({"code" : 500, "status" : "Error in database connection"});
            return;
        } else {
            var email      = request.body.email,
                first_name = request.body.first_name,
                last_name  = request.body.last_name,
                password   = md5(request.body.password);

            var query = "insert into user (email,first_name,last_name,password) values (?,?,?,?)";

            connection.query(query, [email,first_name,last_name,password], function(error, results) {
                connection.release();
                if (!error) {
                    response.json({"code" : 200, "status" : "Success"})
                    return;
                } else {
                    response.json({"code" : 500, "status" : "Error in database query"});
                    return;
                }
            });
        }
    });
}

// module.exports.update = function(request, response, connectionPool, md5) {
//     connectionPool.getConnection(function(error, connection) {
//         if (error && connection !== null && connection !== undefined) {
//             connection.release();
//             response.json({"code" : 500, "status" : "Error in database connection"});
//             return;
//         } else if (error) {
//             response.json({"code" : 500, "status" : "Error in database connection"});
//             return;
//         } else {

//             var email      = request.body.email,
//                 first_name = request.body.first_name,
//                 last_name  = request.body.last_name,
//                 is_active  = request.body.is_active;

//             var query = "update user set first_name = ?, last_name = ?, is_active = ? where email = ?";

//             connection.query(query, [first_name,last_name,is_active,email], function(error, results) {
//                 connection.release();
//                 if (!error) {
//                     response.json({"code" : 200, "status" : "Success"})
//                     return;
//                 } else {
//                     response.json({"code" : 500, "status" : "Error in database query"});
//                     return;
//                 }
//             });
//         }
//     });
// }

// module.exports.delete = function(request, response, connectionPool) {
//     connectionPool.getConnection(function(error, connection) {
//         if (error && connection !== null && connection !== undefined) {
//             connection.release();
//             response.json({"code" : 500, "status" : "Error in database connection"});
//             return;
//         } else if (error) {
//             response.json({"code" : 500, "status" : "Error in database connection"});
//             return;
//         } else {
//             var email = request.body.email;

//             var query = "delete from user where email = ?";

//             connection.query(query, [email], function(error, results) {
//                 connection.release();
//                 if (!error) {
//                     response.json({"code" : 200, "status" : "Success"})
//                     return;
//                 } else {
//                     response.json({"code" : 500, "status" : "Error in database query"});
//                     return;
//                 }
//             });
//         }
//     });
// }