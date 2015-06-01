'''

'''
from parser import *

dictionary_name = "university_name"

# IMPORTANT: All regular expressions that contain spaces must be replaced with \s before running by test()
# match := regular_expression
check(test("[A-Z]+[a-z]+"), 			[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}])
check(test("[A-EA]"), 					[{"attribute":"match", "attribute_index":-1, "expected":"[A-EA]"}])
check(test("[A-D]*"), 					[{"attribute":"match", "attribute_index":-1, "expected":"[A-D]*"}])
check(test("[A-D]{3}"), 				[{"attribute":"match", "attribute_index":-1, "expected":"[A-D]{3}"}])
check(test("X[A-C]{3}Y"), 				[{"attribute":"match", "attribute_index":-1, "expected":"X[A-C]{3}Y"}])
check(test("X[A-C]{3}\("), 				[{"attribute":"match", "attribute_index":-1, "expected":"X[A-C]{3}\("}])
check(test("X\d"), 						[{"attribute":"match", "attribute_index":-1, "expected":"X\d"}])
check(test("foobar\d\d"), 				[{"attribute":"match", "attribute_index":-1, "expected":"foobar\d\d"}])
check(test("foobar{2}"), 				[{"attribute":"match", "attribute_index":-1, "expected":"foobar{2}"}])
check(test("foobar{2,9}"), 				[{"attribute":"match", "attribute_index":-1, "expected":"foobar{2,9}"}])
check(test("fooba[rz]{2}"), 			[{"attribute":"match", "attribute_index":-1, "expected":"fooba[rz]{2}"}])
check(test("(foobar){2}"), 				[{"attribute":"match", "attribute_index":-1, "expected":"(foobar){2}"}])
check(test("([01]\d)|(2[0-5])"), 		[{"attribute":"match", "attribute_index":-1, "expected":"([01]\d)|(2[0-5])"}])
check(test("([01]\d\d)|(2[0-4]\d)|(25[0-5])"), [{"attribute":"match", "attribute_index":-1, "expected":"([01]\d\d)|(2[0-4]\d)|(25[0-5])"}])
check(test("[A-C]{1,2}"), 				[{"attribute":"match", "attribute_index":-1, "expected":"[A-C]{1,2}"}])
check(test("[A-C]{0,3}"), 				[{"attribute":"match", "attribute_index":-1, "expected":"[A-C]{0,3}"}])
check(test("[A-C]\s[A-C]\s[A-C]"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-C]\s[A-C]\s[A-C]"}])
check(test("[A-C]\s?[A-C][A-C]"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-C]\s?[A-C][A-C]"}])
check(test("[A-C]\s([A-C][A-C])"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-C]\s([A-C][A-C])"}])
check(test("[A-C]\s([A-C][A-C])?"), 	[{"attribute":"match", "attribute_index":-1, "expected":"[A-C]\s([A-C][A-C])?"}])
check(test("[A-C]{2}\d{2}"), 			[{"attribute":"match", "attribute_index":-1, "expected":"[A-C]{2}\d{2}"}])
check(test("@|TH[12]"), 				[{"attribute":"match", "attribute_index":-1, "expected":"@|TH[12]"}])
check(test("@(@|TH[12])?"), 			[{"attribute":"match", "attribute_index":-1, "expected":"@(@|TH[12])?"}])
check(test("@(@|TH[12]|AL[12]|SP[123]|TB(1[0-9]?|20?|[3-9]))?"), [{"attribute":"match", "attribute_index":-1, "expected":"@(@|TH[12]|AL[12]|SP[123]|TB(1[0-9]?|20?|[3-9]))?"}])
check(test("@(@|TH[12]|AL[12]|SP[123]|TB(1[0-9]?|20?|[3-9])|OH(1[0-9]?|2[0-9]?|30?|[4-9]))?"), [{"attribute":"match", "attribute_index":-1, "expected":"@(@|TH[12]|AL[12]|SP[123]|TB(1[0-9]?|20?|[3-9])|OH(1[0-9]?|2[0-9]?|30?|[4-9]))?"}])
check(test("(([ECMP]|HA|AK)[SD]|HS)T"), [{"attribute":"match", "attribute_index":-1, "expected":"(([ECMP]|HA|AK)[SD]|HS)T"}])
check(test("[A-CV]{2}"), 				[{"attribute":"match", "attribute_index":-1, "expected":"[A-CV]{2}"}])
check(test("A[cglmrstu]|B[aehikr]?|C[adeflmorsu]?|D[bsy]|E[rsu]|F[emr]?|G[ade]|H[efgos]?|I[nr]?|Kr?|L[airu]|M[dgnot]|N[abdeiop]?|Os?|P[abdmortu]?|R[abefghnu]|S[bcegimnr]?|T[abcehilm]|Uu[bhopqst]|U|V|W|Xe|Yb?|Z[nr]"), [{"attribute":"match", "attribute_index":-1, "expected":"A[cglmrstu]|B[aehikr]?|C[adeflmorsu]?|D[bsy]|E[rsu]|F[emr]?|G[ade]|H[efgos]?|I[nr]?|Kr?|L[airu]|M[dgnot]|N[abdeiop]?|Os?|P[abdmortu]?|R[abefghnu]|S[bcegimnr]?|T[abcehilm]|Uu[bhopqst]|U|V|W|Xe|Yb?|Z[nr]"}])
check(test("(a|b)|(x|y)"), 				[{"attribute":"match", "attribute_index":-1, "expected":"(a|b)|(x|y)"}])
#check(test("(a|b) (x|y)"), 				[{"attribute":"match", "attribute_index":-1, "expected":"(a|b) (x|y)"}])

# match := is
check(test("is(Person)"), 				[{"attribute":"isEntity", "attribute_index":0, "expected":"is"}, {"attribute":"isEntity", "attribute_index":2, "expected":"Person"}])

# match := in
check(test("in("+dictionary_name+")"), 	[{"attribute":"inDict", "attribute_index":0, "expected":"in"}, {"attribute":"inDict", "attribute_index":2, "expected":dictionary_name}])
# match := permute(rule*)
# match := rule*

#----------------------------------------------------------------
# match := regular_expression  		box := part
check(test("[A-Z]+[a-z]+ from page"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"page"}])
check(test("[A-Z]+[a-z]+ from section"),	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"section"}])
check(test("[A-Z]+[a-z]+ from group"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"group"}])
check(test("[A-Z]+[a-z]+ from paragraph"), 	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"paragraph"}])
check(test("[A-Z]+[a-z]+ from lines"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"lines"}])
check(test("[A-Z]+[a-z]+ from heading"), 	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"heading"}])
check(test("[A-Z]+[a-z]+ from title"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"title"}])
check(test("[A-Z]+[a-z]+ from line"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"line"}])


