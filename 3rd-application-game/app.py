from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__)

# Initialize game state
game_state = {
    "board": [""] * 9,  # 3x3 board as a flat list
    "current_player": "X",
    "winner": None,
    "game_over": False
}

def check_winner(board):
    # Winning combinations: rows, columns, diagonals
    wins = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  # Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  # Columns
        [0, 4, 8], [2, 4, 6]              # Diagonals
    ]
    for win in wins:
        if board[win[0]] == board[win[1]] == board[win[2]] != "":
            return board[win[0]]
    if "" not in board:
        return "Draw"
    return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/move', methods=['POST'])
def move():
    global game_state
    data = request.get_json()
    index = data['index']

    if game_state['game_over'] or game_state['board'][index] != "":
        return jsonify({"error": "Invalid move"}), 400

    # Update board
    game_state['board'][index] = game_state['current_player']

    # Check for winner
    winner = check_winner(game_state['board'])
    if winner:
        game_state['winner'] = winner
        game_state['game_over'] = True
    else:
        # Switch player
        game_state['current_player'] = "O" if game_state['current_player'] == "X" else "X"

    return jsonify({
        "board": game_state['board'],
        "current_player": game_state['current_player'],
        "winner": game_state['winner'],
        "game_over": game_state['game_over']
    })

@app.route('/reset', methods=['POST'])
def reset():
    global game_state
    game_state = {
        "board": [""] * 9,
        "current_player": "X",
        "winner": None,
        "game_over": False
    }
    return jsonify(game_state)

if __name__ == '__main__':
    app.run(debug=True)