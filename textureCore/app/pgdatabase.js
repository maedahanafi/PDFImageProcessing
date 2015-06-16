//Maeda Hanafi
//db file

var database = function(inconnectionString){
    var connectionString = inconnectionString;
    var pg = require('pg');
    var client;

    var getConnectionString = function(){
        return connectionString;
    };

    var setConnectionString = function(newConn){
        connectionString = newConn;
    };

    var databaseConnect = function(){
        //DAtabase connection*
        client = new pg.Client(connectionString);
        //client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished

        client.connect();
    };

    var query = function( queryString, callback){
        var query = client.query(queryString, callback);
        console.log("querying:"+queryString);

        return query;
    };
    //A safer query because the inputs don't affect the SQL statement
    var queryParam = function( queryString, param,callback){
        var query = client.query(queryString, param,callback);
        console.log("param querying:"+queryString+" " );

        return query;
    };
    var closeConnection = function(){
        client.end();
    };


    return  {
        getConnectionString: getConnectionString,
        setConnectionString: setConnectionString,
        databaseConnect:databaseConnect,
        closeConnection:closeConnection,
        queryParam:queryParam



    }
};
//allow others to access this file
exports.database = database;


