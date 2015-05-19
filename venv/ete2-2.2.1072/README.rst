The Environment for Tree Exploration (ETE) is a Python programming
toolkit that assists in the automated manipulation, analysis and
visualization of phylogenetic trees (although clustering trees or any
other tree-like data structure could be used). 

ETE is currently developed as a tool for researchers working in
phylogenetics and genomics. If you use ETE for a published work,
please cite:

::

  Jaime Huerta-Cepas, Joaquín Dopazo and Toni Gabaldón. ETE: a python
  Environment for Tree Exploration. BMC Bioinformatics 2010, 11:24.

DESCRIPTION
****************

Supported Tree Formats:
========================

Currently, the following tree data formats are supported, both for
reading and writing trees:

 - Newick (including several sub-types)
 - Extended Newick / New Hampshire Extended (NHX) 
 - PhyloXML
 - NeXML

Tree operations: 
================

With ETE, trees are loaded as a succession of TreeNode objects
connected in a hierarchical way. Each TreeNode instance contains
methods to operate with it independently. This is, although the
top-most TreeNode instance represents the whole tree structure, any
child node can be used independently as a subtree instance.

Available (per node) operations include:

 - Iteration over descendant or leaf nodes.
 - Tree traversing: post-order, pre-order, level-order-
 - Search (descendant) nodes by their properties.
 - Root / Unroot
 - Calculate branch-length and topological distances among nodes.
 - Node annotation (add custom features and properties to nodes)
 - Automatic tree pruning 
 - Tree structure manipulation (add/remove parent, children, sister
   nodes, etc.).
 - Newick and extended newick (including annotations) conversion
 - shortcuts and checks: "len(Node)", "for leaf in Node", "if node in
   Tree", etc. 


Tree Visualization:
===================

A programmatic tree rendering engine is fully integrated with the Tree
objects. It allows to draw trees in both rectangular and circular
modes. The aspect of nodes, branches and other tree items are fully
configurable and can be dynamically controlled (this is, certain
graphical properties of nodes can be linked to internal node values).

Trees can be visualized interactively using a built-in Graphical User
Interface (GUI) or exported as PNG images or SVG/PDF vector graphics
images.


Phylogenetic Trees: 
===================

ETE is not a phylogenetic reconstruction program, as it only provides
methods to load, analyze and manipulate phylogenetic results. Thus, a
PhyloTree instance is provided, which extends the standard Tree
functionality with phylogenetics related methods. Most notably:

- Link trees with Multiple Sequence Alignments (MSAs).
- Automatic detection of species codes within family gene-trees
- Node monophyly checks.
- Orthology and paralogy detection based on tree reconciliation or
  species overlap.
- Relative dating of speciation and duplication events. 
- Combined visualization of trees and MSA.
- Integrated with the phylomeDB database

Full info and documentation can be found at: http://ete.cgenomics.org


