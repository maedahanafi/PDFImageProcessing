#!/usr/bin/env python
'''
    Maeda Hanafi
    Traverses a document structure.

    To run this script, be sure to activate the env from folder /bbr: source venv/bin/activate
'''
import argparse
import json

'''
    A box_type of Page will return an array of all the text within the page eg. [textline1, textline2, ...]
    A box_type of Section will return an array of all the text within the section eg. [textline1fromsection, textline2fromsection, ...]
    A box_type of Line will return an array of only that line
'''
def getText(box_type, box_obj, n, m):
    if box_type == 'Page':
        return [ line_obj['text'] for group_ctr in box_obj for line_obj in group_ctr['group'] ]
    
    if box_type == 'Section':
        return [ line_obj['text'] for line_obj  in box_obj ]

    if box_type == 'Line':
        return [ box_obj ['text'] ]

    return []

'''
    If box1 = page, then box2 = page in order to return True
    If box1 = section | paragraph | group | lines and box2 = section | paragraph | group | lines, then return True
    If box1 = title | heading | line and box2 = title | heading | line, then return True
'''
def isMatch(box1, box2):
    if box1 == 'Page' and box2 == 'Page':
        return True
    elif (box1 == 'Section' or box1 == 'Paragraph' or box1 == 'Group' or box1 == 'Lines') and (box2 == 'Section' or box2 == 'Paragraph' or box2 == 'Group' or box2 == 'Lines'):
        return True
    elif (box1 == 'Title' or box1 == 'Heading' or box1 == 'Line') and (box2 == 'Title' or box2 == 'Heading' or box2 == 'Line'):
        return True
    return False


'''
    Traverses a document structure in the form of a json structure.
    Returns a string that matches the input
'''
def traverse(document_structure, box, n, m):
    # For now we assume n = m e.g. we only extract one box
    n_count = -1                                                 # This keeps track the number of times the box has been found. Traverse returns when n_count = n.

    for page_content_ctr in document_structure:
        page_content = page_content_ctr['page_content']
        curr_box     = 'Page'                                   # Set current box to Page

        if isMatch(box, curr_box):                              # For every match, increase by one
            n_count+=1
            if n_count == n:              
                return getText(curr_box, page_content, n, m)

        for group_ctr in page_content:
            group    = group_ctr['group']
            curr_box = 'Group'                                  # Set current box to Group

            if isMatch(box, curr_box):
                n_count+=1   
                if n_count == n:                        
                    return getText(curr_box, group, n, m)

            for line_obj in group:
                curr_box = 'Line'                               # Set current box to Line

                if isMatch(box, curr_box):
                    n_count+=1  
                    if n_count == n:                 
                        return getText(curr_box, line_obj, n, m)


'''
    Command format: document_structure_filename box_name [-n] [-m]
    e.g. image_processing/document_structure/patricia0.json Title -n 1  

    Valid box_names: 
        Title or Heading
        Page
        Section
        Line
'''
if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Traverse a document structure to return the structure specified.')
    parser.add_argument('filename', action="store"           , help="The filename of the document_structure" )
    parser.add_argument('boxname',  action="store"           , help="The box to find within the document"    )
    parser.add_argument('-n',       action="store", type=int , help="The box number"                         )
    parser.add_argument('-m',       action="store", type=int , help="The end of the range of the box number" )

    args = parser.parse_args()

    # By default, if n or m doesn't have a value, set it to 1, as we will take the first occurence of box a priority    
    if args.n is None:
        args.n = 0

    if args.m is None:
        args.m = 0

    org_document_structure = json.loads(open(args.filename).read())
    print json.dumps({ 'data':traverse(org_document_structure, args.boxname, args.n, args.m) })
