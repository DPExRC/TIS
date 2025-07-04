import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1 import SERVER_TIMESTAMP
import logging
from django.conf import settings
import os
from pathlib import Path

logger = logging.getLogger(__name__)

_db = None
_initialized = False

def initialize_firebase():
    """
    Inicializa Firebase y devuelve el cliente Firestore.
    Compatible con entornos locales (archivo JSON) y producción (variables de entorno).
    """
    global _db, _initialized

    if _initialized:
        return _db

    try:
        if not firebase_admin._apps:
            # Opción 1: archivo JSON (entorno local)
            cred_path = getattr(settings, 'FIREBASE_CREDENTIALS_PATH',
                                Path(__file__).parent / 'serviceAccountKey.json')

            if os.path.exists(cred_path):
                logger.info("Usando archivo de credenciales local")
                cred = credentials.Certificate(str(cred_path))
            # Opción 2: variables de entorno (producción)
            elif all(k in os.environ for k in ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY']):
                logger.info("Usando variables de entorno para credenciales Firebase")
                cred_dict = {
                    "type": "service_account",
                    "project_id": os.getenv('FIREBASE_PROJECT_ID'),
                    "private_key": (os.getenv('FIREBASE_PRIVATE_KEY') or '').replace('\\n', '\n'),
                    "client_email": os.getenv('FIREBASE_CLIENT_EMAIL'),
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
                cred = credentials.Certificate(cred_dict)
            else:
                raise FileNotFoundError("No se encontró el archivo de credenciales y faltan variables de entorno.")

            firebase_admin.initialize_app(cred)
            logger.info("✅ Firebase inicializado correctamente")

        _db = firestore.client()
        _initialized = True
        return _db

    except Exception as e:
        logger.error(f"🔥 Error al inicializar Firebase: {str(e)}")
        raise


try:
    db = initialize_firebase()
except Exception as e:
    logger.error(f"🔥 Fallo en la inicialización automática: {str(e)}")
    db = None


def get_firestore_client():
    """
    Devuelve el cliente Firestore; si no está disponible, intenta inicializarlo.
    """
    global db
    if db is None:
        db = initialize_firebase()
    return db


def test_connection():
    """
    Prueba la conexión escribiendo y leyendo un documento en la colección 'TestConnection'.
    """
    try:
        client = get_firestore_client()
        if client is None:
            return False, "Cliente no inicializado"

        test_ref = client.collection('TestConnection').document('test')
        test_ref.set({'test': True, 'timestamp': SERVER_TIMESTAMP})
        doc = test_ref.get()
        if doc.exists:
            return True, "Conexión exitosa"
        return False, "No se pudo verificar la conexión"
    except Exception as e:
        return False, str(e)
