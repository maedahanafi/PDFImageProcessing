'''
Maeda Hanafi
Texture's DSL
'''

from test_traverse import *
from pyparsing import *
from invRegex import *
import re
from entities import entities

# Define grammar
# Define recursive tokens
rule 	= Forward()
match 	= Forward()
box 	= Forward()
part 	= Or([CaselessKeyword("line"),  CaselessKeyword("heading") , CaselessKeyword("title") , CaselessKeyword("page") , CaselessKeyword("section") , CaselessKeyword("paragraph") , CaselessKeyword("group")])

# match
permute_op 	= CaselessKeyword("permute") 	+ "(" + Word( alphas ) 	+ ")"
is_op 		= CaselessKeyword("is") 		+ "(" + Or(entities) 	+ ")" 
in_op 		= CaselessKeyword("in") 		+ "(" + Word( alphas ) 	+ ")" 
# Accepts a regular expression or string if the none of the above match
regular_expression 	= Regex("[\n\r\t\0\[\]\^\-\s\S\d\D\w\W\v\\\|\(\)\?\:\#\<\>\=\!\*\+\{\}\,\$a-zA-Z0-9]+")	# Regular expression to recognize a regular expression

# box
between = CaselessKeyword("between") + "(" + box + "," + box + ")" 
box_op 	= CaselessKeyword("after") | CaselessKeyword("before") | CaselessKeyword("within") | CaselessKeyword("contains") | regular_expression | box 
number 	= Optional("#" + Word(nums))


box 	<< part + number + Optional(CaselessKeyword("to") + number) + Optional(box_op) + Optional(between)
match 	<< is_op | in_op | permute_op | regular_expression | delimitedList(rule, ",") 
# rule
rule << match + Optional(CaselessKeyword("from") + box) | delimitedList(match + Optional(CaselessKeyword("from") + box), CaselessKeyword("or"))
