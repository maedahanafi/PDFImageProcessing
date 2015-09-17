/**
 * Created by Maeda on 2/15/2015.
 */

//Return a boolean as to whether an @item exists in @array
function isExists(array, item){
    return _.indexOf(array, item) == -1;
}

var debugLevel = 0;
function printDebug(string, inDebugLevel){
	if(inDebugLevel<=debugLevel){
		console.log(string);
	}
}

