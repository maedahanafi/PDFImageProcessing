/*
    Document model in database
    Holds files from the database
 */

module.exports = function(dbconn){
    //Init the file

    function getDocument(filename, callback) {
        dbconn.queryParam("SELECT \"file\" from \"Documents\" where \"filename\" = $1;", [filename], callback);
    }
    function getDocuments(callback){
        dbconn.queryParam("SELECT \"filename\" from \"Documents\";", [], callback);
    }
    function insertDocument(filename, file, callback){
        dbconn.queryParam("INSERT INTO \"Documents\" (\"filename\", \"file\") VALUES ($1, $2);", [filename, file], callback);
    }
    return {
        //Functions
        getDocuments:getDocuments,
        getDocument:getDocument,
        //deleteDocuments:deleteDocuments,
        insertDocument:insertDocument
    }
}