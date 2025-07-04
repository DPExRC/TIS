#!/usr/bin/env bash
set -e  # Detiene el script si hay errores

# Limpia cachés
find . -type d -name "__pycache__" -exec rm -r {} +
rm -rf .pytest_cache/ .mypy_cache/

# Instalación limpia
pip install --upgrade pip
pip install --force-reinstall -r requirements.txt

# Migraciones y estáticos
python manage.py migrate
python manage.py collectstatic --noinput