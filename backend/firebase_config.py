import firebase_admin
from firebase_admin import credentials, firestore

# Inicializa Firebase Admin SDK con las credenciales del archivo JSON
cred = credentials.Certificate("./serviceAccountKey.json")


firebase_admin.initialize_app(cred)

# Obtén una referencia al servicio de Firestore
db = firestore.client()


