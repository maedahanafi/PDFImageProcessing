/*
	Entity learner
*/
var miscutils 		= require('./../miscutils');
var _ 				= require('lodash');
var executor 		= require('./../execute/execute');

/*
	@highlights takes in a list of highlighted text and learns NER associations that are applicable to @highlights

	This learn function takes in a list of highlights that the Is operator must be able to extract e.g. [“Maeda”, “Aisya”]. 
	The output is an array of applicable entity types e.g. [“Person”], where an entity type is applicable when it identifies each of the elements in the list of highlights.
*/
function learnIsEntity(highlights){
	var Q 			= require('Q');
 	var deferred	= Q.defer();

 	getNER(highlights).then(function(entities){							// entities is a 2D array: [[{Person, ...}, ], [{Person}, ...], ...]
 		// Check if all the highlights match all the entities
 		// Given entities [{entity, word}, {entity, word}, ....]
 		// Given highlights [{highlight}, {highlight}, ....]
 		// Check if each highlight exists in entities

 		var flatten_entities = _.flatten(entities);						// flatten_entities is an array: [{Person, ...}, {Person, ...}, ...]
 		var grouped_entities = _.groupBy(flatten_entities, function(entity) {  		// Group the flattened array by the entity
			return entity.type;
		}); 															// grouped_entities = {Person:[], Building:[], ...}
		
		var applicable_entities = [];									// Entities that are applicable on the given highlights
		for(var key in grouped_entities){								// Loop through each group and for each entity group, check if each highlight exists
			var entity_group 		= grouped_entities[key];			// Check if each highlight exists within entity_group
			var text_highlight 		= _.pluck(highlights,   'text');	// An array of only the highlight's text that belong to this entity e.g. ['Ravi Amon', 'Chris Sample']
			var text_entity_group 	= _.pluck(entity_group, 'text');	// An array of only the NER texts that that belong to this entity e.g. ['Ravi Amon', 'Chris']
			
			miscutils.logMessage("Check if Entities extracted equals highlights: ", 2);
			miscutils.logMessage(text_entity_group, 								2);
			miscutils.logMessage(text_highlight, 									2);
			
			if (_.isEqual(text_highlight, text_entity_group)){			// If the highlight array is equal to the entity's text array, then 
				applicable_entities.push(key);
			}
		}
		miscutils.logMessage("Applicable Entities: ", 	1);
		miscutils.logMessage(applicable_entities, 		1);
		deferred.resolve(applicable_entities);

 	});
	return deferred.promise; 	
 }
exports.learnIsEntity = learnIsEntity;

/*
	@highlights from image2data.js e.g. array of groups; a group is an array of lines
	
*/
function getNER(highlights){
	var Q 			 = require('Q');
 	var deferred   	 = Q.defer();
	var NER_promises = [];

 	// NER lookup
    for(var i=0; i<highlights.length; i++){  							
    	var highlight = highlights[i].text;						// Loop through each highlight
    	NER_promises.push(miscutils.NER(highlight));
    }

    // After all the NER is done on all lines, read the result and add to our result data
    var allPromise = Q.all(NER_promises );
    allPromise.then(function(allentities){

	    miscutils.logMessage("All done grabbing data from AlchemyAPI",  1);
	    miscutils.logMessage(JSON.stringify(allentities), 				2);
		deferred.resolve(allentities);

    }, console.err);
 	return deferred.promise;
}