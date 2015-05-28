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

# Define parts
PART = [CaselessKeyword("line"),  CaselessKeyword("heading") , CaselessKeyword("title") , CaselessKeyword("page") , CaselessKeyword("section") , CaselessKeyword("paragraph") , CaselessKeyword("group"), CaselessKeyword("lines")]

# Define recursive tokens
rule 	= Forward()
match 	= Forward()
box 	= Forward()
part 	= (Or(PART)).setResultsName( "part" )

# match
permute_op 	= Group(CaselessKeyword("permute") 	+ "(" + Word( alphas+"_", alphanums+"_" ) + ")").setResultsName( "permute" )
is_op 		= Group(CaselessKeyword("is") 		+ "(" + Or(entities) 	+ ")").setResultsName( "isEntity" )
in_op 		= Group(CaselessKeyword("in") 		+ "(" + Word( alphas+"_", alphanums+"_" ) + ")").setResultsName( "inDict" ) 
# Accepts a regular expression or string if the none of the above match
regular_expression 	= Group(Regex("[\n\r\t\0\[\]\^\-\d\w\v\\\|\(\)\?\:\#\<\>\=\!\*\+\{\}\,\$\@a-zA-Z0-9]+")).setResultsName( "regular_expression" )	# Regular expression to recognize a regular expression

# box
between = Group(CaselessKeyword("between") + "(" + box + "," + box + ")") 
box_op 	= Group(CaselessKeyword("after") | CaselessKeyword("before") | CaselessKeyword("within") | CaselessKeyword("contains")).setResultsName( "box_operator" )
box_nd 	= Group(regular_expression | box).setResultsName( "box_operand" )
box_exp = Group( box_op + box_nd)
number 	= Group(Optional("#" + Word(nums)))


box 	<< (part + (number).setResultsName( "n" ) + Optional(CaselessKeyword("to") + (number).setResultsName( "m" ) ) + Optional(box_exp) + Optional(between)).setResultsName( "box" )
match 	= ( is_op | in_op | permute_op | regular_expression  ).setResultsName( "match" ) # | delimitedList(rule, ",")
# rule
rule << match + Optional(CaselessKeyword("from") + box) #| delimitedList(match + Optional(CaselessKeyword("from") + box), CaselessKeyword("or"))


def test( str ):
	#print str,"->"
	try:
		tokens = rule.parseString( str )
		'''
		print "tokens = ",        tokens
		print "tokens.match =", tokens.match							# ['[A-Z]+[a-z]+']
		print "tokens.permute =", tokens.permute
		print "tokens.is =", tokens.isEntity
		print "tokens.in =", tokens.inDict
		print "tokens.regular_expression =",  tokens.regular_expression	# ['[A-Z]+[a-z]+']
		print "tokens.part =",  tokens.part
		print "tokens.box_operator =",  tokens.box_operator
		print "tokens.box =",  tokens.box 								# ['page', []]
		print "tokens.n =",  tokens.n 									# []
		print "tokens.m =",  tokens.m 									# 
		'''		
		return tokens
	except ParseException, err:
		print " "*err.loc + "^\n" + err.msg
		print err
	print

'''
@tokens is the tokens from test()
@check_arr is an array of pairs of token and expected token to check against e.g. {attribute, attribute_index, expected}
'''
def check(tokens, check_arr):
	for check_pair in check_arr:
		attr 	  = check_pair["attribute"] 		# e.g. regular_expression
		expected  = check_pair["expected"] 			# e.g. [A-Z]+[a-z]+
		attr_ind  = check_pair["attribute_index"]	# e.g. 0
		token_arr = tokens[attr]					# e.g. ['[A-Z]+[a-z]+']
		actual	  = token_arr[attr_ind] 			# e.g. [A-Z]+[a-z]+
		
		if actual != expected:
			print "False:"
			print tokens
			print check_arr
			return False

	return True
