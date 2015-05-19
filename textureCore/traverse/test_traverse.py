'''
Instantiate the document structure in python
'''
import json
from node import NodeT
from numpy import *

def main(document_structure, box_match):
	root = NodeT("Root", "", [])
	
	for page_content_ctr in document_structure:
		page_content = page_content_ctr['page_content']
		curr_box     = 'Page'                                   # Set current box to Page
		page_content_str = ""
		page_node 	 = NodeT('Page', page_content_str, [])

		for group_ctr in page_content:
			group    	= group_ctr['group']
			curr_box 	= 'Section'                                # Set current box to Section
			group_content_str = ""
			group_node 	= NodeT('Group', group_content_str, [])

			for line_obj in group:
				curr_box 	= 'Line'                               # Set current box to Line
				line_text 	= line_obj['text'].encode('utf-8')
				line_type 	= line_obj['type']
				line_node 	= NodeT(line_type, line_text, [])

				page_content_str 	= str(page_content_str 	+ line_text)
				group_content_str 	= str(group_content_str + line_text)
				group_node.add_kid(line_node)

			group_node.set_value(group_content_str)	# Add the group's string content to the group node
			page_node.add_kid(group_node)

		print page_node.get_value()

		page_node.set_value(page_content_str)		# Add the page's string content to the page node
		root.add_kid(page_node)

	print root.show_tree()	

	curr_node = root
	# Loop through each box_match and execute each one
	for index, item in reversed(list(enumerate(box_match))):
		print index, item
		curr_node = curr_node.traverse(item)
		print "found:%s" %curr_node
	

# box_match
# From Title #1
# After "Education"
box_match = array([{'function':'from', 'function_param': ['Title', 0]},{'function':'after', 'function_param':['string', 'EXPERIENCE']}]);
filename 				= '../image_processing/document_structure/patricia0.json'
org_document_structure 	= json.loads(open(filename).read())

main(org_document_structure, box_match)

