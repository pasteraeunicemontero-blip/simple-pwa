import mysql.connector
from mysql.connector import Error

# Database config
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': ''
}

try:
    # Connect to MySQL
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    
    # Create database
    cursor.execute("CREATE DATABASE IF NOT EXISTS todo_db")
    print("✓ Database created")
    
    # Use database
    cursor.execute("USE todo_db")
    
    # Create todos table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS todos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            text VARCHAR(255) NOT NULL,
            completed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("✓ Table created")
    
    conn.commit()
    cursor.close()
    conn.close()
    print("\n✓ Database initialized successfully!")
    
except Error as e:
    print(f"Error: {e}")