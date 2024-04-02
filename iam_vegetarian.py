import time

def find_chicken(target_weight, wait_time):
    min_weight = 1.0  
    max_weight = 10.0  
    step = 0.1  

    target_weight = round(target_weight, 1)  # Round to one decimal place

    while min_weight <= max_weight:
        mid_weight = (min_weight + max_weight) / 2.0  
        mid_weight = round(mid_weight, 1)  # Round to one decimal place for comparison
        if mid_weight == target_weight:
            time.sleep(wait_time)  # Simulate waiting time
            return f"Found chicken with weight {target_weight}. Here's your chicken!"
        elif mid_weight < target_weight:
            min_weight = mid_weight + step  
        else:
            max_weight = mid_weight - step  
    return "Chicken not found"


target_weight = float(input("Enter the weight of the chicken you are looking for: "))
wait_time = 5  

result = find_chicken(target_weight, wait_time)
print(result)


'''
use this if sir told to find least amount time to get my order  

import time

class Job:
    def __init__(self, weight, wait_time):
        self.weight = weight
        self.wait_time = wait_time

def find_chicken(target_weight, jobs):
    min_weight = 1.0  # Minimum weight of chicken
    max_weight = 10.0  # Maximum weight of chicken
    step = 0.1  # Interval between chicken weights

    sorted_jobs = sorted(jobs, key=lambda x: x.wait_time)  # Sort jobs based on wait time

    for job in sorted_jobs:
        if job.weight == target_weight:
            time.sleep(job.wait_time)  # Simulate waiting time
            return f"Found chicken with weight {target_weight}. Here's your chicken!"

    while min_weight <= max_weight:
        mid_weight = (min_weight + max_weight) / 2.0  # Calculate the middle weight
        if mid_weight == target_weight:
            return f"Found chicken with weight {target_weight}. Here's your chicken!"
        elif mid_weight < target_weight:
            min_weight = mid_weight + step  # Update minimum weight for the next iteration
        else:
            max_weight = mid_weight - step  # Update maximum weight for the next iteration

    return "Chicken not found"

# Define job sequence with weight and wait time
jobs = [
    Job(weight=5.7, wait_time=5),
    Job(weight=4.5, wait_time=3),
    Job(weight=7.2, wait_time=7),
    Job(weight=3.9, wait_time=4)
]

target_weight = 5.7  # Weight of the desired chicken
result = find_chicken(target_weight, jobs)
print(result)

'''