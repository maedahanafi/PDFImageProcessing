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
'''

import glob
import os
import random
import sys
import random
import math
import json
from collections import defaultdict

import cv2
import PIL
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
from scipy.ndimage.filters import rank_filter


def dilate(ary, N, iterations): 
    """Dilate using an NxN '+' sign shape. ary is np.uint8."""
    """kernel = np.zeros((N,N), dtype=np.uint8)
    kernel[(N-1)/2,:] = 1
    dilated_image = cv2.dilate(ary / 255, kernel, iterations=iterations)

    kernel = np.zeros((N,N), dtype=np.uint8)
    kernel[:,(N-1)/2] = 1
    dilated_image = cv2.dilate(dilated_image, kernel, iterations=iterations)"""
    
    
    kernel = np.zeros((N,N), dtype=np.uint8)
    kernel[(N-1)/2,:] = 1
    dilated_image = cv2.dilate(ary / 255, kernel, iterations=iterations)

    #dilated_image = cv2.dilate(ary / 255, cv2.getStructuringElement(cv2.MORPH_CROSS,(N, N-1)), iterations=iterations)
    
    
    return dilated_image


def props_for_contours(contours, ary):
    """Calculate bounding box & the number of set pixels for each contour."""
    c_info = []
    for c in contours:
        x,y,w,h = cv2.boundingRect(c)
        c_im = np.zeros(ary.shape)
        cv2.drawContours(c_im, [c], 0, 255, -1)
        c_info.append({
            'x1': x,
            'y1': y,
            'x2': x + w - 1,
            'y2': y + h - 1,
            'sum': np.sum(ary * (c_im > 0))/255
        })
    return c_info


def union_crops(crop1, crop2):
    """Union two (x1, y1, x2, y2) rects."""
    x11, y11, x21, y21 = crop1
    x12, y12, x22, y22 = crop2
    return min(x11, x12), min(y11, y12), max(x21, x22), max(y21, y22)


def intersect_crops(crop1, crop2):
    x11, y11, x21, y21 = crop1
    x12, y12, x22, y22 = crop2
    return max(x11, x12), max(y11, y12), min(x21, x22), min(y21, y22)


def crop_area(crop):
    x1, y1, x2, y2 = crop
    return max(0, x2 - x1) * max(0, y2 - y1)


def find_border_components(contours, ary):
    borders = []
    area = ary.shape[0] * ary.shape[1]
    for i, c in enumerate(contours):
        x,y,w,h = cv2.boundingRect(c)

        if w * h > 0.5 * area:
            borders.append((i, x, y, x + w - 1, y + h - 1))

    return borders


def angle_from_right(deg):
    return min(deg % 90, 90 - (deg % 90))


def remove_border(contour, ary):
    """Remove everything outside a border contour."""
    # Use a rotated rectangle (should be a good approximation of a border).
    # If it's far from a right angle, it's probably two sides of a border and
    # we should use the bounding box instead.
    c_im = np.zeros(ary.shape)
    r = cv2.minAreaRect(contour)
    degs = r[2]
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


def find_components(edges, max_components):
    """Dilate the image until there are just a few connected components.

    Returns contours for these components."""
    # Perform increasingly aggressive dilation until there are just a few
    # connected components.
    count = max_components + 1
    dilation = 5
    n = 1
    while count > max_components:
        n += 1
        dilated_image = dilate(edges, N=3, iterations=n)
        contours, hierarchy = cv2.findContours(dilated_image, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        count = len(contours)
        
    #Image.fromarray(edges).show()
    #Image.fromarray(255 * dilated_image).show()

    return contours


def find_optimal_components_subset(contours, edges, out_path):
    """Find a crop which strikes a good balance of coverage/compactness.

    Returns an (x1, y1, x2, y2) tuple.
    """
    c_info = props_for_contours(contours, edges)
    c_info.sort(key=lambda x: -x['sum'])
    total = np.sum(edges) / 255
    area = edges.shape[0] * edges.shape[1]

    c = c_info[0]
    del c_info[0]
    this_crop = c['x1'], c['y1'], c['x2'], c['y2']
    crop = this_crop
    covered_sum = c['sum']

    while covered_sum < total:
        changed = False
        recall = 1.0 * covered_sum / total
        prec = 1 - 1.0 * crop_area(crop) / area
        f1 = 2 * (prec * recall / (prec + recall))
        #print '----'
        for i, c in enumerate(c_info):
            this_crop = c['x1'], c['y1'], c['x2'], c['y2']
            new_crop = union_crops(crop, this_crop)
            new_sum = covered_sum + c['sum']
            new_recall = 1.0 * new_sum / total
            new_prec = 1 - 1.0 * crop_area(new_crop) / area
            new_f1 = 2 * new_prec * new_recall / (new_prec + new_recall)

            # Add this crop if it improves f1 score,
            # _or_ it adds 25% of the remaining pixels for <15% crop expansion.
            # ^^^ very ad-hoc! make this smoother
            remaining_frac = c['sum'] / (total - covered_sum)
            new_area_frac = 1.0 * crop_area(new_crop) / crop_area(crop) - 1
            if new_f1 > f1 or (
                    remaining_frac > 0.25 and new_area_frac < 0.15):
                """print '%d %s -> %s / %s (%s), %s -> %s / %s (%s), %s -> %s' % (
                        i, covered_sum, new_sum, total, remaining_frac,
                        crop_area(crop), crop_area(new_crop), area, new_area_frac,
                        f1, new_f1)"""
                #print '%s -> %s / %s (%s)' % (crop_area(crop), crop_area(new_crop), area, new_area_frac)
                                
                crop = new_crop
                covered_sum = new_sum
                del c_info[i]
                changed = True
                break

        if not changed:
            break

    return crop


def pad_crop(crop, contours, edges, border_contour, pad_px=15):
    """Slightly expand the crop to get full contours.

    This will expand to include any contours it currently intersects, but will
    not expand past a border.
    """
    bx1, by1, bx2, by2 = 0, 0, edges.shape[0], edges.shape[1]
    if border_contour is not None and len(border_contour) > 0:
        c = props_for_contours([border_contour], edges)[0]
        bx1, by1, bx2, by2 = c['x1'] + 5, c['y1'] + 5, c['x2'] - 5, c['y2'] - 5

    def crop_in_border(crop):
        x1, y1, x2, y2 = crop
        x1 = max(x1 - pad_px, bx1)
        y1 = max(y1 - pad_px, by1)
        x2 = min(x2 + pad_px, bx2)
        y2 = min(y2 + pad_px, by2)
        return crop
    
    crop = crop_in_border(crop)

    c_info = props_for_contours(contours, edges)
    changed = False
    for c in c_info:
        this_crop = c['x1'], c['y1'], c['x2'], c['y2']
        this_area = crop_area(this_crop)
        int_area = crop_area(intersect_crops(crop, this_crop))
        new_crop = crop_in_border(union_crops(crop, this_crop))
        if 0 < int_area < this_area and crop != new_crop:
            #print '%s -> %s' % (str(crop), str(new_crop))
            changed = True
            crop = new_crop

    if changed:
        return pad_crop(crop, contours, edges, border_contour, pad_px)
    else:
        return crop


def downscale_image(im, max_dim=2048):
    """Shrink im until its longest dimension is <= max_dim.

    Returns new_image, scale (where scale <= 1).
    """
    a, b = im.size
    if max(a, b) <= max_dim:
        return 1.0, im

    scale = 1.0 * max_dim / max(a, b)
    new_im = im.resize((int(a * scale), int(b * scale)), Image.ANTIALIAS)
    return scale, new_im

def is_valid_crop(crop, im_size):
    x1, y1, x2, y2 = crop
    width, height = im_size

    #Check if the crop makes sense e.g. too small 
    if abs(x1-x2)<5 or abs(y1-y2)<5:
        return False

    #Check if the crop doesn't exceed the image size
    if x1<0 or x1>width or x2<0 or x2>width or y1<0 or y1>height or y2<0 or y2>height :
        return False

    return True


#Crop more vertically, in order to account for missing parts of the letters e.g. y, where the bottom part may be cut of
def vertical_additions(crop, im_size):
    x1, y1, x2, y2 = crop
    width, height = im_size

    newval = y1 - 3
    if newval>=0:
        y1 = newval

    newval = y2 + 3
    if newval<=height:    
        y2 = newval

    return x1, y1, x2, y2 

def process_image(path, out_path):
    orig_im = Image.open(path)
    scale, im = downscale_image(orig_im)

    #print "done downscaling"

    edges = cv2.Canny(np.asarray(im), 100, 200)

    # TODO: dilate image _before_ finding a border. This is crazy sensitive!
    contours, hierarchy = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    borders = find_border_components(contours, edges)
    borders.sort(key=lambda (i, x1, y1, x2, y2): (x2 - x1) * (y2 - y1))

    #print "done finding borders"

    border_contour = None
    if len(borders):
        border_contour = contours[borders[0][0]]
        edges = remove_border(border_contour, edges)

    edges = 255 * (edges > 0).astype(np.uint8)

    # Remove ~1px borders using a rank filter.
    maxed_rows = rank_filter(edges, -4, size=(1, 20))
    maxed_cols = rank_filter(edges, -4, size=(20, 1))
    debordered = np.minimum(np.minimum(edges, maxed_rows), maxed_cols)
    edges = debordered

    #print "applying rank filter"

    #Find the contours of lines 
    standard_height_line = 10
    max_num_lines = im.size[1]/standard_height_line
    contours = find_components(edges, max_num_lines)
    if len(contours) == 0:
        #print '%s -> (no text!)' % path
        return

    #print "done finding comoponents"

    #This is up to the point where we need to process the contours on our own
    #Grab the contours and crop them into their own individual images
    c_info = props_for_contours(contours, edges)
    c_info.sort(key=lambda x: x['y1'])
    #print 'Number of boxes:%d' %(len(c_info))
    

    #Crop the lines and add it to our ditionary of lines
    page_lines = list()
    #draw = ImageDraw.Draw(im)
    for i, ct in enumerate(c_info):
        this_crop = ct['x1'], ct['y1'], ct['x2'], ct['y2']
        #print this_crop

        #Check the crop's validity 
        if is_valid_crop(this_crop, im.size):
            #Crop more vertically, in order to account for missing parts of the letters e.g. y, where the bottom part may be cut of
            this_crop = vertical_additions(this_crop, im.size)
        
            #draw.rectangle(this_crop, outline='blue')

            #Set the crop
            this_crop_img = im.crop(this_crop)

            #write the cropped image to disk in PNG format
            this_out_path = out_path+""+str(i)+".png"
            this_crop_img.save(this_out_path)
            #this_crop_img.show()

            #Important! This resizing will help with OCR or else it won't recognize a thing
            baseheight = 10*(ct['y2']-ct['y1']) #new height size
            this_img = Image.open(this_out_path)
            hpercent = (baseheight / float(this_img.size[1]))
            wsize = int((float(this_img.size[0]) * float(hpercent))) #autocalculate the width size
            this_img = this_img.resize((wsize, baseheight), PIL.Image.EXTENT)

            this_img = this_img.filter(ImageFilter.SMOOTH) 
            this_img = this_img.filter(ImageFilter.SHARPEN) #Sharpen the text

            this_img.save(this_out_path)

            #Add the crop to page_lines
            page_lines.append({'line_number':i, 
                                'filename':this_out_path, 
                                #'line_type':line_type, #We figure out the classfication later on
                                'x1':ct['x1'],        # The original bounding box coordinates are kept for classifcation purposes
                                'y1':ct['y1'],
                                'x2':ct['x2'],
                                'y2':ct['y2'],
                                'line_height': ct['y2']-ct['y1'],
                                'text':''
                                })

    #im.show()

    print json.dumps({'data':page_lines})

    #Uncomment for original functionality (from danvk) 
    """crop = find_optimal_components_subset(contours, edges, out_path)
    crop = pad_crop(crop, contours, edges, border_contour)

    crop = [int(x / scale) for x in crop]  # upscale to the original image size.
    """

    """draw = ImageDraw.Draw(im)
    c_info = props_for_contours(contours, edges)
    for c in c_info:
        this_crop = c['x1'], c['y1'], c['x2'], c['y2']
        draw.rectangle(this_crop, outline='blue')
    draw.rectangle(crop, outline='red')
    im.save(out_path)
    draw.text((50, 50), path, fill='red')
    orig_im.save(out_path)
    im.show()
    

    text_im = orig_im.crop(crop)
    text_im.save(out_path)
    print '%s -> %s' % (path, out_path)
    """


if __name__ == '__main__':
    if len(sys.argv) == 2 and '*' in sys.argv[1]:
        files = glob.glob(sys.argv[1])
        random.shuffle(files)
    else:
        files = sys.argv[1:]

    for path in files:
        out_path = path.replace('.png', '.crop.png')
        #print out_path
        if os.path.exists(out_path): continue
        try:
            #print("Process images")
            process_image(path, out_path)
        except Exception as e:
            #print '%s %s' % (path, e)
            print ''

