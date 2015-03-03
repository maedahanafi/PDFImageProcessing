//Image utilities from imagemagick
var im = require('imagemagick');


//Trim the image evenly first
exports.trim = function trim(inputfile, outputfile){
    im.convert(
        [inputfile,
            '-trim',
            outputfile
        ],
        function (err, stdout) {
            if (err) {
                console.log(err);
            } else {
                console.log('stdout:', stdout);

                //multicrop('test1.png', 'test2.png')

            }
        }
    );
}

//Then crop them into individual pieces based on content
exports.multicrop = function multicrop(inputfile, outputfile){
    im.convert(
        [
            'multicrop',
            inputfile,
            outputfile
        ],
        function (err, stdout) {
            if (err) {
                console.log(err);
            } else {
                console.log('stdout:', stdout);


            }
        }
    );
}


//no changes. however with flatten it will become black and white. however the quality downgrades
//img2blackandwhite('test.png', 'test1.png');
exports.img2blackandwhite = function img2blackandwhite(inputfile, outputfile){
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
            } else {
                console.log('stdout:', stdout);


            }
        }
    );
}


// too blurry
exports.transparency2white = function transparency2white(inputfile, outputfile) {
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
         }else {
            console.log('stdout:', stdout);
         }
     }
     );
}


exports.textfill = function textfill(inputfile, outputfile) {
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
        }
    );
}

exports.morphology = function morphology(inputfile, outputfile){
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
        }
    );
}

