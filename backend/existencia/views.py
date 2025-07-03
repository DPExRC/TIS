from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from firebase_admin import firestore
from datetime import datetime

db = firestore.client()

class ExistenciaView(APIView):
    def get(self, request, id=None):
        try:
            existencias_ref = db.collection('Existencia')
            docs = existencias_ref.stream()
            existencias = [{"id": doc.id, **doc.to_dict()} for doc in docs]
            return Response(existencias, status=status.HTTP_200_OK)
                
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        try:
            data = request.data
            campos_requeridos = [
                'zona',
                'responsable',
                'hora_finalizacion',
                'codigos_escaneados',
                'codigos_validos',
                'codigos_faltantes',
            ]

            # Validar campos obligatorios
            if not all(key in data for key in campos_requeridos):
                return Response(
                    {"error": f"Faltan campos requeridos: {', '.join(campos_requeridos)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Añadir metadatos
            data['fecha_creacion'] = datetime.now()
            data['estado'] = 'activa'

            # Crear documento
            _, doc_ref = db.collection('Existencia').add(data)

            return Response(
                {"id": doc_ref.id, "message": "Existencia registrada correctamente"},
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


    def put(self, request, id):
        try:
            data = request.data
            alerta_ref = db.collection('Existencia').document(id)
            
            if not alerta_ref.get().exists:
                return Response(
                    {"error": "Existencia no encontrada"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            update_data = {}
            campos_actualizables = [
                'zona', 'responsable', 'hora_finalizacion',
                'codigos_escaneados', 'codigos_validos', 'codigos_faltantes',
                'estado'
            ]
            for campo in campos_actualizables:
                if campo in data:
                    update_data[campo] = data[campo]

            # Evaluar si hay alerta o no:
            codigos_faltantes = data.get('codigos_faltantes', [])
            codigos_no_asignados = data.get('codigos_no_asignados', [])
            
            # Si faltan o sobran códigos -> con alerta, sino sin alerta
            con_alerta = True
            if (not codigos_faltantes or len(codigos_faltantes) == 0) and \
            (not codigos_no_asignados or len(codigos_no_asignados) == 0):
                con_alerta = False
            
            update_data['con_alerta'] = con_alerta
            update_data['fecha_actualizacion'] = datetime.now()

            alerta_ref.update(update_data)

            return Response(
                {"message": "Existencia actualizada exitosamente"},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


    def delete(self, request, id):
        try:
            existencia_ref = db.collection('Existencia').document(id)
            
            if not existencia_ref.get().exists:
                return Response(
                    {"error": "Alerta no encontrada"}, 
                    status=status.HTTP_404_NOT_FOUND
                )

            existencia_ref.delete()

            return Response(
                {"message": "Existencia eliminada exitosamente"},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
