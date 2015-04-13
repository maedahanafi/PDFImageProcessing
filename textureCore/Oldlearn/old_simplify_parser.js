var code = "'Email' := /[\\w+]@[\\w\\.]+/ \n From Line #3\nWithin Section\nAfter Heading #1";
var miscutils = require('./miscutils')
//Read in a sample json of a document structure:
miscutils.fs_readFile ('image_processing/document_structure/patricia0.json').then(function(contents){
	var doc_struct = JSON.parse( contents);

	execute(code, doc_struct);
});

function execute(code, doc_struct){
	var code_lines = code.split('\n');

	//Get the Regex in te first line
	var regex_str= code_lines[0].match(/\/(.+)\//)[1];
	console.log('regex:'+regex_str);
	var regex = new RegExp(regex_str);

	//Execute the last line first: After Heading number 1, indicates anything after the first heading
	//Execute the linebfore that and then the one before that.
	var line_type1 = 'Heading', n1 = 1, executeOne = true;
	var section_limit = 0 ,executeTwo = false;		//section_limit is not known yet until reach the section of ter executeOne
	var n3 = 3, executeThree = false; //executeThree is set true when execute is set true, because it is within operator
	var result = "";
	var line_number = 0;	//Keep track which line we are at.
	doc_struct.forEach(function(page){	
		console.log('page')
		for(var section_number=0; section_number<page.page_content.length; section_number++){
			var section = page.page_content[section_number].group;
					console.log('section')

			section.forEach(function(line){
				console.log('line')
				if(executeThree && n3==(line_number+1)){	//If the from caluse matches, then we are all set
					console.log('executeThree:'+n3)
					console.log(line)

					//Apply regex
					result = line.text.match(regex);
					console.log(result)

					executeThree = false;
					executeTwo = false;
					executeOne = false;
				}

				if(executeTwo && section_limit>0){	//The current section is what we need. So get the lines from line_number to the end.
					section_limit--;
				}else if(executeTwo && section_limit<=0){	//Out of the section; reset
					executeTwo = false;
					executeThree = false;
				}

				if(n1 == (line_number+1) && line_type1 == 'Heading' && executeOne){	//Begin executeTwo after the first heading is detected
					executeOne = false;
					executeTwo = true;	
					executeThree = true;
					section_limit = section.length - (line_number+1);
					console.log('executeOne:'+section_limit)
				}
				line_number++;



			})
		}
	})

	
}


function after(docstructure, location_type, n, next){
	//Navigate to location_type at n and begin after that the next operation
	var lines = []
}