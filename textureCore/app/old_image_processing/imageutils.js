//Image utilities from imagemagick
var im = require('imagemagick');
//transparency2white('img/vegemite.pdf-0.png', 'img/vegemiteBW.png')

exports.pdf2image = function(input, output){
    var Q           = require('Q');
    var deferred    = Q.defer();

    im.convert(/*['-verbose',
                '-density',
                '150',
                '-trim',
                path_to_pdf_dir+filename,
                '-quality',
                '100',
                '-sharpen',
                '0x1.0',
                path_to_pdf_img_dir+filename+'.'+img_ext]*/
            ['-verbose',        //Solving the issue of dark images converted     http://stackoverflow.com/questions/10934456/imagemagick-pdf-to-jpgs-sometimes-results-in-black-background
                '-density',
                '150',
                '-colorspace',
                'sRGB',
                input, 
                '-resize',
                '50%',
                '-quality',
                '95',
                output],
        function(err, stdout){
            if (err){
                console.log(err);
                //callback(err);
                deferred.reject(err)
                
            }else {
                console.log('stdout:', stdout);

                deferred.resolve(stdout)
                //callback(stdout);
            }
        }
    );
    return deferred.promise;
}

//Trim the image evenly first
exports.trim = function trim(inputfile, outputfile, callback){
    im.convert(
        [inputfile,
            '-trim',
            outputfile
        ],
        function (err, stdout) {
            if (err) {
                console.log(err);
                callback();
            } else {
                console.log('stdout:', stdout);

                //multicrop('test1.png', 'test2.png')
                callback();

            }
        }
    );
}

//Then crop them into individual pieces based on content
exports.multicrop = function multicrop(inputfile, outputfile, callback){
    im.convert(
        [
            'multicrop',
            inputfile,
            outputfile
        ],
        function (err, stdout) {
            if (err) {
                console.log(err);
                callback();

            } else {
                console.log('stdout:', stdout);
                callback();


            }
        }
    );
}


//no changes. however with flatten it will become black and white. however the quality downgrades
//img2blackandwhite('test.png', 'test1.png');
exports.img2blackandwhite = function img2blackandwhite(inputfile, outputfile, callback){
    /*
     convert <input> -threshold xx% <output>
     */
    im.convert(
        [inputfile,
            '-threshold',
            '50%',
            outputfile
        ],
        function (err, stdout) {
            if (err) {
                console.log(err);
                callback();

            } else {
                console.log('stdout:', stdout);
                callback();


            }
        }
    );
}


// too blurry
function transparency2white(inputfile, outputfile) {
    var Q           = require('Q');
    var deferred    = Q.defer();

    //First convert the image's transparency into white color
    //convert -flatten img1.png img1-white.png

    im.convert(
         [  '-flatten',
            inputfile,
            outputfile
     ],
     function(err, stdout){
         if (err){
            console.log(err);
            deferred.reject(err)
         }else {
            //console.log('stdout:', stdout);
            deferred.resolve(stdout)
         }
         //callback();

     }
     );
    return deferred.promise;
}
exports.transparency2white =transparency2white;

exports.textfill = function textfill(inputfile, outputfile, callback) {
    //http://www.imagemagick.org/discourse-server/viewtopic.php?t=22625
    /*
     "%IMG%convert" wollte.jpg ^
     -fuzz 50%% ^
     -fill Black ^
     -floodfill 0x0 White ^
     w1.png
     */
    im.convert(
        ['test.png',
            '-fuzz',
            '50%',
            '-fill',
            'Black',
            '-floodfill',
            '0x0',
            'White',
            'test1.png'
        ],
        function (err, stdout) {
            if (err) {
                console.log(err);
            } else {
                console.log('stdout:', stdout);

                //morphology('test1.png', 'test2.png');


            }

            callback();

        }
    );
}

exports.morphology = function morphology(inputfile, outputfile, callback){
/*
 "%IMG%convert" w1.png ^
 -morphology Hit-and-Miss "1x8:1,0,1,1,0,0,0,0" ^
 w2.png
 */
    im.convert(
        [inputfile,
            '-morphology',
            'Hit-and-Miss',
            '1x8:1,0,1,1,0,0,0,0',
            outputfile
        ],
        function (err, stdout) {
            if (err) {
                console.log(err);
            } else {
                console.log('stdout:', stdout);


            }
            callback();

        }
    );
}

