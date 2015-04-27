var miscutils 			= require('./../miscutils');
var _ 					= require('lodash');



/*
	Return the substring of string that matches the entity type  
	in array form, since there can be multiple substrings that match the incoming entity_type
	@entity_type is an entity type from the list of entities 
	@string is the string of what ever is in the box/part
	@return is a promise, a promise that will return an object i e.g. {operator:'is', result:___}
*/
function isOp(entity_type, string){

	var Q           = require('Q');
    var deferred    = Q.defer();

	miscutils.NER(string).then(function(found_entities){						// Apply AlchemyAPI NER onto the string
		
		if( found_entities.length <= 0 ){												// found_entities can be an empty array, which in this case, we return an empty string
			deferred.resolve( {'operator':'is', 'result':[]} );								
		}else{
			var entities_str_arr = _.filter( found_entities, function( entity_obj ){	// Given the result, a list of NER within the string, find the ones that match @entity_type.
				return  _.isEqual( entity_obj.type, entity_type );						// entity_type: {type:"Person", text:"Maeda Hanafi", relevance, count}
			});
			var filtered = _.pluck(entities_str_arr, 'text');							// e.g. ["Maeda", "Ravi"]
			deferred.resolve( {'operator':'is', 'result':filtered} );
		}
		
	});

	return deferred.promise;
}
exports.isOp = isOp;



