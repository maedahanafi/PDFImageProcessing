#!/usr/bin/env python
'''Crop an image to just the portions containing text.

Usage:

    ./crop_morphology.py path/to/image.jpg

This will place the cropped image in path/to/image.crop.png.

For details on the methodology, see
http://www.danvk.org/2015/01/07/finding-blocks-of-text-in-an-image-using-python-opencv-and-numpy.html


Revised by Maeda, Mar 2 and 3
The image must have the alphas translated to white color (in some resume images the backgrounds are alphas)
The input to this script is the image in PNG format
The text areas are bounded per line and then each bound is save in it's own image
The filenames are printed as well (important for communicating back to nodejs server).

IMPORTANT: Before running activate the environment variables:
ADUAE04448LP-MX:bbr mh4047$ source venv/bin/activate

TODO: FIX error on (-215) scn == 3 || scn == 4 in function cvtColor for imcBW.png
        Fix andre1BW.png dilation; perhaps erode for the edges on text area dilation and use finer edge(current way) for horizontal dilation.

'''

import glob
import os
import random
import sys
import random
import math
import json
import config
from collections import defaultdict

import cv2
import PIL
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
from scipy.ndimage.filters import rank_filter


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

    for ctr in document_structure:
        group               = ctr['group']
        
        for i, line in enumerate(group):
            if i == 0 and line['line_height'] > maxpercentile:
                line['type'] = 'TITLE'
            else:
                line['type'] = 'SECTION'

    return document_structure


def is_valid_crop(crop, im_size):
    x1, y1, x2, y2  = crop
    width, height   = im_size

    # Check if the crop makes sense e.g. too small 
    if abs(x1-x2) < 5 or abs(y1-y2) < 5:
        return False

    # Check if the crop doesn't exceed the image size
    if  x1 < 0 or x1 > width or x2 < 0 or x2 > width or y1 < 0 or y1 > height or y2 < 0 or y2 > height :
        return False

    return True


# Crop more vertically, in order to account for missing parts of the letters e.g. y, where the bottom part may be cut of
def vertical_additions(addition, crop, im_size):
    x1, y1, x2, y2  = crop
    width, height   = im_size

    newval = y1 - addition
    if newval >= 0:
        y1 = newval

    newval = y2 + addition
    if newval <= height:    
        y2 = newval

    return x1, y1, x2, y2 


def crop_per_line(im, contours, edges):

    # This is up to the point where we need to process the contours on our own
    # Grab the contours and crop them into their own individual images
    c_info              = props_for_contours(contours, edges)
    c_info.sort(key=lambda x: x['y1'])
    
    # Crop the lines and add it to our ditionary of lines
    page_lines          = list()
    draw                = ImageDraw.Draw(im)

    for i, ct in enumerate(c_info):
        this_crop = ct['x1'], ct['y1'], ct['x2'], ct['y2']
        addition  = 2
        this_crop = vertical_additions(addition, this_crop, im.size)

        if is_valid_crop(this_crop, im.size):

            #draw.rectangle(this_crop, outline='blue')

            # Set the crop
            this_crop_img   = im.crop(this_crop)

            # Write the cropped image to disk in PNG format
            this_out_path   = out_path + "" + str(config.image_number) + ".png"
            this_crop_img.save(this_out_path)

            # Important! This resizing will help with OCR or else it won't recognize a thing
            this_img        = Image.open(this_out_path)

            # New height size:
            baseheight      = 10 * (ct['y2'] - ct['y1']) 
            hpercent        = (baseheight / float(this_img.size[1]))

            # Autocalculate the width size:
            wsize           = int( (float(this_img.size[0]) * float(hpercent)) ) 
            this_img        = this_img.resize( (wsize, baseheight), PIL.Image.EXTENT)
            this_img        = this_img.filter(ImageFilter.SMOOTH) 
            this_img        = this_img.filter(ImageFilter.SHARPEN) 

            this_img.save(this_out_path)

            #Add the crop to page_lines
            page_lines.append({
                                'line_number'   :config.image_number, 
                                'filename'      :this_out_path, 
                                'type'     :'',                # We figure out the classfication later on
                                'x1'            :ct['x1'],          # The original bounding box coordinates are kept for classifcation purposes
                                'y1'            :ct['y1'],
                                'x2'            :ct['x2'],
                                'y2'            :ct['y2'],
                                'line_height'   :ct['y2']-ct['y1'],
                                'text'          :''
            })

            config.image_number = config.image_number + 1

    #im.show()
    return page_lines


def props_for_contours(contours, ary):
    """Calculate bounding box & the number of set pixels for each contour."""
    c_info = []
    for c in contours:
        x,y,w,h = cv2.boundingRect(c)
        c_im    = np.zeros(ary.shape)
        cv2.drawContours(c_im, [c], 0, 255, -1)
        c_info.append({
                        'x1'    : x,
                        'y1'    : y,
                        'x2'    : x + w - 1,
                        'y2'    : y + h - 1,
                        'sum'   : np.sum(ary * (c_im > 0))/255
        })
    return c_info


