from collections import deque
import random

def generate_random_matrix(size, terrorist_prob=0.2):
    matrix = [[0] * size for _ in range(size)]
    bomb_counts = [[0] * size for _ in range(size)]

    for row in range(size):
        for col in range(size):
            if random.random() < terrorist_prob:
                matrix[row][col] = 1  # Set as terrorist location
                bomb_counts[row][col] = random.randint(1, 3)  # Random bomb count between 1 and 3

    return matrix, bomb_counts

def is_valid_move(row, col, matrix):
    return 0 <= row < len(matrix) and 0 <= col < len(matrix[0]) and matrix[row][col] != 1

def bfs_safest_path(matrix, bombs, start, end):
    queue = deque([(start, 0, [start])])  # Updated queue to include the path taken
    visited = set()
    directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]

    while queue:
        current, current_bombs, path = queue.popleft()  # Updated to include the path
        row, col = current

        if current == end:
            return current_bombs, path  # Return the path along with the number of bombs required

        for dr, dc in directions:
            new_row, new_col = row + dr, col + dc
            if is_valid_move(new_row, new_col, matrix) and (new_row, new_col) not in visited:
                visited.add((new_row, new_col))
                new_bombs = current_bombs + bombs[new_row][new_col] if matrix[new_row][new_col] == 1 else current_bombs
                new_path = path + [(new_row, new_col)]  # Update the path with the new position
                queue.append(((new_row, new_col), new_bombs, new_path))

    return -1, []  # Return an empty path if no path is found

# Generate random matrix and bomb counts
size = 6  # Size of the matrix
input_matrix, bomb_counts = generate_random_matrix(size)

# Define the start and end points
start_point = (0, 0)
end_point = (size - 1, size - 1)

# Find the safest path using BFS
safest_bombs, safest_path = bfs_safest_path(input_matrix, bomb_counts, start_point, end_point)

# Print the generated matrix and bomb counts
print("Generated Matrix:")
for row in input_matrix:
    print(row)

print("\nBomb Counts:")
for row in bomb_counts:
    print(row)

if safest_bombs != -1:
    print(f"\nSafest path found with {safest_bombs} bombs:")
    for step in safest_path:
        print(step)
else:
    print("\nNo path found to the destination.")
