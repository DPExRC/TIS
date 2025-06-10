import base64
import os
import sys
from pathlib import Path

# Base del proyecto Django
BASE_DIR = Path(__file__).resolve().parent.parent

# Leer variable de entorno con credenciales codificadas en base64
cred_b64 = os.getenv("GOOGLE_CREDENTIALS_BASE64")
if cred_b64 is None:
    print("Error: variable de entorno GOOGLE_CREDENTIALS_BASE64 no está definida", file=sys.stderr)
    sys.exit(1)

try:
    # Decodificar JSON de credenciales
    cred_json = base64.b64decode(cred_b64)
except Exception as e:
    print(f"Error decodificando GOOGLE_CREDENTIALS_BASE64: {e}", file=sys.stderr)
    sys.exit(1)

# Definir ruta para guardar el archivo JSON (una carpeta afuera de BASE_DIR)
cred_path = BASE_DIR.parent / "serviceAccountKey.json"

try:
    # Guardar archivo temporal con credenciales
    with open(cred_path, "wb") as f:
        f.write(cred_json)
except Exception as e:
    print(f"Error escribiendo archivo de credenciales: {e}", file=sys.stderr)
    sys.exit(1)

# Configurar variable de entorno para autenticación Google
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = str(cred_path.resolve())

# --- Resto de settings.py sigue aquí ---

SECRET_KEY = 'django-insecure-t(6cklw_cri)9_u+vf@$=r!aw42e((%xi%lr1a(e7&x%x)#q_8'
DEBUG = False
ALLOWED_HOSTS = [
    "http://localhost:5173",
    "https://tis-ivory.vercel.app",
]

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECRET_KEY="vZqS-E9XOCiEqN2Qa7H40DnqdwJj0lhlIzbhAaT0eDqyDRyg2F7jwleW7a1M_dxgYZhUzcH9a_J0XULdeqlISw"

SECURE_HSTS_SECONDS = 31536000  # 1 año en segundos
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

SECURE_SSL_REDIRECT = True


INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'corsheaders',
    'rest_framework',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.dummy',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',},
]

LANGUAGE_CODE = 'es'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://tis-ivory.vercel.app",
]

CORS_ALLOW_CREDENTIALS = True

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [],
    'DEFAULT_AUTHENTICATION_CLASSES': [],
}
