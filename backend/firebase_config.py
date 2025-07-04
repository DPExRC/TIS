import firebase_admin
from firebase_admin import credentials, firestore
import os
import json
from pathlib import Path
from typing import Optional, Dict, Any
import logging

# Configura logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Variable global para la instancia de Firestore
db = None

def initialize_firebase() -> bool:
    """Inicializa Firebase Admin SDK y configura el cliente de Firestore
    
    Returns:
        bool: True si la inicialización fue exitosa, False en caso contrario
    """
    global db
    
    try:
        # Si ya está inicializado, no hacer nada
        if firebase_admin._apps:
            logger.info("Firebase ya estaba inicializado")
            return True
            
        # Opción 1: Credenciales desde variables de entorno (producción)
        if all(key in os.environ for key in ['FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL']):
            cred_dict = {
                "type": "service_account",
                "project_id": os.getenv('FIREBASE_PROJECT_ID'),
                "private_key": (os.getenv('FIREBASE_PRIVATE_KEY') or '').replace('\\n', '\n'),
                "client_email": os.getenv('FIREBASE_CLIENT_EMAIL'),
                "token_uri": "https://oauth2.googleapis.com/token",
            }
            cred = credentials.Certificate(cred_dict)
        
        # Opción 2: Credenciales desde archivo JSON (desarrollo local)
        else:
            json_path = Path(__file__).parent / 'serviceAccountKey.json'
            if not json_path.exists():
                logger.error("No se encontró archivo serviceAccountKey.json")
                return False
            cred = credentials.Certificate(json_path)

        # Inicialización de Firebase
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        logger.info("✅ Firebase inicializado correctamente")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error inicializando Firebase: {str(e)}")
        db = None
        return False

# Inicialización al importar el módulo
initialize_firebase()