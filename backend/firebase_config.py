import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1 import SERVER_TIMESTAMP  # Importación correcta
import logging
from django.conf import settings
import os

logger = logging.getLogger(__name__)

# Variable global para el cliente de Firestore
_db = None
_initialized = False

def initialize_firebase():
    """
    Inicializa la conexión con Firebase y devuelve el cliente de Firestore.
    """
    global _db, _initialized
    
    if _initialized:
        return _db

    try:
        # Ruta al archivo de credenciales (configurable en settings.py)
        cred_path = getattr(settings, 'FIREBASE_CREDENTIALS_PATH', 
                         os.path.join(os.path.dirname(__file__), 'serviceAccountKey.json'))
        
        # Verificar si el archivo de credenciales existe
        if not os.path.exists(cred_path):
            raise FileNotFoundError(
                f"No se encontró el archivo de credenciales de Firebase en {cred_path}"
            )

        # Inicializar la app de Firebase solo si no existe
        if not firebase_admin._apps:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            logger.info("✅ Firebase inicializado correctamente")
        
        _db = firestore.client()
        _initialized = True
        return _db

    except Exception as e:
        logger.error(f"🔥 Error al inicializar Firebase: {str(e)}")
        raise

# Inicialización automática al importar el módulo
try:
    db = initialize_firebase()
except Exception as e:
    logger.error(f"🔥 Fallo en la inicialización automática: {str(e)}")
    db = None


def get_firestore_client():
    """
    Obtiene el cliente de Firestore (singleton).
    Si no está inicializado, intenta inicializarlo.
    """
    global db
    if db is None:
        db = initialize_firebase()
    return db


def test_connection():
    """
    Función para probar la conexión con Firestore
    """
    try:
        client = get_firestore_client()
        if client is None:
            return False, "Cliente no inicializado"
        
        # Prueba simple de lectura
        test_ref = client.collection('TestConnection').document('test')
        test_ref.set({
            'test': True, 
            'timestamp': SERVER_TIMESTAMP  # Usando la importación correcta
        })
        
        # Prueba de lectura
        doc = test_ref.get()
        if doc.exists:
            return True, "Conexión exitosa"
        return False, "No se pudo verificar la conexión"
    
    except Exception as e:
        return False, str(e)