from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from firebase_config import db, initialize_firebase
initialize_firebase()
from datetime import datetime


class AlertasView(APIView):
    def get(self, request, id=None):
        try:
            alertas_ref = db.collection('Alertas')
            docs = alertas_ref.stream()
            alertas = [{"id": doc.id, **doc.to_dict()} for doc in docs]
            return Response(alertas, status=status.HTTP_200_OK)
                
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        try:
            data = request.data
            required_fields = [
                'codigo_asignacion',
                'tipo',
                'zona',
                'responsable',
                'hora_finalizacion',
                'codigos_validos',
                'codigos_escaneados',
                'codigos_faltantes',
                'codigos_sobrantes',
                'dias',
                'horario',
                'estado'
            ]
            missing_fields = [f for f in required_fields if f not in data]
            if missing_fields:
                return Response(
                    {"error": f"Faltan campos requeridos: {', '.join(missing_fields)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Creamos campo compuesto único
            unique_key = f"{data['codigo_asignacion']}_{data['tipo']}"
            data['unique_key'] = unique_key

            alertas_ref = db.collection('Alertas')
            query = alertas_ref.where('unique_key', '==', unique_key).limit(1)
            docs = list(query.stream())

            if docs:
                return Response(
                    {"error": "Alerta ya existe para este codigo_asignacion y tipo"},
                    status=status.HTTP_409_CONFLICT
                )

            data['fecha_creacion'] = datetime.now()
            data['fecha_actualizacion'] = datetime.now()
            data['con_alerta'] = True if (data.get('codigos_faltantes') and len(data['codigos_faltantes']) > 0) else False

            _, doc_ref = alertas_ref.add(data)

            return Response(
                {"id": doc_ref.id, "message": "Alerta registrada correctamente"},
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
            alerta_ref = db.collection('Alertas').document(id)
            
            if not alerta_ref.get().exists:
                return Response(
                    {"error": "Alerta no encontrada"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            update_data = {}
            updatable_fields = [
                'zona',
                'responsable',
                'hora_finalizacion',
                'codigos_validos',
                'codigos_escaneados',
                'codigos_faltantes',
                'codigos_sobrantes',
                'estado'
            ]
            for field in updatable_fields:
                if field in data:
                    update_data[field] = data[field]

            codigos_faltantes = data.get('codigos_faltantes', [])
            update_data['con_alerta'] = len(codigos_faltantes) > 0
            update_data['fecha_actualizacion'] = datetime.now()

            alerta_ref.update(update_data)

            return Response(
                {"message": "Alerta actualizada exitosamente"},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, id):
        try:
            alerta_ref = db.collection('Alertas').document(id)
            
            if not alerta_ref.get().exists:
                return Response(
                    {"error": "Alerta no encontrada"}, 
                    status=status.HTTP_404_NOT_FOUND
                )

            alerta_ref.delete()

            return Response(
                {"message": "Alerta eliminada exitosamente"},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
