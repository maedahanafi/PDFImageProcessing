'''
Maeda Hanafi
Texture's DSL
Help links: 
	http://werc.engr.uaf.edu/~ken/doc/python-pyparsing/HowToUsePyparsing.html
	http://pyparsing.wikispaces.com/Examples
	http://www.slideshare.net/Siddhi/creating-domain-specific-languages-in-python
Example: https://pyparsing.wikispaces.com/file/view/simpleSQL.py/30112834/simpleSQL.py

'''

from test_traverse import *
from pyparsing import *
import re
from entities import entities
import pprint
pp = pprint.PrettyPrinter(indent=4)

# Define parts
PART = [CaselessKeyword("line"),  CaselessKeyword("heading") , CaselessKeyword("title") , CaselessKeyword("page") , CaselessKeyword("section") , CaselessKeyword("paragraph") , CaselessKeyword("group"), CaselessKeyword("lines")]

# Define recursive tokens
rule 	= Forward()
match 	= Forward()
box 	= Forward()
part 	= Group(Or(PART)).setResultsName( "part" )

# match
permute_op 	= Group(CaselessKeyword("permute") 	+ "(" + Word( alphas+"_", alphanums+"_" ) + ")").setResultsName( "permute" )
is_op 		= Group(CaselessKeyword("is") 		+ "(" + Or(entities) 	+ ")").setResultsName( "isEntity" )
in_op 		= Group(CaselessKeyword("in") 		+ "(" + Word( alphas+"_", alphanums+"_" ) + ")").setResultsName( "inDict" ) 
# Accepts a regular expression or string if the none of the above match
regular_expression 	= (Regex("[\n\r\t\0\[\]\^\-\d\w\v\\\|\(\)\?\:\#\<\>\=\!\*\+\{\}\,\$\@a-zA-Z0-9]+")).setResultsName( "regular_expression" )	# Regular expression to recognize a regular expression
# Regex that should accept regexes with spaces, but doesnt. TODO: recognizing the end of the string or a from token
#regular_expression 	= Group(Regex("(?P<regex>^(?=[^\s])[\n\r\t\0\[\]\^\-\d\w\v\\\|\(\)\?\:\#\<\>\=\!\*\+\{\}\,\$\@a-zA-Z0-9\s]+)(?=from.*?)")).setResultsName( "regular_expression" )	# Regular expression to recognize a regular expression

# box
between = Group(CaselessKeyword("between") + "(" + box + "," + box + ")").setResultsName( "between" )
box_op 	= CaselessKeyword("after") | CaselessKeyword("before") | CaselessKeyword("within") | CaselessKeyword("contains")#Group()).setResultsName( "box_operator" )
box_nd 	= box | regular_expression #Group()).setResultsName( "box_operand" )
box_exp = (box_op + box_nd).setResultsName( "box_expression" )

chain 		= box_exp | between#.setResultsName( "chain" )

number 		= Group(Optional("#" + Word(nums)))
part_range 	= Optional((number).setResultsName( "n" ) + Optional(CaselessKeyword("to") + (number).setResultsName( "m" )))

box 	<<  part + part_range + Optional(chain) #Group().setResultsName("box")
match 	= ( is_op | in_op | permute_op | regular_expression  ).setResultsName( "match" ) # | delimitedList(rule, ",")
# rule
rule << match + Optional(CaselessKeyword("from") + box) #| delimitedList(match + Optional(CaselessKeyword("from") + box), CaselessKeyword("or"))


def test( str ):
	#print str,"->"
	try:
		tokens = rule.parseString( str )	
		return tokens
	except ParseException, err:
		print " "*err.loc + "^\n" + err.msg
		print err
	print

'''
@tokens is the tokens from test()
@check_content is an array of non arrays the value e.g. {attribute, expected}
	OR a pair of token and expected token to check against e.g. {attribute, attribute_index, expected}
'''
def check(tokens, check_content):
	check_arr = check_content
	for check_pair in check_arr:
		attr_ind  = check_pair["attribute_index"]		# Indicates whether the check should be done against a slot in an array or a value (-1)
		
		if attr_ind != -1:								# e.g. check_pair = {'expected': '[A-Z]+[a-z]+', 'attribute': 'box_expression', 'attribute_index': 1}
			attr 	  = check_pair["attribute"] 		# e.g. box_expression
			expected  = check_pair["expected"] 			# e.g. [A-Z]+[a-z]+
			attr_ind  = check_pair["attribute_index"]	# e.g. 1
			
			token_arr = tokens[attr]					# equiv. tokens.box_expression = ['after', '[A-Z]+[a-z]+']
			actual	  = token_arr[attr_ind] 			# e.g. [A-Z]+[a-z]+
			
			if actual != expected:
				print check_pair

				print "False:"
				print expected
				print actual
				print_tokens(tokens)

				return False
		
		else:											# e.g. {'expected': '[A-Z]+[a-z]+', 'attribute': 'match', 'attribute_index': -1}
			
			expected  = check_pair["expected"]			# e.g. [A-Z]+[a-z]+
			attr 	  = check_pair["attribute"] 		# e.g. match
			actual	  = tokens[attr] 					# equiv tokens.match = [A-Z]+[a-z]+
			
			if expected != actual :
				print check_pair

				print 'False (non-arr slot):'
				print expected
				print actual
				print_tokens(tokens)
		
				return False
		
	return True

def print_tokens(tokens):
	pp.pprint(tokens)
	print "tokens = ",        tokens
	print "tokens.match =", tokens.match							# ['[A-Z]+[a-z]+']
	print "tokens.permute =", tokens.permute
	print "tokens.is =", tokens.isEntity
	print "tokens.in =", tokens.inDict
	print "tokens.regex =",  tokens.regex							# ['[A-Z]+[a-z]+']
	print "tokens.regular_expression =",  tokens.regular_expression	# ['[A-Z]+[a-z]+']
	print "tokens.part =",  tokens.part
	print "tokens.n =",  tokens.n 									# []
	print "tokens.m =",  tokens.m 									# 
	#print "tokens.chain = ", tokens.chain
	print "tokens.between = ", tokens.between
	#print "tokens.box =",  tokens.box 								# ['page', []]
	print "tokens.box_expression =",  tokens.box_expression
	#print "tokens.box_operator =",  tokens.box_operator
	#print "tokens.box_operand =",  tokens.box_operand
	