import sys
import os
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker

# setup path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from app.core.database import SQLALCHEMY_DATABASE_URL
    from app.models import db_models
except ImportError as e:
    print(f"ImportError: {e}")
    sys.exit(1)

def verify():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    student_count = db.query(func.count(db_models.Student.id)).scalar()
    school_count = db.query(func.count(db_models.Establishment.id)).scalar()
    
    print(f"Schools: {school_count}")
    print(f"Students: {student_count}")
    
    if student_count >= 2000:
        print("VERIFICATION SUCCESS")
    else:
        print("VERIFICATION FAILED: Not enough students")

if __name__ == "__main__":
    verify()
