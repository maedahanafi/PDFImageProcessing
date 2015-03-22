"""
Resize image in order to enhance OCR results
"""

import PIL
from PIL import Image

basewidth = 1280 #new width size
this_img = Image.open('test.crop.png0.png')
wpercent = (basewidth/float(this_img.size[0]))
hsize = int((float(this_img.size[1])*float(wpercent)))    #autocalculate the height size
this_img = this_img.resize((basewidth,hsize), PIL.Image.ANTIALIAS)
this_img.save('test.crop.png0.png')