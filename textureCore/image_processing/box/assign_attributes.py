'''
Instatiate all boxes
'''
import numpy as np
import re
import os

options  = '-psm 7' #For OCR, treat the image as a single line of text
ocr_path = 'ocr/' #Directory where all OCR text is stored

def read_file(file_path):
    text_obj = open(file_path)
    text = text_obj.read()
    if text == None:
        return str('')
    return text

def recognize_text(document_structure):
    '''
    Call tesseract from python
    '''
    file_num = 0
    for i, ctr in enumerate(document_structure):
        group  = ctr['group']

        for j, line in enumerate(group):

            image_file   = line['filename']
            regex = re.compile(r'/([a-zA-Z0-9_ -]+)+\.')

            onlyfilename = str(regex.search(image_file).group(1))        #If imagefile is img/miller0BW.crop.png0.png, then onlyfilename is miller0BW 
            out_file     = ocr_path + onlyfilename + str(file_num)
            line['textFile']     = out_file + '.txt'

            cmd = 'tesseract ' + image_file + ' ' + out_file + ' ' + options
            os.system(cmd)  #Invoke a child process that calls tesseract
            line['text']     = read_file(line['textFile'])    #Read in the file containing the recognized text and assign it to the line's text attribute

            file_num = file_num + 1

    return document_structure

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
   

