# # Not sure the solution is write or wrong according to the prompt
# # Provided by Mahesh Sir, I prefer to do this one by ur own and 
# # Make the PR on this repo so i can update. :)

# from collections import deque

# def bfs(start_plane):
#     visited = set()
#     queue = deque([start_plane])

#     while queue:
#         current_plane = queue.popleft()
#         if current_plane not in visited:
#             print("Moving to plane", current_plane)
#             visited.add(current_plane)

#             # Perform actions like fighting terrorists and saving passengers here

#             for neighbor in get_neighbors(current_plane):
#                 if neighbor not in visited:
#                     queue.append(neighbor)

# def get_neighbors(plane):
#     # Define the connections between planes based on the scenario
#     connections = {
#         1: [2],
#         2: [1, 3, 4],
#         3: [2],
#         4: [2, 5],
#         5: [4, 6],
#         6: [5, 7],
#         7: [6]
#     }
#     return connections.get(plane, [])

# # Start the BFS from plane 1
# bfs(1)

from collections import deque
import random
def simulate_planes_bfs(num_planes, num_terrorists_per_plane):
    planes = [[] for _ in range(num_planes)] 

    for plane_num in range(num_planes):
        for _ in range(num_terrorists_per_plane):
            planes[plane_num].append("terrorist")

    total_terrorists = num_planes * num_terrorists_per_plane
    terrorists_removed = 0

    def bfs(start_plane):
        queue = deque([start_plane])
        visited = set()
        while queue:
            current_plane = queue.popleft()
            if current_plane not in visited:
                print(f"Police moving to plane {current_plane + 1}...")
                visited.add(current_plane)
                while True:
                    if random.random() < 0.5:  # 50% chance of hearing gunshot
                        print(f"Gunshots detected in plane {current_plane + 1}!")
                        break  # Break out of the inner loop if gunshot is heard
                terrorists_removed_from_current_plane = len(planes[current_plane])
                nonlocal terrorists_removed
                terrorists_removed += terrorists_removed_from_current_plane
                planes[current_plane].clear()
                print(f"All terrorists removed from plane {current_plane + 1}.")
                for neighbor_plane in range(num_planes):
                    if neighbor_plane != current_plane:
                        queue.append(neighbor_plane)

    bfs(0)

    print("\nSimulation complete.")
    print(f"Total number of terrorists: {total_terrorists}")
    print(f"Total number of terrorists removed: {terrorists_removed}")
    print("Number of terrorists removed from each plane:")
    for plane_num, removed in enumerate([num_terrorists_per_plane] * num_planes):
        print(f"Plane {plane_num + 1}: {removed}")

# Example simulation with 7 planes and 3 terrorists per plane
simulate_planes_bfs(7, 3)











# from collections import deque
# import random

# def generate_random_matrix(size, terrorist_prob=0.2):
#     matrix = [[0] * size for _ in range(size)]
#     bomb_counts = [[0] * size for _ in range(size)]

#     for row in range(size):
#         for col in range(size):
#             if random.random() < terrorist_prob:
#                 matrix[row][col] = 1  # Set as terrorist location
#                 bomb_counts[row][col] = random.randint(1, 3)  # Random bomb count between 1 and 3

#     return matrix, bomb_counts

# def is_valid_move(row, col, matrix):
#     return 0 <= row < len(matrix) and 0 <= col < len(matrix[0]) and matrix[row][col] != 1

# def bfs_safest_path(matrix, bombs, start, end):
#     queue = deque([(start, 0, [start])])  # Updated queue to include the path taken
#     visited = set()
#     directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]

#     while queue:
#         current, current_bombs, path = queue.popleft()  # Updated to include the path
#         row, col = current

#         if current == end:
#             return current_bombs, path  # Return the path along with the number of bombs required

