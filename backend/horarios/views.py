from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from firebase_config import db, initialize_firebase
initialize_firebase()
from google.cloud.exceptions import GoogleCloudError
from google.cloud.firestore_v1 import ArrayUnion




class HorarioView(APIView):
    def post(self, request):
        data = request.data
        nombre = data.get("nombre")
        horarios = data.get("horarios")

        if not nombre or not horarios:
            return Response({"error": "Faltan datos requeridos."}, status=status.HTTP_400_BAD_REQUEST)

        if len(horarios) != 2:
            return Response({"error": "El array 'horarios' debe contener ingreso y egreso."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            doc_ref = db.collection("Horarios").document(nombre)
            doc_snapshot = doc_ref.get()

            if doc_snapshot.exists:
                return Response(
                    {"error": f"El horario con nombre '{nombre}' ya existe, seleccione otro."},
                    status=status.HTTP_409_CONFLICT  # Código HTTP 409: conflicto
                )

            # Si no existe, crear el documento
            doc_ref.set({
                "horarios": horarios
            })

            return Response({"mensaje": "Horario guardado correctamente."}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": f"No se pudo guardar el horario: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request, zona):
        doc_ref = db.collection("Horarios").document(zona)
        doc = doc_ref.get()

        if not doc.exists:
            return Response({"error": "Zona no encontrada."}, status=status.HTTP_404_NOT_FOUND)

        return Response(doc.to_dict(), status=status.HTTP_200_OK)

    def put(self, request, zona):
        data = request.data
        bloques = data.get("bloques")

        if not bloques:
            return Response({"error": "Faltan datos requeridos."}, status=status.HTTP_400_BAD_REQUEST)

        doc_ref = db.collection("Horarios").document(zona)
        
        if not doc_ref.get().exists:
            return Response({"error": "Zona no encontrada."}, status=status.HTTP_404_NOT_FOUND)

        doc_ref.update({
            "bloques": bloques
        })

        return Response({"mensaje": "Horario actualizado correctamente."}, status=status.HTTP_200_OK)

    def delete(self, request, nombre):
        dia = request.data.get("dia")
        ingreso = request.data.get("ingreso")
        egreso = request.data.get("egreso")

        if not dia or not ingreso or not egreso:
            return Response({"error": "Se requieren 'dia', 'ingreso' y 'egreso' para eliminar."},
                            status=status.HTTP_400_BAD_REQUEST)

        doc_ref = db.collection("Horarios").document(nombre)
        doc = doc_ref.get()

        if not doc.exists:
            return Response({"error": "Horario no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        data = doc.to_dict()
        dias = data.get("dias", [])
        horarios = data.get("horarios", [])

        # Verificar si el día está en la lista y los horarios coinciden
        if dia not in dias:
            return Response({"error": f"El día '{dia}' no existe en el horario."}, status=status.HTTP_400_BAD_REQUEST)

        if f"{ingreso} - {egreso}" != f"{horarios[0]} - {horarios[1]}":
            return Response({"error": "Los horarios no coinciden con los registrados."}, status=status.HTTP_400_BAD_REQUEST)

        # Eliminar el día
        dias.remove(dia)

        # Si no quedan días, eliminar el documento completo
        if not dias:
            doc_ref.delete()
            return Response({"mensaje": "Día eliminado. No quedaban días, se eliminó el horario completo."},
                            status=status.HTTP_200_OK)
        
        # Actualizar documento con días restantes
        doc_ref.update({"dias": dias})
        return Response({"mensaje": f"Día '{dia}' eliminado del horario '{nombre}'."},
                        status=status.HTTP_200_OK)

class ListaHorariosView(APIView):
    def get(self, request):
        try:
            coleccion = db.collection("Horarios")
            docs = coleccion.stream()
            resultado = []

            for doc in docs:
                data = doc.to_dict()
                resultado.append({
                    "nombre": doc.id,  # El ID es el nombre del bloque
                    "zona": data.get("zona", ""),
                    "horario": f'{data.get("horarios", ["", ""])[0]} - {data.get("horarios", ["", ""])[1]}'
                })

            return Response(resultado, status=status.HTTP_200_OK)

        except GoogleCloudError as e:
            return Response({"error": f"Error al obtener los horarios: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
