document.addEventListener('DOMContentLoaded', () => {
    // State
    const state = {
        n: 5,
        mode: 'start', // 'start', 'end', 'obstacle'
        start: null, // [x, y]
        end: null, // [x, y]
        obstacles: [], // array of [x, y]
        policy: null, // matrix of string directions
        values: null, // matrix of numbers
        path: [] // array of [x, y] for the optimal path
    };

    // DOM Elements
    const gridContainer = document.getElementById('grid-container');
    const sizeSlider = document.getElementById('grid-size');
    const sizeVal = document.getElementById('grid-size-val');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const obsCount = document.getElementById('obs-count');
    const obsMax = document.getElementById('obs-max');

    const btnRandomPolicy = document.getElementById('btn-random-policy');
    const btnEvalRandom = document.getElementById('btn-eval-random');
    const btnValueIter = document.getElementById('btn-value-iter');
    const btnReset = document.getElementById('btn-reset');

    // Initialization
    function init() {
        renderGrid();
        updateConstraintsInfo();

        // Listeners
        sizeSlider.addEventListener('input', (e) => {
            state.n = parseInt(e.target.value);
            sizeVal.textContent = `${state.n}x${state.n}`;
            resetGridState();
            renderGrid();
        });

        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.mode = btn.dataset.mode;
            });
        });

        btnReset.addEventListener('click', () => {
            resetGridState();
            renderGrid();
        });

        btnRandomPolicy.addEventListener('click', generateRandomPolicy);
        btnEvalRandom.addEventListener('click', evaluateRandomPolicy);
        btnValueIter.addEventListener('click', runValueIteration);
    }

    function resetGridState() {
        state.start = null;
        state.end = null;
        state.obstacles = [];
        state.policy = null;
        state.values = null;
        state.path = [];
        updateConstraintsInfo();
    }

    function updateConstraintsInfo() {
        obsCount.textContent = state.obstacles.length;
        obsMax.textContent = state.n - 2;
    }

    function renderGrid() {
        gridContainer.style.gridTemplateColumns = `repeat(${state.n}, 1fr)`;
        gridContainer.innerHTML = '';

        for (let y = 0; y < state.n; y++) {
            for (let x = 0; x < state.n; x++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;

                // Set classes based on state
                if (isSamePos(state.start, [x, y])) cell.classList.add('start');
                else if (isSamePos(state.end, [x, y])) cell.classList.add('end');
                else if (isObstacle([x, y])) cell.classList.add('obstacle');
                else if (state.path.some(p => isSamePos(p, [x, y]))) cell.classList.add('optimal-path');

                // Render Policy/Value if exists
                if (state.policy && state.policy[y][x]) {
                    const dir = state.policy[y][x];
                    if (dir !== "GOAL" && dir !== "") {
                        const icon = document.createElement('i');
                        // FontAwesome arrow classes: fa-arrow-up, fa-arrow-down, fa-arrow-left, fa-arrow-right
                        icon.className = `fa-solid fa-arrow-${dir.toLowerCase()} policy-arrow`;
                        cell.appendChild(icon);
                    }
                }

                if (state.values && state.values[y][x] !== undefined) {
                    // Only show value if not obstacle/goal? 
                    // To follow standard, usually 0 is shown on goal, but let's just show it if it exists
                    if (!isSamePos(state.end, [x, y]) && !isObstacle([x, y])) {
                        const val = document.createElement('div');
                        val.className = 'state-value';
                        val.textContent = state.values[y][x].toFixed(2);
                        cell.appendChild(val);
                    }
                }

                cell.addEventListener('click', () => handleCellClick(x, y));
                gridContainer.appendChild(cell);
            }
        }
    }

    function handleCellClick(x, y) {
        const pos = [x, y];
        console.log(`Clicked ${x}, ${y} in mode ${state.mode}`);

        // Clear value/policy on interaction
        state.policy = null;
        state.values = null;
        state.path = [];

        if (state.mode === 'start') {
            if (isSamePos(state.end, pos)) state.end = null;
            removeObstacle(pos);
            state.start = isSamePos(state.start, pos) ? null : pos;
        } else if (state.mode === 'end') {
            if (isSamePos(state.start, pos)) state.start = null;
            removeObstacle(pos);
            state.end = isSamePos(state.end, pos) ? null : pos;
        } else if (state.mode === 'obstacle') {
            if (isSamePos(state.start, pos)) state.start = null;
            if (isSamePos(state.end, pos)) state.end = null;

            if (isObstacle(pos)) {
                removeObstacle(pos);
            } else {
                if (state.obstacles.length < state.n - 2) {
                    state.obstacles.push(pos);
                } else {
                    alert(`Maximum obstacles (${state.n - 2}) reached for this grid size.`);
                }
            }
        }

        updateConstraintsInfo();
        renderGrid();
    }

    // API Calls
    async function generateRandomPolicy() {
        if (!state.end) return alert("Please set a goal state first!");

        const res = await fetch('/api/random_policy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                n: state.n,
                start: state.start,
                end: state.end,
                obstacles: state.obstacles
            })
        });
        const data = await res.json();
        state.policy = data.policy;
        state.values = null; // clear old values
        state.path = [];
        renderGrid();
    }

    async function evaluateRandomPolicy() {
        if (!state.policy) return alert("Please generate a random policy first!");

        const res = await fetch('/api/evaluate_random', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                n: state.n,
                start: state.start,
                end: state.end,
                obstacles: state.obstacles,
                policy: state.policy
            })
        });
        const data = await res.json();
        state.values = data.values;
        state.path = [];
        renderGrid();
        animateValueUpdates();
    }

    async function runValueIteration() {
        if (!state.end) return alert("Please set a goal state first!");
        // Optional: show a loading state

        const res = await fetch('/api/value_iteration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                n: state.n,
                start: state.start,
                end: state.end,
                obstacles: state.obstacles
            })
        });
        const data = await res.json();
        state.policy = data.policy;
        state.values = data.values;
        traceOptimalPath();
        renderGrid();
        animateValueUpdates();
    }

    // Helpers
    function isSamePos(p1, p2) {
        if (!p1 || !p2) return false;
        return p1[0] === p2[0] && p1[1] === p2[1];
    }

    function isObstacle(pos) {
        return state.obstacles.some(o => isSamePos(o, pos));
    }

    function removeObstacle(pos) {
        state.obstacles = state.obstacles.filter(o => !isSamePos(o, pos));
    }

    function traceOptimalPath() {
        state.path = [];
        if (!state.start || !state.end || !state.policy) return;

        let current = [...state.start];
        const visited = new Set();

        while (!isSamePos(current, state.end)) {
            const [x, y] = current;
            const key = `${x},${y}`;

            if (visited.has(key)) break; // loop detected
            visited.add(key);

            if (!isSamePos(current, state.start)) {
                state.path.push([...current]);
            }

            const action = state.policy[y][x];
            if (action === "UP") current[1] -= 1;
            else if (action === "DOWN") current[1] += 1;
            else if (action === "LEFT") current[0] -= 1;
            else if (action === "RIGHT") current[0] += 1;
            else break; // No valid action or goal reached

            // bounds check
            if (current[0] < 0 || current[0] >= state.n || current[1] < 0 || current[1] >= state.n) break;
            if (isObstacle(current)) break;
        }
    }

    function animateValueUpdates() {
        const cells = document.querySelectorAll('.grid-cell:not(.obstacle):not(.start):not(.end)');
        cells.forEach((cell, i) => {
            setTimeout(() => {
                cell.classList.add('value-updated');
                setTimeout(() => cell.classList.remove('value-updated'), 500);
            }, i * 30); // staggered animation
        });
    }

    // Start
    init();
});