def dilate(horizontal, ary, N, iterations): 
       
    if horizontal:
        #Dilate horizontally
        kernel              = np.zeros((N,N), dtype=np.uint8)
        kernel[(N-1)/2,:]   = 1

        #dilated_image       = cv2.dilate(ary / 255, cv2.getStructuringElement(cv2.MORPH_CROSS,(5,1)), iterations=iterations)
        #kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(3,3))


        dilated_image       = cv2.dilate(ary / 255, kernel, iterations=iterations)
        
    else:
        kernel              = np.zeros((N,N), dtype=np.uint8)
        kernel[(N-1)/2,:]   = 1
        dilated_image       = cv2.dilate(ary / 255, kernel, iterations=iterations)

        kernel              = np.zeros((N,N), dtype=np.uint8)
        kernel[:,(N-1)/2]   = 1
        dilated_image       = cv2.dilate(dilated_image, kernel, iterations=iterations)
    
    return dilated_image


def find_components(edges, max_components, horizontal):
    '''
    Dilate the image until there are just a few connected components.
    Returns contours for these components.

    Perform increasingly aggressive dilation until there are just a few
    connected components.
    
    Text area dilation (horizontal = false) continues if the count improves per step. 
    If not then we must terminate the loop.
    Horizontal dilation simply iterates based on the image's width.
    '''
    
    count       = max_components + 1
    prev_count  = count          + 1
    dilation    = 5
    
    if not horizontal:  
        n       = 1
        while count > max_components and prev_count!=count:
            n                   += 1
            dilated_image       = dilate(horizontal, edges, N=3, iterations=n)
            contours, hierarchy = cv2.findContours(dilated_image, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
            prev_count          = count
            count               = len(contours)
        
        #Image.fromarray(edges).show()
        #Image.fromarray(255 * dilated_image).show()

    else:
        #Dilate only individual letters
        #Goal: Extract lines instead of horizontal lines
        #Nearest neighbor???

        #dilated_image = edges

        n                       = max_components
        dilated_image           = dilate(horizontal, edges, N=3, iterations=n)
        
        #gray_blur = cv2.GaussianBlur(edges, (15, 15), 0)
        #thresh = cv2.adaptiveThreshold(gray_blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 1)
        #kernel = np.ones((3, 3), np.uint8)
        #kernel = cv2.getStructuringElement(cv2.MORPH_CROSS,(3,3))
        #dilated_image = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=4)

        contours, hierarchy     = cv2.findContours(dilated_image, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE) #cv2.findContours(dilated_image, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        count                   = len(contours)

        #Image.fromarray(edges).show()
        #Image.fromarray(255 * dilated_image).show()
    #Image.fromarray(edges).show()
    #Image.fromarray(255 * dilated_image).show()

    return contours


def angle_from_right(deg):
    return min(deg % 90, 90 - (deg % 90))


def remove_border(contour, ary):
    '''
    Remove everything outside a border contour.
    Use a rotated rectangle (should be a good approximation of a border).
    If it's far from a right angle, it's probably two sides of a border and
    we should use the bounding box instead.
    '''
    c_im    = np.zeros(ary.shape)
    r       = cv2.minAreaRect(contour)
    degs    = r[2]
    if angle_from_right(degs) <= 10.0:
        box = cv2.cv.BoxPoints(r)
        box = np.int0(box)
        cv2.drawContours(c_im, [box], 0, 255, -1)
        cv2.drawContours(c_im, [box], 0, 0, 4)
    else:
        x1, y1, x2, y2 = cv2.boundingRect(contour)
        cv2.rectangle(c_im, (x1, y1), (x2, y2), 255, -1)
        cv2.rectangle(c_im, (x1, y1), (x2, y2), 0, 4)

    return np.minimum(c_im, ary)


def find_border_components(contours, ary):
    borders     = []
    area        = ary.shape[0] * ary.shape[1]
    for i, c in enumerate(contours):
        x,y,w,h = cv2.boundingRect(c)

        if w * h > 0.5 * area:
            borders.append((i, x, y, x + w - 1, y + h - 1))

    return borders


def extract_line_edges(im):
    # Dilate image _before_ finding a border. Otherwise the edge detection algorithm would lose tips of letters
    # Pokemon image extracting technique of finding borders: http://www.pyimagesearch.com/2014/04/21/building-pokedex-python-finding-game-boy-screen-step-4-6/
    
    #im                  = cv2.cvtColor(np.asarray(im), cv2.COLOR_BGR2GRAY)
    #im                  = cv2.bilateralFilter(np.asarray(im), 11, 17, 17)

    edges               = cv2.Canny(np.asarray(im), 50, 100)

    contours, hierarchy = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    borders             = find_border_components(contours, edges)

    borders.sort(key=lambda (i, x1, y1, x2, y2): (x2 - x1) * (y2 - y1))

    border_contour      = None
    if  len(borders):
        border_contour  = contours[borders[0][0]]
        edges           = remove_border(border_contour, edges)

    edges = 255 * (edges > 0).astype(np.uint8)

    return edges   


def extract_text_area_edges(im):
    # print "extract_text_area_edges"
    # Dilate image _before_ finding a border. Otherwise the edge detection algorithm would lose tips of letters
    # Pokemon image extracting technique of finding borders: http://www.pyimagesearch.com/2014/04/21/building-pokedex-python-finding-game-boy-screen-step-4-6/
    #print im
    #imarray = np.array(im.getdata()).reshape(im.size[0], im.size[1], 3)
    im                  = cv2.cvtColor(np.asarray(im), cv2.COLOR_BGR2GRAY)#cv2.cvtColor(imarray, cv2.COLOR_BGR2GRAY)
    # print "in edges"
    im                  = cv2.bilateralFilter(np.asarray(im), 11, 17, 17)
    edges               = cv2.Canny(np.asarray(im), 50, 100)



    contours, hierarchy = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    borders             = find_border_components(contours, edges)

    borders.sort(key=lambda (i, x1, y1, x2, y2): (x2 - x1) * (y2 - y1))

    border_contour      = None
    if  len(borders):
        border_contour  = contours[borders[0][0]]
        edges           = remove_border(border_contour, edges)

    edges = 255 * (edges > 0).astype(np.uint8)

    # Remove ~1px borders using a rank filter. Rank filter should be used when there are noises in the images.
    # Rank filter simply reduces pixels based on neighbors, thus pinpointing actual text from noise.
    # Including rank filter helps differentiate a one pixel length gap between lines. 
    # Not including rank filter helps keep the tip's of letters together and thus not cropped.
    # Thus we keep the rank filter for text area dilation because we want to gethr the smallest possible text areas
    maxed_rows  = rank_filter(edges, -4, size=(1, 20))
    maxed_cols  = rank_filter(edges, -4, size=(20, 1))
    debordered  = np.minimum(np.minimum(edges, maxed_rows), maxed_cols)
    edges       = debordered

    return edges
 

def extract_text_area(im):
    #print 'extract_text_area'
    edges               = extract_text_area_edges(im)

    # Find contours of text areas and dilate in all directions in order to get areas of text
    horizontal          = False 
    max_num_text_areas  = 10    # Dummy value
    contours            = find_components(edges, max_num_text_areas, horizontal)


    return edges, contours


def downscale_image(im, max_dim=2048):
    '''
    Shrink im until its longest dimension is <= max_dim.
    Returns new_image, scale (where scale <= 1).
    '''
    a, b    = im.size
    if max(a, b) <= max_dim:
        return 1.0, im

    scale   = 1.0 * max_dim / max(a, b)
    new_im  = im.resize((int(a * scale), int(b * scale)), Image.ANTIALIAS)
    return scale, new_im


def process_image(path, out_path):
    original_im = Image.open(path)
    scale, im   = downscale_image(original_im)

    # print "begin parse"

    # Continuously extract text areas
    edges, contours = extract_text_area(im)
    if len(contours) == 0:
        return  

    # print "done extracting text areas"  
      
    document_structure  = list()
    c_info              = props_for_contours(contours, edges)
    c_info.sort(key=lambda x: x['y1'])

    # print "done contouring"  

    # Cropping per line on a text_area and find the contours of each line
    for c in c_info:
        text_area_crop          = c['x1'], c['y1'], c['x2'], c['y2']
        text_area               = im.crop(text_area_crop)
        text_area_edges         = extract_line_edges(text_area)  #extract_edges(text_area)
        horizontal_length       = text_area.size[0]

        # print "done extracting a line"  


        # We will dilate horizontally instead of horizontally and vertically
        horizontal              = True 
        text_area_contours      = find_components(text_area_edges, horizontal_length, horizontal)

        if len(text_area_contours) != 0:
            # draw.rectangle(this_crop, outline='blue')
            
            # For each text area divide it by lines
            page_lines          = crop_per_line(text_area, text_area_contours, text_area_edges)
            document_structure.append({'group':page_lines})

            # Printing the information will send it to the nodejs process
            # print json.dumps({'data':page_lines})

    document_structure.sort(key=lambda x: x['group'][0]['y1'])
    document_structure          = assign_line_type(document_structure)
    print json.dumps({'data':document_structure})
    #im.show()
    return json.dumps({'data':document_structure})

if __name__ == '__main__':
    if len(sys.argv) == 2 and '*' in sys.argv[1]:
        files       = glob.glob(sys.argv[1])
        random.shuffle(files)
    else:
        files       = sys.argv[1:]
    for path in files:
        out_path    = path.replace('.png', '.crop.png')
        #print out_path
        if os.path.exists(out_path): continue
        try:
            #print("Process images")
            process_image(path, out_path)
        except Exception as e:
            print '%s %s' % (path, e)

