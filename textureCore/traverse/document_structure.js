/*
	Document structure object
*/
modules.export = function Document_Structure(document_structure) {
    /* 	Instantiage incoming document structure
    	Group object
     	Line objects
	*/
	// Instantiate

	
    /*
    	@box_match is an array of executables
    */
    var instantiate = function(box_match){
        var curr_box    = "";
	    for (var i=0; i<document_structure.length; i++){
	        var page_content    = document_structure[i].page_content; 
	        curr_box            = 'Page';                           // Set current box to Page

	        custom_function(curr_box, page_content);

	        for(var j=0; j<page_content.length; j++){ 
	            var group   = page_content[j].group;  
	            curr_box    = 'Section';                            // Set current box to Section

	            custom_function(curr_box, group);

	            for (var k=0; k<group.length; k++){ 
	                var line_obj = group[k];
	                curr_box = line_obj.type//'Line';                               // Set current box to Line

	                custom_function(curr_box, line_obj);
	            }
	        }
	    }
    }

	return{
    	instantiate:instantiate,
    	

    }

    
} 

var Node = function(in_node_type){
	var node_type = in_node_type;

	function get_curr_content(){

	}
	function next(){

	}
	function prev(){

	}
	function 
	return{
    	node_type:node_type,
    	get_curr_content: get_curr_content,
    	next:next,
    	prev:prev,
    	is_clause_match:is_clause_match,
    	get_node_string:get_node_string,
    	get_all_children:get_all_children,
    	add_child:add_child	// to the nth place
    }
}