# match := regular_expression  		box := part [operator regex]
# NOTE: execute as order: regex, operator, part, if no match repeat. Then execute regular_expression.
check(test("[A-Z]+[a-z]+ from page after [A-Z]+"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"page"},{"attribute":"box_expression", "attribute_index":0, "expected":"after"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from page before [A-Z]+"), 	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"page"},{"attribute":"box_expression", "attribute_index":0, "expected":"before"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
# Interesting case, operator = within: The following rule will work if the string matching regex = [A-Z]+ contains a page or section ,etc
check(test("[A-Z]+[a-z]+ from page within [A-Z]+"), 	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"page"},{"attribute":"box_expression", "attribute_index":0, "expected":"within"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from page contains [A-Z]+"), 	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"page"},{"attribute":"box_expression", "attribute_index":0, "expected":"contains"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from section after [A-Z]+"), 	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"section"},{"attribute":"box_expression", "attribute_index":0, "expected":"after"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from section before [A-Z]+"), 	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"section"},{"attribute":"box_expression", "attribute_index":0, "expected":"before"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from section within [A-Z]+"), 	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"section"},{"attribute":"box_expression", "attribute_index":0, "expected":"within"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from section contains [A-Z]+"),[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"section"},{"attribute":"box_expression", "attribute_index":0, "expected":"contains"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from group after [A-Z]+"), 	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"group"},{"attribute":"box_expression", "attribute_index":0, "expected":"after"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from group before [A-Z]+"), 	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"group"},{"attribute":"box_expression", "attribute_index":0, "expected":"before"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from group within [A-Z]+"), 	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"group"},{"attribute":"box_expression", "attribute_index":0, "expected":"within"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from group contains [A-Z]+"),	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"group"},{"attribute":"box_expression", "attribute_index":0, "expected":"contains"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from paragraph after [A-Z]+"), 	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"paragraph"},{"attribute":"box_expression", "attribute_index":0, "expected":"after"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from paragraph before [A-Z]+"), 	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"paragraph"},{"attribute":"box_expression", "attribute_index":0, "expected":"before"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from paragraph within [A-Z]+"), 	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"paragraph"},{"attribute":"box_expression", "attribute_index":0, "expected":"within"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from paragraph contains [A-Z]+"),	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"paragraph"},{"attribute":"box_expression", "attribute_index":0, "expected":"contains"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from lines after [A-Z]+"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"lines"},{"attribute":"box_expression", "attribute_index":0, "expected":"after"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from lines before [A-Z]+"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"lines"},{"attribute":"box_expression", "attribute_index":0, "expected":"before"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from lines within [A-Z]+"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"lines"},{"attribute":"box_expression", "attribute_index":0, "expected":"within"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from lines contains [A-Z]+"),		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"lines"},{"attribute":"box_expression", "attribute_index":0, "expected":"contains"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from heading after [A-Z]+"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"heading"},{"attribute":"box_expression", "attribute_index":0, "expected":"after"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from heading before [A-Z]+"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"heading"},{"attribute":"box_expression", "attribute_index":0, "expected":"before"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from heading within [A-Z]+"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"heading"},{"attribute":"box_expression", "attribute_index":0, "expected":"within"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from heading contains [A-Z]+"),	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"heading"},{"attribute":"box_expression", "attribute_index":0, "expected":"contains"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from title after [A-Z]+"), 	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"title"},{"attribute":"box_expression", "attribute_index":0, "expected":"after"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from title before [A-Z]+"), 	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"title"},{"attribute":"box_expression", "attribute_index":0, "expected":"before"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from title within [A-Z]+"), 	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"title"},{"attribute":"box_expression", "attribute_index":0, "expected":"within"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from title contains [A-Z]+"),	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"title"},{"attribute":"box_expression", "attribute_index":0, "expected":"contains"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from line after [A-Z]+"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"line"},{"attribute":"box_expression", "attribute_index":0, "expected":"after"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from line before [A-Z]+"), 	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"line"},{"attribute":"box_expression", "attribute_index":0, "expected":"before"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from line within [A-Z]+"), 	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"line"},{"attribute":"box_expression", "attribute_index":0, "expected":"within"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from line contains [A-Z]+"),	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"line"},{"attribute":"box_expression", "attribute_index":0, "expected":"contains"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])


# match := regular_expression  		box := part [operator box*]
# IMPORTANT: If operator = within, then box must not be smaller than part e.g. invalid: from page within line
# match := regular_expression  		box := part between*

#----------------------------------------------------------------
# match := regular_expression 		box := part [# n]
check(test("[A-Z]+[a-z]+ from page #1"),		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"page"}, {"attribute":"n", "attribute_index":1, "expected":'1'}])
check(test("[A-Z]+[a-z]+ from section #1"),		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"section"}, {"attribute":"n", "attribute_index":1, "expected":'1'}])
check(test("[A-Z]+[a-z]+ from group #1"),		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"group"}, {"attribute":"n", "attribute_index":1, "expected":'1'}])
check(test("[A-Z]+[a-z]+ from paragraph #1"),	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"paragraph"}, {"attribute":"n", "attribute_index":1, "expected":'1'}])
check(test("[A-Z]+[a-z]+ from lines #1"),		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"lines"}, {"attribute":"n", "attribute_index":1, "expected":'1'}])
check(test("[A-Z]+[a-z]+ from heading #1"),		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"heading"}, {"attribute":"n", "attribute_index":1, "expected":'1'}])
check(test("[A-Z]+[a-z]+ from title #1"),		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"title"}, {"attribute":"n", "attribute_index":1, "expected":'1'}])
check(test("[A-Z]+[a-z]+ from line #1"),		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"line"}, {"attribute":"n", "attribute_index":1, "expected":'1'}])


