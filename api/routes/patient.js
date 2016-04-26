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
            var query = "select * from patient";

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

module.exports.searchByName = function(request, response, connectionPool) {
    connectionPool.getConnection(function(error, connection) {
        if (error && connection !== null && connection !== undefined) {
            connection.release();
            response.json({"code" : 500, "status" : "Error in database connection"});
            return;
        } else if (error) {
            response.json({"code" : 500, "status" : "Error in database connection"});
            return;
        } else {
            var name = request.params.name;

            var query = "select * from patient where name = ?";

            connection.query(query, [name], function(error,rows){
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

module.exports.searchByDoctorId = function(request, response, connectionPool) {
    connectionPool.getConnection(function(error, connection) {
        if (error && connection !== null && connection !== undefined) {
            connection.release();
            response.json({"code" : 500, "status" : "Error in database connection"});
            return;
        } else if (error) {
            response.json({"code" : 500, "status" : "Error in database connection"});
            return;
        } else {
            var doctor_id = request.params.doctor_id;

            var query = "select * from patient p join mrs_file m on p.name = m.patient_name where p.doctor_id = ? and m.date = (select max(date) from mrs_file where patient_name = p.name)";

            connection.query(query, [doctor_id], function(error,rows){
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

module.exports.create = function(request, response, connectionPool) {
    connectionPool.getConnection(function(error, connection) {
        if (error && connection !== null && connection !== undefined) {
            connection.release();
            response.json({"code" : 500, "status" : "Error in database connection"});
            return;
        } else if (error) {
            response.json({"code" : 500, "status" : "Error in database connection"});
            return;
        } else {
            var name      = request.body.name,
                doctor_id = request.body.doctor_id;

            var query = "insert into patient (name,doctor_id) values (?,?)";

            connection.query(query, [name,doctor_id], function(error, results) {
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