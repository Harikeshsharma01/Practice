import random

def find_chicken_weight(chickens, target_weight):
    left, right = 0, len(chickens) - 1

    while left <= right:
        mid = (left + right) // 2
        if chickens[mid] == target_weight:
            return f"Found chicken with weight {target_weight} at index {mid}"
        elif chickens[mid] < target_weight:
            left = mid + 1
        else:
            right = mid - 1

    return "Chicken with specified weight not found"

import random

# Generating a list of chicken weights ranging from 1 to 60
chickens_weights = sorted([random.uniform(1, 60) for _ in range(50)])

target_weight = 3.2
chickens_weights.append(target_weight)  # Ensure specified weight is present
chickens_weights.sort()

result = find_chicken_weight(chickens_weights, target_weight)

print("List of chicken weights:", chickens_weights)
print(result)