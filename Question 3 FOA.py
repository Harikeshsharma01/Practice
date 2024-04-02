class TreeNode:
    def __init__(self, name):
        self.name = name
        self.children = []

    def add_child(self, child):
        self.children.append(child)

def search_tree(node, target):
    if node.name == target:
        return True

    for child in node.children:
        if search_tree(child, target):
            return True

    return False

satyam = TreeNode("Satyam")
satyam.add_child(TreeNode("Child1"))
satyam.add_child(TreeNode("Child2"))
satyam.add_child(TreeNode("Child3"))

child1 = satyam.children[0]
child1.add_child(TreeNode("Grandchild1.1"))
child1.add_child(TreeNode("Grandchild1.2"))

child2 = satyam.children[1]
child2.add_child(TreeNode("Grandchild2.1"))
child2.add_child(TreeNode("Grandchild2.2"))

child3 = satyam.children[2]
child3.add_child(TreeNode("Grandchild3.1"))
child3.add_child(TreeNode("Grandchild3.2"))
child3.add_child(TreeNode("Wife"))

# Function to search for a satyam's wife in the tree
def search_string_in_tree(root, target):
    if search_tree(root, target):
        print(f"Satyam Kounder '{target}' found in the tree.")
    else:
        print(f"Satyam Kounder '{target}' not found in the tree.")

# Searching for a wife
search_string_in_tree(satyam, "Wife")