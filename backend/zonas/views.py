from firebase_admin import auth, firestore
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from firebase_config import db


zonas_ref = db.collection("Zonas")
class ZonaList(APIView):
    def get(self, request):
        
        zonas = [doc.id for doc in zonas_ref.stream()]
        return Response(zonas)

    def post(self, request):
        nombre = request.data.get("nombre")
        if not nombre:
            return Response({"error": "Falta el nombre de la zona."}, status=status.HTTP_400_BAD_REQUEST)
        if zonas_ref.document(nombre).get().exists:
            return Response({"error": "La zona ya existe."}, status=status.HTTP_400_BAD_REQUEST)
        zonas_ref.document(nombre).set({})
        return Response({"message": "Zona creada correctamente."}, status=status.HTTP_201_CREATED)

class ZonaDetail(APIView):
    def delete(self, request, nombre):
        doc = zonas_ref.document(nombre)
        if not doc.get().exists:
            return Response({"error": "Zona no encontrada."}, status=status.HTTP_404_NOT_FOUND)
        doc.delete()
        return Response({"message": "Zona eliminada correctamente."})

    def put(self, request, nombre):
        nuevo_nombre = request.data.get("nuevo_nombre")
        if not nuevo_nombre:
            return Response({"error": "Falta el nuevo nombre."}, status=status.HTTP_400_BAD_REQUEST)
        doc = zonas_ref.document(nombre)
        if not doc.get().exists:
            return Response({"error": "Zona original no encontrada."}, status=status.HTTP_404_NOT_FOUND)
        if zonas_ref.document(nuevo_nombre).get().exists:
            return Response({"error": "Ya existe una zona con ese nuevo nombre."}, status=status.HTTP_400_BAD_REQUEST)
        # Copia y elimina el documento original
        doc_data = doc.get().to_dict()
        zonas_ref.document(nuevo_nombre).set(doc_data or {})
        doc.delete()
        return Response({"message": "Zona renombrada correctamente."})
