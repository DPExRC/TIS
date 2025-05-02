from firebase_admin import firestore
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class ObtenerAnimales(APIView):
    def get(self, request):
        try:
            db = firestore.client()
            animales_ref = db.collection('Animales')
            documentos = animales_ref.stream()

            resultado = {}

            for doc in documentos:
                especie = doc.id
                resultado[especie] = {}

                subcolecciones = animales_ref.document(especie).collections()

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
            print("Datos recibidos en la API:", request.data)

            db = firestore.client()
            datos = request.data

            species = datos.get('species')
            animal = datos.get('animal')
            code = datos.get('code')
            birthday = datos.get('birthday')

            if not species or not animal or not code or not birthday:
                return Response({"error": "Faltan datos requeridos."}, status=status.HTTP_400_BAD_REQUEST)

            especie_doc_ref = db.collection('Animales').document(species)
            animal_subcollection_ref = especie_doc_ref.collection(animal)

            # Guardar solo la fecha de nacimiento
            animal_subcollection_ref.document(code).set({
                'birthday': birthday
            })

            return Response({"mensaje": f"Animal registrado en '{species}/{animal}' con solo birthday."}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
