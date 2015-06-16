import xml.etree.ElementTree as ET
import itertools

#This should be run when the known xpathz cannot extract anything e.g. the match expression returns nothing
def begin_xpath_learn(labeled_data, unlabeled_documents):
	#Permute and check for ones that can extract "14 Coleman st" from document 1
	print "Begin xpath learn:"
	for labeled in labeled_data:

		label_xml_root = labeled["document"]
		label_xpath = labeled["xpath"]
		label_filename = labeled["filename"]

		#Permute the nodes
		#root.findall(".//year/..[@name='Singapore']")
		#permute = list(itertools.permutations(label_xpath, ))
		all_paths = []
		j = 0
		while j<len(label_xpath):
			new_path = label_xpath[:]
			new_path[j] = {"node":"node()", "separator":"/"} 

			all_paths.append(new_path) 
			j = j+1
		for i in all_paths:
			print str(i) + "\n"

		execute_xpath(label_xpath, label_filename)

def begin_match_learn(positive_examples):
	#TODO: insert match learning algorithm
	return "[0-9]+\s[A-Za-z]+\s[A-Za-z]+"

def get_initial_xpath(positive_example, xml_doc):
	#TODO: insert an xpath learner
	return [{"node":"document", "separator":"/", "predicate":""},{"node":"paragraph", "separator":"/", "predicate":""},{"separator":"/", "node":"line","predicate":"[1]"}]

def get_xml(file_name):
	tree = ET.parse(file_name)
	root = tree.getroot()
	return root

def execute_xpath(xpath_arr, filename):
	xpath_str = "" 
	for xpath_node in xpath_arr:
		xpath_str = xpath_node["separator"] + xpath_node["node"] + xpath_node["predicate"]

	mydoc = ET(filename)
	for e in mydoc.findall(xpath_str):
		print e.get('title').text

#Test files
document1 = get_xml("document1.xml")
document2 = get_xml("document2.xml")
unlabeled_documents = [document2]

#Assume we have an initial xpath
init_xpath = get_initial_xpath("14 Coleman st", document1)
labeled_data = [{"xpath":init_xpath, "positive_examples":"14 Coleman st", "document":document1, "filename":"document1.xml"}]

#Assume we have already learned a match expression
match_expression = begin_match_learn(["14 Coleman st"])

#Begin learning an xpath expression
xpath_expression = begin_xpath_learn(labeled_data, unlabeled_documents)


#Evaluate x_path on document and then the match_expression.
expected = "77 Laconia ct"
