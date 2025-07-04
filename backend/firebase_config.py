import firebase_admin
from firebase_admin import credentials, firestore
import os
import json
from pathlib import Path
from typing import Optional, Dict, Any
import logging

# Configuración básica de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_firebase_config() -> Optional[Dict[str, Any]]:
    """Obtiene la configuración de Firebase desde variables de entorno o archivo JSON
    
    Returns:
        Optional[Dict]: Configuración de Firebase o None si no se encuentra
    """
    try:
        # Intenta desde variables de entorno (producción)
        config = {
            "type": "service_account",
            "project_id": os.getenv('FIREBASE_PROJECT_ID'),
            "private_key": os.getenv('FIREBASE_PRIVATE_KEY', '').replace('\\n', '\n'),
            "client_email": os.getenv('FIREBASE_CLIENT_EMAIL'),
            "token_uri": "https://oauth2.googleapis.com/token",
        }
        
        if all(config.values()):  # Verifica que ningún valor sea None o vacío
            return config
        
        # Intenta desde archivo JSON (desarrollo)
        json_path = Path(__file__).parent / 'serviceAccountKey.json'
        if json_path.exists():
            with open(json_path, 'r', encoding='utf-8') as f:
                return json.load(f)
                
    except json.JSONDecodeError as e:
        logger.error(f"Error decodificando JSON: {e}")
    except Exception as e:
        logger.error(f"Error inesperado: {e}")
    
    return None

def init_firestore():
    """Inicializa y retorna un cliente de Firestore con manejo de errores
    
    Returns:
        firestore.Client: Cliente de Firestore inicializado
    Raises:
        RuntimeError: Si hay errores en la inicialización
    """
    try:
        cred_config = get_firebase_config()
        if not cred_config:
            raise RuntimeError("No se encontró configuración para Firebase")
        
        # Verificación adicional de credenciales
        if not all([cred_config.get('project_id'), cred_config.get('private_key'), cred_config.get('client_email')]):
            raise ValueError("Credenciales de Firebase incompletas")
        
        # Inicialización de Firebase
        if not firebase_admin._apps:
            cred = credentials.Certificate(cred_config)
            firebase_admin.initialize_app(cred)
        
        return firestore.client()
        
    except ValueError as e:
        logger.error(f"Error en credenciales: {e}")
        raise RuntimeError("Credenciales de Firebase inválidas") from e
    except Exception as e:
        logger.error(f"Error inicializando Firestore: {e}")
        raise RuntimeError(f"No se pudo inicializar Firestore: {e}") from e

# Inicialización segura
try:
    db = init_firestore()
    logger.info("Firestore inicializado correctamente")
except RuntimeError as e:
    logger.critical(f"Error crítico al inicializar Firestore: {e}")
    db = None