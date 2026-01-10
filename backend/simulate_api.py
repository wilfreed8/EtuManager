import requests
import time
import json

BASE_URL = "http://localhost:8000/api"

def simulate_student_addition():
    print("--- Simulation: Ajout d'un nouvel élève ---")
    student_data = {
        "first_name": "Koffi",
        "last_name": "Abalo",
        "birth_date": "2012-05-15",
        "gender": "M",
        "address": "Bè, Lomé",
        "email": "koffi.abalo@example.com",
        "establishment_id": "8ded3123-5e93-4702-861f-9c60e3cc6a34",
        "class_id": "67448d3c-6f81-4b71-97b7-6de7112000ed",
        "academic_year_id": "cd173595-6a56-4c56-978d-6a56cd173595",
        "parent_name": "Abalo Komla",
        "parent_phone": "+228 90 00 11 22"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/students/", json=student_data)
        if response.status_code == 200:
            print("Succès: Élève ajouté avec succès !")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"Échec: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Erreur de connexion: {e}")

def simulate_teacher_assignment():
    print("\n--- Simulation: Assignation d'un enseignant ---")
    assignment_data = {
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "class_id": "class-6b",
        "subject_id": "sub-fr",
        "academic_year_id": "cd173595-6a56-4c56-978d-6a56cd173595"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/teachers/assignments", json=assignment_data)
        if response.status_code == 200:
            print("Succès: Assignation créée !")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"Échec: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Erreur de connexion: {e}")

if __name__ == "__main__":
    print("Démarrage de la simulation d'API...")
    time.sleep(1)
    simulate_student_addition()
    time.sleep(2)
    simulate_teacher_assignment()
    print("\nSimulation terminée.")
