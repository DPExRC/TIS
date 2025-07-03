from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from firebase_admin import firestore
from datetime import datetime

db = firestore.client()

class AsignarHorarioView(APIView):
    def post(self, request):
        data = request.data

        zona = data.get("zona")
        horario = data.get("horario")
        dias = data.get("dias", [])
        codigos = data.get("codigos", [])
        especie = data.get("especie", "")
        animal = data.get("animal", "")
        codigo_asignacion = data.get("codigo_asignacion")  # Aquí se recoge el ID generado

        if not zona or not horario or not dias or not codigo_asignacion:
            return Response({"error": "Faltan campos obligatorios."}, status=status.HTTP_400_BAD_REQUEST)

        doc_data = {
            "zona": zona,
            "horario": horario,
            "dias": dias,
            "codigos": codigos,
            "especie": especie,
            "animal": animal,
            "codigo_asignacion": codigo_asignacion,  # Aquí se guarda
            "fecha_asignacion": datetime.utcnow()
        }

        try:
            db.collection("AsignarHorarios").add(doc_data)
            return Response({"mensaje": "Horario asignado correctamente."}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": f"Error al guardar: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request):
        try:
            docs = db.collection("AsignarHorarios").stream()
            resultados = []

            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                resultados.append(data)

            return Response(resultados, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Error al obtener datos: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
