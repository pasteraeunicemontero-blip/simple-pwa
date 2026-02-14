from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import os

app = Flask(__name__, static_folder=os.getcwd(), static_url_path='')
# Enable CORS for all routes
CORS(app, supports_credentials=True)

# Serve static files
@app.route('/')
def serve_index():
    return send_from_directory(os.getcwd(), 'index.html')

# Catch-all for static files
@app.route('/<path:filename>')
def serve_static(filename):
    try:
        return send_from_directory(os.getcwd(), filename)
    except:
        return jsonify({'error': 'File not found'}), 404

# Database config
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'todo_db'
}

def get_db():
    """Get database connection"""
    try:
        conn = mysql.connector.connect(**db_config)
        return conn
    except Error as e:
        print(f"Error: {e}")
        return None

# GET all todos
@app.route('/api/todos', methods=['GET'])
def get_todos():
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, text, completed FROM todos ORDER BY id DESC")
    todos = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(todos)

# ADD new todo
@app.route('/api/todos', methods=['POST'])
def add_todo():
    data = request.json
    text = data.get('text', '').strip()
    
    if not text:
        return jsonify({'error': 'Task cannot be empty'}), 400
    
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor()
    cursor.execute("INSERT INTO todos (text, completed) VALUES (%s, %s)", (text, False))
    conn.commit()
    new_id = cursor.lastrowid
    cursor.close()
    conn.close()
    
    return jsonify({'id': new_id, 'text': text, 'completed': False}), 201

# DELETE todo
@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor()
    cursor.execute("DELETE FROM todos WHERE id = %s", (todo_id,))
    conn.commit()
    cursor.close()
    conn.close()
    
    return jsonify({'success': True}), 200

# UPDATE todo (toggle completed)
@app.route('/api/todos/<int:todo_id>', methods=['PATCH'])
def update_todo(todo_id):
    data = request.json
    completed = data.get('completed', False)
    text = data.get('text')
    
    conn = get_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor()
    if text:
        cursor.execute("UPDATE todos SET text = %s, completed = %s WHERE id = %s", (text, completed, todo_id))
    else:
        cursor.execute("UPDATE todos SET completed = %s WHERE id = %s", (completed, todo_id))
    conn.commit()
    cursor.close()
    conn.close()
    
    return jsonify({'success': True}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)