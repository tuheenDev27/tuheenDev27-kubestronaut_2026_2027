import os
from flask import Flask, request, render_template_string
from pymongo import MongoClient

app = Flask(__name__)

# Dynamically pull the MongoDB URI from the environment
# Defaults to localhost for local testing outside of containers
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)

db = client["user_database"]
collection = db["users"]

# Simple HTML form
HTML_FORM = """
<!DOCTYPE html>
<html>
<head><title>Add User</title></head>
<body>
    <h2>Enter User Data</h2>
    <form method="POST" action="/submit">
        <label>Name:</label><br>
        <input type="text" name="name" required><br><br>
        <label>Role:</label><br>
        <input type="text" name="role" required><br><br>
        <input type="submit" value="Submit">
    </form>
    <p>{{ message }}</p>
</body>
</html>
"""

@app.route('/')
def index():
    return render_template_string(HTML_FORM, message="")

@app.route('/submit', methods=['POST'])
def submit():
    user_name = request.form.get('name')
    user_role = request.form.get('role')
    
    user_document = {
        "name": user_name,
        "role": user_role
    }
    
    try:
        collection.insert_one(user_document)
        success_message = f"Successfully added {user_name} to the database!"
    except Exception as e:
        success_message = f"Database error: {e}"
        
    return render_template_string(HTML_FORM, message=success_message)

if __name__ == '__main__':
    # Listen on all network interfaces (0.0.0.0) so traffic can reach the container
    app.run(host='0.0.0.0', port=5000, debug=True)