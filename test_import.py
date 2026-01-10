import sys
import os

# Try adding backend to path explicitly relative to this script
current = os.path.dirname(os.path.abspath(__file__))
backend_path = os.path.join(current, 'backend')
sys.path.append(backend_path)

print(f"Added {backend_path} to sys.path")

try:
    from app.core import database
    print(f"Database module: {database}")
    print(f"Database file: {database.__file__}")
    from app.core.database import Base
    print(f"Successfully imported Base: {Base}")
    from app.core.database import engine
    print(f"Successfully imported engine: {engine}")
except ImportError as e:
    print(f"ImportError: {e}")
except Exception as e:
    print(f"Error: {e}")
