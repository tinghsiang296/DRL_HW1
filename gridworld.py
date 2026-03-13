import numpy as np
import random

ACTIONS = [(0, -1), (0, 1), (-1, 0), (1, 0)]  # UP, DOWN, LEFT, RIGHT
ACTION_NAMES = ['UP', 'DOWN', 'LEFT', 'RIGHT']

class GridWorld:
    def __init__(self, n, start, end, obstacles, discount=0.9):
        self.n = n
        self.start = tuple(start) if start else None
        self.end = tuple(end) if end else None
        self.obstacles = set(tuple(obs) for obs in obstacles)
        self.discount = discount
        self.V = np.zeros((n, n))
        self.policy = np.zeros((n, n), dtype=int)

    def is_valid(self, state):
        x, y = state
        if x < 0 or x >= self.n or y < 0 or y >= self.n:
            return False
        if state in self.obstacles:
            return False
        return True

    def get_reward(self, state):
        if state == self.end:
            return 20.0
        return -0.5

    def get_transitions(self, state, action):
        """Deterministic environment"""
        x, y = state
        dx, dy = ACTIONS[action]
        next_state = (x + dx, y + dy)
        
        if not self.is_valid(next_state):
            next_state = state # stay in same cell
            
        return next_state, 1.0

    def generate_random_policy(self):
        policy_strs = []
        for y in range(self.n):
            row = []
            for x in range(self.n):
                state = (x, y)
                if state == self.end:
                    row.append("GOAL")
                elif state in self.obstacles:
                    row.append("")
                else:
                    action_idx = random.choice([0, 1, 2, 3])
                    self.policy[y, x] = action_idx
                    row.append(ACTION_NAMES[action_idx])
            policy_strs.append(row)
        return policy_strs

    def evaluate_policy(self, theta=0.0001):
        """Policy evaluation for the current policy."""
        while True:
            delta = 0
            new_V = np.copy(self.V)
            for y in range(self.n):
                for x in range(self.n):
                    state = (x, y)
                    if state == self.end or state in self.obstacles:
                        continue
                        
                    action = self.policy[y, x]
                    next_state, prob = self.get_transitions(state, int(action))
                    nx, ny = next_state
                    reward = self.get_reward(next_state)
                    
                    new_val = prob * (reward + self.discount * self.V[ny, nx])
                    new_V[y, x] = new_val
                    delta = max(delta, abs(self.V[y, x] - new_val))
            
            self.V = new_V
            if delta < theta:
                break
                
        return self.V.tolist()

    def value_iteration(self, theta=0.0001):
        """Value Iteration to find optimal policy."""
        while True:
            delta = 0
            new_V = np.copy(self.V)
            for y in range(self.n):
                for x in range(self.n):
                    state = (x, y)
                    if state == self.end or state in self.obstacles:
                        continue
                        
                    action_values = []
                    for action in range(len(ACTIONS)):
                        next_state, prob = self.get_transitions(state, action)
                        nx, ny = next_state
                        reward = self.get_reward(next_state)
                        val = prob * (reward + self.discount * self.V[ny, nx])
                        action_values.append(val)
                        
                    best_value = max(action_values)
                    new_V[y, x] = best_value
                    delta = max(delta, abs(self.V[y, x] - best_value))
                    
            self.V = new_V
            if delta < theta:
                break
                
        # Extract optimal policy
        policy_strs = []
        for y in range(self.n):
            row = []
            for x in range(self.n):
                state = (x, y)
                if state == self.end:
                    row.append("GOAL")
                    continue
                elif state in self.obstacles:
                    row.append("")
                    continue
                    
                action_values = []
                for action in range(len(ACTIONS)):
                    next_state, prob = self.get_transitions(state, action)
                    nx, ny = next_state
                    reward = self.get_reward(next_state)
                    val = prob * (reward + self.discount * self.V[ny, nx])
                    action_values.append(val)
                    
                best_action = np.argmax(action_values)
                self.policy[y, x] = best_action
                row.append(ACTION_NAMES[best_action])
            policy_strs.append(row)
                
        return self.V.tolist(), policy_strs