#         for dr, dc in directions:
#             new_row, new_col = row + dr, col + dc
#             if is_valid_move(new_row, new_col, matrix) and (new_row, new_col) not in visited:
#                 visited.add((new_row, new_col))
#                 new_bombs = current_bombs + bombs[new_row][new_col] if matrix[new_row][new_col] == 1 else current_bombs
#                 new_path = path + [(new_row, new_col)]  # Update the path with the new position
#                 queue.append(((new_row, new_col), new_bombs, new_path))

#     return -1, []  # Return an empty path if no path is found

# # Generate random matrix and bomb counts
# size = 6  # Size of the matrix
# input_matrix, bomb_counts = generate_random_matrix(size)

# # Define the start and end points
# start_point = (0, 0)
# end_point = (size - 1, size - 1)

# # Find the safest path using BFS
# safest_bombs, safest_path = bfs_safest_path(input_matrix, bomb_counts, start_point, end_point)

# # Print the generated matrix and bomb counts
# print("Generated Matrix:")
# for row in input_matrix:
#     print(row)

# print("\nBomb Counts:")
# for row in bomb_counts:
#     print(row)

# if safest_bombs != -1:
#     print(f"\nSafest path found with {safest_bombs} bombs:")
#     for step in safest_path:
#         print(step)
# else:
#     print("\nNo path found to the destination.")






















# import networkx as nx
# import matplotlib.pyplot as plt

# def dijkstra_safest_path(graph, source_node):
#     # Initialize distances and predecessors
#     distances = {node: float('inf') for node in graph.nodes}
#     predecessors = {node: None for node in graph.nodes}
#     visited = set()

#     # Set the distance to the source node as 0
#     distances[source_node] = 0

#     while len(visited) < len(graph.nodes):
#         # Find the node with the smallest distance that hasn't been visited
#         current_node = min((node for node in graph.nodes if node not in visited), key=lambda node: distances[node])

#         # Mark the current node as visited
#         visited.add(current_node)

#         # Update distances and predecessors for adjacent nodes
#         for neighbor in graph.neighbors(current_node):
#             if neighbor not in visited:
#                 edge_weight = graph[current_node][neighbor]['weight']
#                 bomb_count = graph.nodes[neighbor]['bombs']
#                 total_damage = distances[current_node] + edge_weight + bomb_count

#                 if total_damage < distances[neighbor]:
#                     distances[neighbor] = total_damage
#                     predecessors[neighbor] = current_node

#     return distances, predecessors

# # Example input matrix representing terrorists and their bomb counts
# terrorist_matrix = [
#     [0, 1, 0, 0, 3],
#     [0, 0, 2, 0, 0],
#     [0, 0, 0, 0, 0],
#     [0, 0, 0, 0, 1],
#     [0, 0, 0, 0, 0]
# ]

# # Create a directed graph
# G = nx.DiGraph()

# # Add nodes to the graph with bomb counts as attributes
# num_nodes = len(terrorist_matrix)
# for i in range(num_nodes):
#     G.add_node(i, bombs=terrorist_matrix[i][i])  # Each terrorist's bomb count is taken from the diagonal of the matrix

# # Add edges based on the matrix
# for i in range(num_nodes):
#     for j in range(num_nodes):
#         if terrorist_matrix[i][j] != 0:
#             G.add_edge(i, j, weight=terrorist_matrix[i][j])

# # Run Dijkstra's algorithm to find the safest path considering bomb damage
# source_node = 0
# distances, predecessors = dijkstra_safest_path(G, source_node)

# # Print safest paths from the source node
# print("Safest paths from node", source_node)
# for node, distance in distances.items():
#     print("Node:", node, "Safest Distance:", distance)

# # Draw the graph
# pos = nx.spring_layout(G)  # positions for all nodes
# nx.draw(G, pos, with_labels=True, node_size=1000, node_color="lightblue", font_size=10, font_weight="bold")
# edge_labels = {(i, j): w['weight'] for i, j, w in G.edges(data=True)}
# nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels, font_color='red')

# plt.show()