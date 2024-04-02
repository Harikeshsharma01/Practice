import networkx as nx
import matplotlib.pyplot as plt

def dijkstra_safest_path(graph, source_node):
    # Initialize distances and predecessors
    distances = {node: float('inf') for node in graph.nodes}
    predecessors = {node: None for node in graph.nodes}
    visited = set()

    # Set the distance to the source node as 0
    distances[source_node] = 0

    while len(visited) < len(graph.nodes):
        # Find the node with the smallest distance that hasn't been visited
        current_node = min((node for node in graph.nodes if node not in visited), key=lambda node: distances[node])

        # Mark the current node as visited
        visited.add(current_node)

        # Update distances and predecessors for adjacent nodes
        for neighbor in graph.neighbors(current_node):
            if neighbor not in visited:
                edge_weight = graph[current_node][neighbor]['weight']
                bomb_count = graph.nodes[neighbor]['bombs']
                total_damage = distances[current_node] + edge_weight + bomb_count

                if total_damage < distances[neighbor]:
                    distances[neighbor] = total_damage
                    predecessors[neighbor] = current_node

    return distances, predecessors

# Example input matrix representing terrorists and their bomb counts
terrorist_matrix = [
    [0, 1, 0, 0, 3],
    [0, 0, 2, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0]
]

# Create a directed graph
G = nx.DiGraph()

# Add nodes to the graph with bomb counts as attributes
num_nodes = len(terrorist_matrix)
for i in range(num_nodes):
    G.add_node(i, bombs=terrorist_matrix[i][i])  # Each terrorist's bomb count is taken from the diagonal of the matrix

# Add edges based on the matrix
for i in range(num_nodes):
    for j in range(num_nodes):
        if terrorist_matrix[i][j] != 0:
            G.add_edge(i, j, weight=terrorist_matrix[i][j])

# Run Dijkstra's algorithm to find the safest path considering bomb damage
source_node = 0
distances, predecessors = dijkstra_safest_path(G, source_node)

# Print safest paths from the source node
print("Safest paths from node", source_node)
for node, distance in distances.items():
    print("Node:", node, "Safest Distance:", distance)

# Draw the graph
pos = nx.spring_layout(G)  # positions for all nodes
nx.draw(G, pos, with_labels=True, node_size=1000, node_color="lightblue", font_size=10, font_weight="bold")
edge_labels = {(i, j): w['weight'] for i, j, w in G.edges(data=True)}
nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels, font_color='red')

plt.show()
