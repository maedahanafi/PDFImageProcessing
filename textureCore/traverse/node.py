from numpy import *
class NodeT(object):
 
    def __init__(self, node_type, value, children=array([])):
        self.node_type = node_type
        self.value = value
        self.children = children
 
    def __str__(self):
        return str(self.value)
 
    def show_tree(self, level=0):
        print "%s%s" % ("."*level, repr(self.value))
        for node in self.children:
            node.show_tree(level+2)

    def set_value(self, new_value):
        self.value = new_value

    def get_value(self):
        return self.value

    def add_kid(self, new_node):
        self.children.append(new_node)
    

    def traverse(self, direction, box_match, level=0):
        '''
        @direction can be "forward", "backward"
        @box_match e.g. {'function': 'after', 'function_param': ['string', 'EXPERIENCE']}
        '''
        box_func = box_match['function']
        box_param = box_match["function_param"]

        if self.is_match(box_param):
            print "match!:"+self.value
            return self

        if direction == "forward":
            # Search for a node that matches the function_params
            for node in self.children:
                # If the function is 'after', then continue to traverse forward
                if box_func == "after":
                    result = node.traverse(direction, box_match, level+2)
                    
                # If the function is a from clause, then find a title
                elif box_func == "from":
                    result = node.traverse(direction, box_match, level+2)
           
                # If a node is returned, then return that node
                if result != None:  
                    return result

    # @box_info contains the info of the box we are trying to find.
    def is_match(self, box_info):
        box_type = box_info[0]

        # A string type indicates a check to see if it is a substring of the current node
        if box_type == "string":
            box_string = box_info[1]
            if str(box_string) in str(self.value):  
                print 'MATCH'
                return True
        elif box_type == "Title":
            if self.node_type =="Title":
                print 'MATCH'
                return True
        return False