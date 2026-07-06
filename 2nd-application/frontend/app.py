from flask import Flask, request, render_template_string
from pymongo import MongoClient

app = Flask(__name__)

# Connect to the MongoDB container running on localhost
client = MongoClient("mongodb://localhost:27017/")
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
    # Capture user input from the form
    user_name = request.form.get('name')
    user_role = request.form.get('role')
    
    # Create a document and insert it into MongoDB
    user_document = {
        "name": user_name,
        "role": user_role
    }
    collection.insert_one(user_document)
    
    success_message = f"Successfully added {user_name} to the database!"
    return render_template_string(HTML_FORM, message=success_message)

if __name__ == '__main__':
    # Run the Flask app on port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)