# match := regular_expression 		box := part n [operator regex]
#NOTE: Since n is specified, execute part n, then regex, then operator. Sometimes may not return anything.
check(test("[A-Z]+[a-z]+ from page #1 after [A-Z]+"), 			[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"page"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"after"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from page #1 before [A-Z]+"), 			[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"page"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"before"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
#NOTE: Check if page #1 exists within that regex first, before proceeding
check(test("[A-Z]+[a-z]+ from page #1 within [A-Z]+"), 			[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"page"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"within"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
#NOTE: Check if page #1 exists contains that regex first, before proceeding
check(test("[A-Z]+[a-z]+ from page #1 contains [A-Z]+"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"page"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"contains"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from section #1 after [A-Z]+"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"section"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"after"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from section #1 before [A-Z]+"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"section"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"before"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from section #1 within [A-Z]+"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"section"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"within"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from section #1 contains [A-Z]+"), 	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"section"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"contains"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from group #1 after [A-Z]+"), 			[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"group"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"after"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from group #1 before [A-Z]+"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"group"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"before"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from group #1 within [A-Z]+"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"group"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"within"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from group #1 contains [A-Z]+"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"group"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"contains"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from paragraph #1 after [A-Z]+"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"paragraph"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"after"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from paragraph #1 before [A-Z]+"), 	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"paragraph"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"before"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from paragraph #1 within [A-Z]+"), 	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"paragraph"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"within"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from paragraph #1 contains [A-Z]+"), 	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"paragraph"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"contains"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from lines #1 after [A-Z]+"), 			[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"lines"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"after"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from lines #1 before [A-Z]+"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"lines"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"before"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from lines #1 within [A-Z]+"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"lines"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"within"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from lines #1 contains [A-Z]+"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"lines"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"contains"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from heading #1 after [A-Z]+"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"heading"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"after"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from heading #1 before [A-Z]+"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"heading"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"before"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from heading #1 within [A-Z]+"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"heading"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"within"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from heading #1 contains [A-Z]+"), 	[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"heading"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"contains"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from title #1 after [A-Z]+"), 			[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"title"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"after"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from title #1 before [A-Z]+"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"title"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"before"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from title #1 within [A-Z]+"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"title"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"within"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from title #1 contains [A-Z]+"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"title"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"contains"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from line #1 after [A-Z]+"), 			[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"line"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"after"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from line #1 before [A-Z]+"), 			[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"line"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"before"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from line #1 within [A-Z]+"), 			[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"line"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"within"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])
check(test("[A-Z]+[a-z]+ from line #1 contains [A-Z]+"), 		[{"attribute":"match", "attribute_index":-1, "expected":"[A-Z]+[a-z]+"}, {"attribute":"part", "attribute_index":0, "expected":"line"}, {"attribute":"n", "attribute_index":1, "expected":'1'}, {"attribute":"box_expression", "attribute_index":0, "expected":"contains"}, {"attribute":"box_expression", "attribute_index":1, "expected":'[A-Z]+'}])


# match := regular_expression 		box := part n [operator box*]
# match := regular_expression 		box := part n between*
'''
#----------------------------------------------------------------
# match := regular_expression 		box := part n to m
test("[A-Z]+[a-z]+ from page 1 to 3")
test("[A-Z]+[a-z]+ from section 1 to 3")
test("[A-Z]+[a-z]+ from group 1 to 3")
test("[A-Z]+[a-z]+ from paragraph 1 to 3")
test("[A-Z]+[a-z]+ from lines 1 to 3")
test("[A-Z]+[a-z]+ from heading 1 to 3")
test("[A-Z]+[a-z]+ from title 1 to 3")
test("[A-Z]+[a-z]+ from line 1 to 3")
# match := regular_expression 		box := part n to m [operator regex]
test("[A-Z]+[a-z]+ from page 1 to 3 after regex")
test("[A-Z]+[a-z]+ from page 1 to 3 before regex ")
test("[A-Z]+[a-z]+ from page 1 to 3 within regex")
test("[A-Z]+[a-z]+ from page 1 to 3 contains regex")
test("[A-Z]+[a-z]+ from section 1 to 3 after regex")
test("[A-Z]+[a-z]+ from section 1 to 3 before regex ")
test("[A-Z]+[a-z]+ from section 1 to 3 within regex")
test("[A-Z]+[a-z]+ from section 1 to 3 contains regex")
test("[A-Z]+[a-z]+ from group 1 to 3 after regex")
test("[A-Z]+[a-z]+ from group 1 to 3 before regex ")
test("[A-Z]+[a-z]+ from group 1 to 3 within regex")
test("[A-Z]+[a-z]+ from group 1 to 3 contains regex")
test("[A-Z]+[a-z]+ from paragraph 1 to 3 after regex")
test("[A-Z]+[a-z]+ from paragraph 1 to 3 before regex ")
test("[A-Z]+[a-z]+ from paragraph 1 to 3 within regex")
test("[A-Z]+[a-z]+ from paragraph 1 to 3 contains regex")
test("[A-Z]+[a-z]+ from lines 1 to 3 after regex")
test("[A-Z]+[a-z]+ from lines 1 to 3 before regex ")
test("[A-Z]+[a-z]+ from lines 1 to 3 within regex")
test("[A-Z]+[a-z]+ from lines 1 to 3 contains regex")
test("[A-Z]+[a-z]+ from heading 1 to 3 after regex")
test("[A-Z]+[a-z]+ from heading 1 to 3 before regex ")
test("[A-Z]+[a-z]+ from heading 1 to 3 within regex")
test("[A-Z]+[a-z]+ from heading 1 to 3 contains regex")
test("[A-Z]+[a-z]+ from title 1 to 3 after regex")
test("[A-Z]+[a-z]+ from title 1 to 3 before regex ")
test("[A-Z]+[a-z]+ from title 1 to 3 within regex")
test("[A-Z]+[a-z]+ from title 1 to 3 contains regex")
test("[A-Z]+[a-z]+ from line 1 to 3 after regex")
test("[A-Z]+[a-z]+ from line 1 to 3 before regex ")
test("[A-Z]+[a-z]+ from line 1 to 3 within regex")
test("[A-Z]+[a-z]+ from line 1 to 3 contains regex")
# match := regular_expression 		box := part n to m [operator box*]
# match := regular_expression 		box := part n to m between*
#----------------------------------------------------------------


test("is(Person) from title #1 after Education")
'''
