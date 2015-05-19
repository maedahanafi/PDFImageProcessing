'''
Instatiate all boxes
'''
import numpy as np

def assign_line_type(document_structure):
    '''
    If the first line of a group is the only one that has the maximum height within its group and that line isn't the only line in the group, 
    assign it title. 
    If the line is the only line in the group, it can be assigned title only if it is the biggest among the
    whole document structure. All others are assigned section.
    A more advanced grouping is expected later on through standard deviation between gaps as this method is quite basic.
   
    Also if the line heights aren't too different from each others, then we should treat them equal
    
    Edit:
    A line is a title, when its height is greater than the 75th percentile among all heights. 
    If there are more than one
    line in a group, then the line must be the first one in the group to be a title and it must be the only one with that max height.
    No need for further grouping since the dilation is sensitive to the grouping
    '''
    flatten_group_arr   = reduce(lambda x,y: x+y,[group['group'] for group in document_structure]) 
    all_line_height_arr = [line['line_height'] for line in flatten_group_arr]
    maxpercentile       = np.percentile(all_line_height_arr, 75)

    for i, ctr in enumerate(document_structure):
        group               = ctr['group']

        for j, line in enumerate(group):
            if i == 0 and j == 0 and line['line_height'] > maxpercentile:
                line['type'] = 'Title'
            elif j == 0 and line['line_height'] > maxpercentile:
                line['type'] = 'Heading'
            else:
                line['type'] = 'Line'

    return document_structure
