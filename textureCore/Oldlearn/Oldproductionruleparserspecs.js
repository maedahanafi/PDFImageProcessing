/*
	Production Rule Parser

	SQL Statement-like phrases with easy to use words. Given Production rules, document structures, highlights
	with labels, return what the user wants.

Operators
-	permute 
-	merge for multiple patterns
-	optional
-	lookup (for dictionary lookups)
-	in (OCR element reference e.g. School := in (Paragraph))

*/

MERGE/RULE:
	LABELS
		STRING := LABEL
		... 
	SELECT/OPTIONAL/PERMUTE (HIGHLIGHTS) || LINE_TYPE
	FROM/_ 
		LINE_TYPE || PLACE_DESCRIPTION
DICTIONARIES:
	STRING DICTIONARY_NAME := DESCRIPTION 
	...

	LABEL :=  DESCRIPTION || LOOKUP (DICTIONARY_NAME)

	DESCRIPTION := TOKEN || SYN || LINE_TYPE 

	PLACE_DESCRIPTION := IN ( LINE_TYPE) || 
							BEFORE ( LINE_TYPE) || BEFORE (TOKEN) || 
							AFTER ( LINE_TYPE) || AFTER (TOKEN) ||
							FIRST (LINE_TYPE) || FIRST(TOKEN) ||
							LAST (LINE_TYPE) || LAST (TOKEN) 

							AT PAGE N

	TOKEN := REGEX() || KEYWORD
	KEYWORD := KEYWORD STRING

	LINE_TYPE := 'SECTION' || 'TITLE'

	//IMPORTANT: STRINGS are not allowed to have special characters; just words or spaces



1: Extracting 'School', 'Major', 'Year'
RULE: 
	LABELS 
		'School' := LOOKUP ('University Dictionary') 
		'Major' := LOOKUP('MAJOR DICTIONARY') 
		'Year' := REGEX('Digit'  'Digit' 'Digit' 'Digit')
	PERMUTE ('Major', 'Year')
	SELECT ('School')
	FROM 
		AFTER 'Education'
DICTIONARIES:
	'University Dictionary' := KEYWORD 'University' || REGEX('Words'  'University')



2: Extracting Title, Abstract Text, Author
RULE:
	LABELS 
		'Title' := REGEX('Capital letter' 'Lowercases' 'Repeat')
	SELECT ('Title') 
	FROM 
		FIRST ('TITLE') 
		AT PAGE 1
RULE:
	LABELS 
		'Abstract Text' := SECTION
	SELECT ('Abstract Text') 
	FROM 
		FIRST ('SECTION') 
		AT PAGE 1
RULE:
	LABELS 
		'Author' := LOOKUP ('Name Dictionary')
	SELECT ('Author')
	FROM 
		AFTER 'TITLE'

DICTIONARIES:
	'Name Dictionary' := REGEX('Capital letter' 'Lowercases' 'Repeat' 'Twice')




