import heapq

# Define the matrix with terrorists and their damage
matrix = [
    [0, 1, 0, 0, 0],
    [0, 0, 1, 1, 0],
    [0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0],
    [1, 1, 0, 1, 0]
]

# Define the damage caused by terrorists
damage = [
    [0, 10, 0, 0, 0],
    [0, 0, 10, 10, 0],
    [0, 0, 0, 0, 10],
    [10, 0, 10, 0, 0],
    [10, 10, 0, 10, 0]
]

# Define directions (right and down)
directions = [(1, 0), (0, 1)]

def dijkstra(matrix, damage):
    n = len(matrix)
    distances = [[float('inf')] * n for _ in range(n)]
    distances[0][0] = 0
    prev = [[None] * n for _ in range(n)]
    heap = [(0, 0, 0)]  # (distance, x, y)
    
    while heap:
        dist, x, y = heapq.heappop(heap)
        if x == n - 1 and y == n - 1:  # reached destination
            path = []
            while x is not None and y is not None:
                path.append((x, y))
                x, y = prev[x][y] if prev[x][y] is not None else (None, None)
            return dist, path[::-1]
        
        for dx, dy in directions:
            nx, ny = x + dx, y + dy
            if 0 <= nx < n and 0 <= ny < n:
                if matrix[nx][ny] == 0:  # no terrorist
                    new_dist = dist + damage[nx][ny]
                    if new_dist < distances[nx][ny]:
                        distances[nx][ny] = new_dist
                        heapq.heappush(heap, (new_dist, nx, ny))
                        prev[nx][ny] = (x, y)
    return -1, []  # no path found

shortest_path_damage, shortest_path = dijkstra(matrix, damage)
print("Minimum damage to reach (5, 5):", shortest_path_damage)
print("Shortest path:", shortest_path)