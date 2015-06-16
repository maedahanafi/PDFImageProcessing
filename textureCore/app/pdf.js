/**
 * Created by mh4047 on 2/22/15.
 * The pdf module that deals with pdf file processing e.g. pdf to image or pdf to meta or pdf to ocr
 */

var path_to_pdf_dir = 'public/pdf/';
var path_to_pdf_img_dir = 'public/pdf/img/';
var client_path_img_dir = 'pdf/img/'
var img_ext = 'png';
//var im = require('imagemagick');
var fs = require('fs');
var imagemagick     = require('../image_processing/imageutils.js');
var image2meta_module = require('../image_processing/image2data.js');

//Feb 26, Problem: imagemagick doesn't render the text on certian pdfs.

//pdftohtml module used to convert pdf into html
//@filename is the pdf file to convert e.g. maeda.pdf
//@callback's parameters passed intp the callback function is the resulting path files of the images e.g. ['image1.jpg',...]
exports.pdf2html = function (filename, callback){
    /* preferred options for best quality see http://stackoverflow.com/questions/6605006/convert-pdf-to-image-with-high-resolution
     */
    // callback([client_path_img_dir+'obama.pdf.png'])  // This line for screenshot purposes; Will show obama's
    imagemagick.pdf2image(path_to_pdf_dir+filename, path_to_pdf_img_dir+filename+'.'+img_ext).then( function(stdout){

        //Get all filenames from the pdf's image results:
        var allFiles = getAllFileNamesFromDir(path_to_pdf_img_dir);

        //Filter out for the file names that have the same prefix names followed by a dash and number
        //or sometimes it is just followed by  the extension (in the case of .png)
        //and add them to pdfImgFiles[]
        var pdfImgFiles = [];
        var arr_promises        = []; 

        allFiles.forEach(function(elem){
            var regex = new RegExp("\\b("+filename+")\\b-\\d+\\."+img_ext);
            var regex2 = new RegExp("\\b("+filename+")\\b\\."+img_ext);

            //Check for a match
            if(regex.test(elem) || regex2.test(elem)){
               pdfImgFiles.push(client_path_img_dir +elem);
               arr_promises.push( imagemagick.transparency2white(path_to_pdf_img_dir+elem, path_to_pdf_img_dir+elem)  );

            }
        });


        //Convert transparency to white
        var Q                   = require('Q');
        
        Q.all(arr_promises)
        //.then(image2meta(pdfImgFiles))
        .then(callback(pdfImgFiles));
    });
   
}

//The conversion from pdf's image into meta-data
//@filename of the image to process into meta-data via image processing
exports.image2meta = function(pdfImgFiles){
    var Q           = require('Q');
    var deferred    = Q.defer();
    //Begin processing image

    //Identify areas of text and replace each letter with a black box.
    //Generally, bigger areas of text refer to a "Title" and lots of clumped up areas of text refer to a "title"
    //image2meta_module.imagedocuments2structure(['img/patricia0.png'], true).then(function(){
        deferred.resolve(pdfImgFiles);
    //});

    return deferred.promise;
}

function getAllFileNamesFromDir(dir){

    var files = fs.readdirSync(dir);
    //console.log(files)
    return files;

}

//OCR on the pdfs