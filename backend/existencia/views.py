from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from firebase_config import get_firestore_client
from google.cloud.firestore_v1 import SERVER_TIMESTAMP
from typing import Dict, Any, Union
import logging

logger = logging.getLogger(__name__)


class ExistenciaView(APIView):
    """
    Vista para manejar operaciones CRUD de Existencia en Firestore
    """

    def _get_db(self):
        """Obtiene el cliente de Firestore con manejo de errores"""
        try:
            db = get_firestore_client()
            if db is None:
                raise Exception("No se pudo conectar a Firestore")
            return db
        except Exception as e:
            logger.error(f"Error al obtener cliente Firestore: {str(e)}")
            raise

    def get(self, request, id=None):
        """Obtiene una existencia específica o lista todas las existencias"""
        try:
            db = self._get_db()
            existencias_ref = db.collection('Existencia')

            if id:
                doc = existencias_ref.document(id).get()
                if not doc.exists:
                    return Response(
                        {"error": "Existencia no encontrada"},
                        status=status.HTTP_404_NOT_FOUND
                    )
                return Response({"id": doc.id, **doc.to_dict()})

            docs = existencias_ref.stream()
            existencias = [{"id": doc.id, **doc.to_dict()} for doc in docs]
            return Response(existencias, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error en GET Existencia: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        """Crea una nueva existencia en Firestore"""
        try:
            db = self._get_db()
            data = request.data

            campos_requeridos = [
                'zona',
                'responsable',
                'hora_finalizacion',
                'codigos_escaneados',
                'codigos_validos',
                'codigos_faltantes',
            ]

            if not all(key in data for key in campos_requeridos):
                missing = [key for key in campos_requeridos if key not in data]
                return Response(
                    {"error": f"Faltan campos requeridos: {', '.join(missing)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not isinstance(data.get('codigos_escaneados'), list):
                return Response(
                    {"error": "codigos_escaneados debe ser una lista"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            data.update({
                'fecha_creacion': SERVER_TIMESTAMP,
                'estado': 'activa',
                'fecha_actualizacion': SERVER_TIMESTAMP
            })

            _, doc_ref = db.collection('Existencia').add(data)
            logger.info(f"Nueva existencia creada con ID: {doc_ref.id}")

            return Response(
                {
                    "id": doc_ref.id,
                    "message": "Existencia registrada correctamente"
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            logger.error(f"Error en POST Existencia: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def put(self, request, id):
        """Actualiza una existencia existente"""
        try:
            db = self._get_db()
            data = request.data
            existencia_ref = db.collection('Existencia').document(id)
            doc = existencia_ref.get()

            if not doc.exists:
                return Response(
                    {"error": "Existencia no encontrada"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Tipado explícito para evitar errores con SERVER_TIMESTAMP
            update_data: Dict[str, Any] = {
                'fecha_actualizacion': SERVER_TIMESTAMP
            }

            campos_actualizables = [
                'zona', 'responsable', 'hora_finalizacion',
                'codigos_escaneados', 'codigos_validos', 'codigos_faltantes',
                'estado', 'codigos_no_asignados'
            ]

            for campo in campos_actualizables:
                if campo in data:
                    update_data[campo] = data[campo]

            # Evaluar alerta
            codigos_faltantes = data.get('codigos_faltantes', [])
            codigos_no_asignados = data.get('codigos_no_asignados', [])
            tiene_alerta = bool(codigos_faltantes or codigos_no_asignados)

            update_data['con_alerta'] = tiene_alerta

            existencia_ref.update(update_data)
            logger.info(f"Existencia {id} actualizada")

            return Response(
                {
                    "message": "Existencia actualizada exitosamente",
                    "updated_fields": list(update_data.keys())
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            logger.error(f"Error en PUT Existencia {id}: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, id):
        """Elimina una existencia"""
        try:
            db = self._get_db()
            existencia_ref = db.collection('Existencia').document(id)
            doc = existencia_ref.get()

            if not doc.exists:
                return Response(
                    {"error": "Existencia no encontrada"},
                    status=status.HTTP_404_NOT_FOUND
                )

            deleted_data = doc.to_dict()
            existencia_ref.delete()
            logger.warning(f"Existencia eliminada: {id}")

            return Response(
                {
                    "message": "Existencia eliminada exitosamente",
                    "deleted_id": id
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            logger.error(f"Error al eliminar Existencia {id}: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
