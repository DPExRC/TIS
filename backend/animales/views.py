import base64
from io import BytesIO
from datetime import datetime
from barcode import Code128
from barcode.writer import ImageWriter
from google.cloud import firestore
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .serializers import AnimalSerializer

class RegistrarAnimalAPIView(APIView):
    """Endpoint para registrar nuevos animales con generación de código de barras"""

    def post(self, request):
        try:
            data = request.data.copy()
            especie = data.get('especie')
            
            # Validación básica
            if not especie or not isinstance(especie, str) or len(especie.strip()) < 2:
                return Response(
                    {'error': 'Especie requerida (mínimo 2 caracteres)'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Generar código único
            codigo = self.generar_codigo_unico(especie.strip())
            data['codigo'] = codigo

            # Validar y guardar
            serializer = AnimalSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            serializer.save()

            # Generar código de barras
            barcode_base64 = self.generar_codigo_barras_base64(codigo)
            if not barcode_base64:
                raise ValueError("Error al generar código de barras")

            # Preparar respuesta
            response_data = serializer.data
            response_data['barcode_png_base64'] = barcode_base64

            return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def generar_codigo_unico(self, especie):
        """Genera un código único basado en la especie"""
        db = firestore.Client()
        coleccion = db.collection('RegistroAnimales')

        # Consulta optimizada
        docs = coleccion.where('especie', '==', especie).select(['codigo']).stream()

        numeros = []
        for doc in docs:
            codigo = doc.id
            try:
                numero = int(codigo.split('-')[1])
                numeros.append(numero)
            except (IndexError, ValueError):
                continue

        nuevo_num = (max(numeros) + 1) if numeros else 1
        return f"{especie[:2].upper()}-{nuevo_num:03d}"

    def generar_codigo_barras_base64(self, codigo):
        """Genera código de barras en base64"""
        try:
            # Validar código
            if not codigo or not isinstance(codigo, str):
                raise ValueError("Código inválido para generación de código de barras")

            buffer = BytesIO()
            
            # Configuración del código de barras - FORMA CORRECTA
            code128 = Code128(
                codigo,
                writer=ImageWriter()
            )
            
            # Las opciones se pasan en el método write()
            code128.write(buffer, {
                'write_text': False,
                'quiet_zone': 2.0,
                'module_width': 0.3,
                'module_height': 15.0,
                'font_size': 10,
                'text_distance': 1.5
            })
            
            buffer.seek(0)
            
            # Verificar que se generó contenido
            if buffer.getbuffer().nbytes == 0:
                raise ValueError("El código de barras generado está vacío")
                
            return base64.b64encode(buffer.getvalue()).decode('utf-8')
            
        except Exception as e:
            print(f"Error generando código de barras: {str(e)}")
            return None


class ListarAnimalesAPIView(APIView):
    """Endpoint para listar todos los animales registrados"""

    def get(self, request):
        try:
            db = firestore.Client()
            docs = db.collection('RegistroAnimales').stream()

            animales = [doc.to_dict() for doc in docs]
            return Response(animales, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': f"Error al listar animales: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['PUT'])
def Editar(request):
    """Endpoint para editar la fecha de nacimiento de un animal"""
    try:
        codigo = request.data.get('codigo')
        nueva_fecha = request.data.get('fecha_nacimiento')

        if not codigo or not nueva_fecha:
            return Response(
                {"error": "Código y fecha de nacimiento son requeridos"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar y parsear fecha
        try:
            fecha_obj = datetime.strptime(nueva_fecha, "%Y-%m-%d")
            if fecha_obj > datetime.now():
                raise ValueError("La fecha no puede ser futura")
        except ValueError as e:
            return Response(
                {"error": f"Fecha inválida: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        db = firestore.Client()
        doc_ref = db.collection("RegistroAnimales").document(codigo)
        
        if not doc_ref.get().exists:
            return Response(
                {"error": "Animal no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )

        doc_ref.update({'fecha_nacimiento': fecha_obj})
        return Response({"message": "Fecha actualizada correctamente"})

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
def Eliminar(request):
    """Endpoint para eliminar un animal"""
    try:
        codigo = request.data.get('codigo')

        if not codigo:
            return Response(
                {"error": "Código requerido"},
                status=status.HTTP_400_BAD_REQUEST
            )

        db = firestore.Client()
        doc_ref = db.collection("RegistroAnimales").document(codigo)

        if not doc_ref.get().exists:
            return Response(
                {"error": "Animal no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )

        doc_ref.delete()
        return Response({"message": "Animal eliminado correctamente"})

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )