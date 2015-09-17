"""
Demo of custom tick-labels with user-defined rotation.
"""
import matplotlib.pyplot as plt
from crop_morphology import process_image

#TODO use python to 1. convert from alpha to white
#and 2. call crop_morphology (we plot from here too)
#and 3. perform ocr from python
#TODO add details
#TODO figure out how to figure the number of levels and columns 
#TODO try out hough transform and fourier transform to recongize images and tables

def test():
	x = [1, 2, 3, 4]
	y = [1, 4, 9, 6]
	labels = ['Frogs', 'Hogs', 'Bogs', 'Slogs']

	plt.plot(x, y, 'ro')
	# You can specify a rotation for the tick labels in degrees or with keywords.
	plt.xticks(x, labels, rotation='vertical')
	# Pad margins so that markers don't get clipped by the axes
	plt.margins(0.2)
	# Tweak spacing to prevent clipping of tick-labels
	plt.subplots_adjust(bottom=0.15)
	plt.show()

def plot_document_structure(imagepath):
	out_path    = imagepath.replace('.png', '.crop.png')
	#get document structure information
	document_structure = process_image(imagepath, out_path, False, False)

	#form a list of all the y box locations
	#form a list of all the heights
	y_box_location =[]
	box_heights = []

	for i, ctr in enumerate(document_structure):
		group = ctr['group']        
		for j, line in enumerate(group):
			y_box_location.append(line['y1'])
			box_heights.append(line['line_height'])

	print y_box_location
	print box_heights
	plot(y_box_location, box_heights)

def plot(y_box_location, heights):
	#a plot of the y locations in the x axis and the corresponding heights against the y axis
	x = y_box_location
	y = heights

	plt.plot(x, y, 'o')
	plt.show()

plot_document_structure('./img/obama.png')
