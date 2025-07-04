from firebase_admin import auth, firestore
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from firebase_config import db
import logging

logger = logging.getLogger(__name__)

class ZonaList(APIView):
    def get(self, request):
        try:
            if db is None:
                logger.error("Firestore no está inicializado")
                return Response(
                    {"error": "Servicio de base de datos no disponible"},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            zonas_ref = db.collection("Zonas")
            zonas = [doc.id for doc in zonas_ref.stream()]
            return Response(zonas)
            
        except Exception as e:
            logger.error(f"Error al listar zonas: {str(e)}")
            return Response(
                {"error": "Error interno al obtener zonas"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        try:
            if db is None:
                return Response(
                    {"error": "Servicio de base de datos no disponible"},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            nombre = request.data.get("nombre")
            if not nombre:
                return Response(
                    {"error": "Falta el nombre de la zona."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            zonas_ref = db.collection("Zonas")
            if zonas_ref.document(nombre).get().exists:
                return Response(
                    {"error": "La zona ya existe."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            zonas_ref.document(nombre).set({})
            return Response(
                {"message": "Zona creada correctamente."},
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            logger.error(f"Error al crear zona: {str(e)}")
            return Response(
                {"error": "Error interno al crear zona"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ZonaDetail(APIView):
    def delete(self, request, nombre):
        try:
            if db is None:
                return Response(
                    {"error": "Servicio de base de datos no disponible"},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            zonas_ref = db.collection("Zonas")
            doc = zonas_ref.document(nombre)
            
            if not doc.get().exists:
                return Response(
                    {"error": "Zona no encontrada."},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            doc.delete()
            return Response({"message": "Zona eliminada correctamente."})
            
        except Exception as e:
            logger.error(f"Error al eliminar zona: {str(e)}")
            return Response(
                {"error": "Error interno al eliminar zona"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def put(self, request, nombre):
        try:
            if db is None:
                return Response(
                    {"error": "Servicio de base de datos no disponible"},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            nuevo_nombre = request.data.get("nuevo_nombre")
            if not nuevo_nombre:
                return Response(
                    {"error": "Falta el nuevo nombre."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            zonas_ref = db.collection("Zonas")
            doc = zonas_ref.document(nombre)
            
            if not doc.get().exists:
                return Response(
                    {"error": "Zona original no encontrada."},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            if zonas_ref.document(nuevo_nombre).get().exists:
                return Response(
                    {"error": "Ya existe una zona con ese nuevo nombre."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Copia y elimina el documento original
            doc_data = doc.get().to_dict()
            zonas_ref.document(nuevo_nombre).set(doc_data or {})
            doc.delete()
            return Response({"message": "Zona renombrada correctamente."})
            
        except Exception as e:
            logger.error(f"Error al renombrar zona: {str(e)}")
            return Response(
                {"error": "Error interno al renombrar zona"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )