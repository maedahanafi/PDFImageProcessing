var regex = [];

/********************************************************************************
	Regex Generator Classes
********************************************************************************/
var RegexGenerator = function(){
	var _ = require('lodash');
 
	//Format of character classes: C+ or [^C]+ or special token
	//Character classes: Numeric digits, alphabet both lower and upper, lower case, upper case, accented alphabet, alphanumeric, whitespace character, all character 
	var incCharCharacter = ["[0-9]+", "[a-zA-Z]+", "[a-z]+", "[A-Z]+", "[\\u00C0-\\u00FF]+", "[0-9a-zA-Z]+", "[\\s]+" ]
	var notCharCharacter = ["[^0-9]+", "[^a-zA-Z]+", "[^a-z]+", "[^A-Z]+", "[^\\u00C0-\\u00FF]+", "[^0-9a-zA-Z]+", "[^\\s]+" ]
	//Special character classes
	var specialChar = ["^", "$", "-", "\\.", ";", ":", ",", "\\\\", "\\/", "{", "}", "\\(", "\\)", "\\]", "\\[" ];
	//Combine all arrays holding characters:
	var allTokens ; 

	var init = function(){
		if(regex.length==0) {
			allTokens = incCharCharacter.concat(specialChar);
			allTokens = allTokens.concat(notCharCharacter);
			var permutate = (function () {
				var results = [];

				function doPermute(input, output, used, size, level) {
					if (size == level) {
						var word = output.slice();
						results.push(word)

						return;
					}
					level++;
					for (var i = 0; i < input.length; i++) {
						if (used[i] === true) {
							continue;
						}
						used[i] = true;
						output.push(input[i]);
						doPermute(input, output, used, size, level);
						used[i] = false;
						output.pop();
					}
				}

				return {
					getPermutations: function (input, size) {
						var output = [];
						var used = new Array(input.length);
						doPermute(input, output, used, size, 0);
						return results;
					}
				}

			})();

			//Produce all combos of length 1 to 3 containing character classes
			var permutations1 = permutate.getPermutations(allTokens, 1);
			var permutations2 = permutate.getPermutations(allTokens, 2);
			var permutations3 = permutate.getPermutations(allTokens, 3);

			//formRegexPatt(permutations1)
			//formRegexPatt(permutations2)
			//formRegexPatt(permutations3)
			regex = regex.concat(permutations1)
			regex = regex.concat(permutations2)
			regex = regex.concat(permutations3)

			//Shave the duplicates off
			regex = _.uniq(regex);

		}
		return regex;
	};
	//Adds patterns regex to regex[]
	function formRegexPatt(combo){
		combo.forEach(function(elem) {
			try{ 	elem.getRegex(); //This statement tests out the validity of the regex
					regex.push(elem)
			}catch(e){console.log("ARGH the combo doesnt work!!!"+elem) }
		});
	}
	
	var getAllTokens = function(){
		return allTokens
	}
	var getAllTokensAt = function(i){
		return allTokens[i]
	}
	var getAllTokensCount = function(){
		return allTokens.length
	}
	return{
		init:init,
		getAllTokens:getAllTokens,
		getAllTokensCount:getAllTokensCount,
		getAllTokensAt:getAllTokensAt
	}
};
exports.RegexGenerator = RegexGenerator


 