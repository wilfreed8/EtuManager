import pandas as pd
import io
from typing import List, Dict

class CSVParser:
    @staticmethod
    def parse_grades_csv(file_content: bytes) -> List[Dict]:
        """
        Parses a CSV file containing student grades.
        Expected columns: matricule, name, interro, devoir, compo
        """
        df = pd.read_csv(io.BytesIO(file_content))
        
        # Basic validation
        required_columns = ['matricule', 'name', 'interro', 'devoir', 'compo']
        for col in required_columns:
            if col not in df.columns:
                raise ValueError(f"Missing required column: {col}")
        
        # Clean data (replace NaN with 0 or empty string)
        df = df.fillna(0)
        
        return df.to_dict('records')

    @staticmethod
    def validate_grade(value):
        try:
            val = float(value)
            if 0 <= val <= 20:
                return val
            return 0
        except (ValueError, TypeError):
            return 0
