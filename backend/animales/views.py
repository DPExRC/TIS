from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from firebase_config import db
from firebase_admin import firestore

class ObtenerAnimales(APIView):
    def get(self, request):
        try:
            animales_ref = db.collection('Animales')
            documentos = animales_ref.stream()

            resultado = {}

            for doc in documentos:
                especie = doc.id
                resultado[especie] = {}

                subcolecciones = doc.reference.collections()

                for subcol in subcolecciones:
                    animal = subcol.id
                    registros = subcol.stream()
                    resultado[especie][animal] = []

                    for registro in registros:
                        datos = registro.to_dict()
                        resultado[especie][animal].append({
                            'code': registro.id,
                            'birthday': datos.get('birthday')
                        })

            return Response({"animales": resultado}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RegistrarAnimales(APIView):
    def post(self, request):
        try:
            datos = request.data

            species = datos.get('species')
            animal = datos.get('animal')
            code = datos.get('code')
            birthday = datos.get('birthday')

            if not all([species, animal, code, birthday]):
                return Response({"error": "Faltan datos requeridos."}, status=status.HTTP_400_BAD_REQUEST)

            especie_ref = db.collection('Animales').document(species)
            animal_ref = especie_ref.collection(animal)

            animal_ref.document(code).set({
                'birthday': birthday
            })

            return Response(
                {"mensaje": f"Animal registrado en '{species}/{animal}' con solo birthday."},
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CantidadAnimales(APIView):
    def get(self, request):
        try:
            cantidad_ref = db.collection('CantidadAnimales')
            documentos_zonas = cantidad_ref.stream()

            resultado = {}

            for zona_doc in documentos_zonas:
                zona = zona_doc.id
                resultado[zona] = {}

                subcolecciones = zona_doc.reference.collections()

                for especie in subcolecciones:
                    nombre_especie = especie.id
                    resultado[zona][nombre_especie] = {}

                    animales = especie.stream()

                    for animal_doc in animales:
                        nombre_animal = animal_doc.id
                        datos = animal_doc.to_dict()

                        resultado[zona][nombre_especie][nombre_animal] = {
                            'Cantidad': datos.get('Cantidad'),
                            'FechaConteo': datos.get('FechaConteo')
                        }

            return Response({"CantidadAnimales": resultado}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RegistrarExistenciaAnimales(APIView):
    def post(self, request):
        try:
            datos = request.data

            codigo = datos.get('codigo')
            zona = datos.get('zona')
            
            especie = datos.get('especie')
            animal = datos.get('animal')

            if not all([codigo, especie, animal, zona]):
                return Response({"error": "Faltan datos requeridos."}, status=status.HTTP_400_BAD_REQUEST)

            zona_ref = db.collection('Existencia').document(zona)
            especie_ref = zona_ref.collection(especie)
            animal_ref = especie_ref.document(animal)

            # Actualizar campo array "codigos" agregando el nuevo código si no existe
            animal_ref.set({
                'codigos': firestore.ArrayUnion([codigo])
            }, merge=True)

            return Response({"mensaje": f"Código '{codigo}' registrado en existencia de '{zona}/{especie}/{animal}'."}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)