/**
 * Created by Maeda on 2/9/2015.
 *
 * Provide routes to for the pdf documents.
 */


var pdf = require('./pdf');

module.exports = function(app, database){
    //api for document uploads -----------------------------
    var pdfModel = require('./models/pdf')(database);


    //Get a specific PDF
    app.get('/convertpdf/:pdfFile', function(req, res){
        var filename = req.params.pdfFile;
        console.log("Request for conversion on "+filename);

        pdf.pdf2html(filename, function (resultfilepath) {
            //After conversion send the newly converted filepath to the client
            //res.send({'resultfilepath':resultfilepath});
            //Send back an image
            console.log(resultfilepath)

            //Send back the paths to the new image files
            res.send({'resultfilepath':resultfilepath});
        });

     });
}



