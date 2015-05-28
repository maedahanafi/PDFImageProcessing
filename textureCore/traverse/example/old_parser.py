'''
pythonGrammarParser.py
Copyright, 2006, by Paul McGuire

Maeda Hanafi
Texture's DSL
'''

from test_traverse import *
from pyparsing import *

# should probably read this from the Grammar file provided with the Python source, but 
# this just skips that step and inlines the bnf text directly - this grammar was taken from
# Python 2.4.1
#
grammar = """
# Grammar for Python

# Note:  Changing the grammar specified in this file will most likely
#        require corresponding changes in the parser module
#        (../Modules/parsermodule.c).  If you can't make the changes to
#        that module yourself, please co-ordinate the required changes
#        with someone who can; ask around on python-dev for help.  Fred
#        Drake <fdrake@acm.org> will probably be listening there.

rule: match[from box] 
match: rule | permute | is | in | regular_expression
permute: permute (rule)
is: is(entity)
entity: person | organization
person:'person'
organization: 'organization'
in: in(dictionary)
dictionary: test
regular_expression:'regular_expression'
part: line | heading | title | caption | page | table | section | paragraph
line: 'line'
heading: 'heading'
title: 'title'
caption:'caption'
page:'page'
table: 'table'
section: 'section'
paragraph: 'paragraph'
from: 'from'


"""

class SemanticGroup(object):
    def __init__(self,contents):
        self.contents = contents
        while self.contents[-1].__class__ == self.__class__:
            self.contents = self.contents[:-1] + self.contents[-1].contents
        
    def __str__(self):
        return "%s(%s)" % (self.label, 
                " ".join([isinstance(c,basestring) and c or str(c) for c in self.contents]) )
        
class OrList(SemanticGroup):
    label = "OR"
    pass
    
class AndList(SemanticGroup):
    label = "AND"
    pass

class OptionalGroup(SemanticGroup):
    label = "OPT"
    pass
    
class Atom(SemanticGroup):
    def __init__(self,contents):
        if len(contents) > 1:
            self.rep = contents[1]
        else:
            self.rep = ""
        if isinstance(contents,basestring):
            self.contents = contents
        else:
            self.contents = contents[0]
            
    def __str__(self):
        return "%s%s" % (self.rep, self.contents)
    
def makeGroupObject(cls):
    def groupAction(s,l,t):
        try:
            return cls(t[0].asList())
        except:
            return cls(t)
    return groupAction


# bnf punctuation
LPAREN = Suppress("(")
RPAREN = Suppress(")")
LBRACK = Suppress("[")
RBRACK = Suppress("]")
COLON  = Suppress(":")
ALT_OP = Suppress("|")

# bnf grammar
ident = Word(alphanums+"_")
bnfToken = Word(alphanums+"_") + ~FollowedBy(":")
repSymbol = oneOf("* +")
bnfExpr = Forward()
optionalTerm = Group(LBRACK + bnfExpr + RBRACK).setParseAction(makeGroupObject(OptionalGroup))
bnfTerm = ( (bnfToken | quotedString | optionalTerm | ( LPAREN + bnfExpr + RPAREN )) + Optional(repSymbol) ).setParseAction(makeGroupObject(Atom))
andList = Group(bnfTerm + OneOrMore(bnfTerm)).setParseAction(makeGroupObject(AndList))
bnfFactor = andList | bnfTerm
orList = Group( bnfFactor + OneOrMore( ALT_OP + bnfFactor ) ).setParseAction(makeGroupObject(OrList))
bnfExpr <<  ( orList | bnfFactor )
bnfLine = ident + COLON + bnfExpr

bnfComment = "#" + restOfLine

# build return tokens as a dictionary
bnf = Dict(OneOrMore(Group(bnfLine)))
bnf.ignore(bnfComment)

# bnf is defined, parse the grammar text
bnfDefs = bnf.parseString(grammar)

# correct answer is 78
#expected = 78
#assert len(bnfDefs) == expected, \
#    "Error, found %d BNF defns, expected %d" % (len(bnfDefs), expected)

# list out defns in order they were parsed (to verify accuracy of parsing)
#for k,v in bnfDefs:
#    print k,"=",v
#print

# list out parsed grammar defns (demonstrates dictionary access to parsed tokens)
for k in bnfDefs.keys():
    print k,"=",bnfDefs[k]

# box_match
# From Title #1
# After "Education"
#rule = match + " "+


