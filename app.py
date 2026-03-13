from flask import Flask, render_template, request, jsonify
from gridworld import GridWorld

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/random_policy', methods=['POST'])
def random_policy():
    data = request.json
    n = data.get('n', 5)
    start = data.get('start')
    end = data.get('end')
    obstacles = data.get('obstacles', [])
    
    gw = GridWorld(n, start, end, obstacles)
    policy = gw.generate_random_policy()
    
    return jsonify({'policy': policy})

@app.route('/api/evaluate_random', methods=['POST'])
def evaluate_random():
    data = request.json
    n = data.get('n', 5)
    start = data.get('start')
    end = data.get('end')
    obstacles = data.get('obstacles', [])
    policy_names = data.get('policy', []) # List of lists of strings
    
    gw = GridWorld(n, start, end, obstacles)
    
    # Set the policy from names
    action_map = {'UP': 0, 'DOWN': 1, 'LEFT': 2, 'RIGHT': 3}
    for y in range(n):
        for x in range(n):
            if policy_names[y][x] and policy_names[y][x] != "GOAL":
                gw.policy[y, x] = action_map.get(policy_names[y][x], 0)
                
    values = gw.evaluate_policy()
    
    return jsonify({'values': values})

@app.route('/api/value_iteration', methods=['POST'])
def value_iteration_api():
    data = request.json
    n = data.get('n', 5)
    start = data.get('start')
    end = data.get('end')
    obstacles = data.get('obstacles', [])
    
    gw = GridWorld(n, start, end, obstacles)
    values, optimal_policy = gw.value_iteration()
    
    return jsonify({'values': values, 'policy': optimal_policy})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
