from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from firebase_config import db
from firebase_admin import firestore
from google.cloud import firestore
from django.utils import timezone

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

            # Guardar el birthday del animal
            especie_ref = db.collection('Animales').document(species)
            animal_ref = especie_ref.collection(animal)
            animal_ref.document(code).set({
                'birthday': birthday
            })

            # Guardar el código en el array 'codigos' del documento 'existencia'
            codigos_ref = db.collection('codigos').document('existencia')
            codigos_ref.set({
                'codigos': firestore.ArrayUnion([code])
            }, merge=True)

            return Response(
                {"mensaje": f"Animal registrado en '{species}/{animal}' y código añadido a codigos/existencia.codigos."},
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
    animal_codes = {
        "Vacas": 1000, "Toros": 2000, "Terneros": 3000, "Cerdos": 1000,
        "Lechones": 2000, "Cabras": 1000, "Corderos": 1000, "Ovejas": 2000,
        "Caballos": 1000, "Burros": 2000, "Gallinas": 1000, "Gallos": 2000,
        "Gansos": 3000, "Pavos": 4000, "Patos": 1000, "Patas": 2000,
        "Ovejas merinas": 1000, "Carneros": 2000
    }

    especie_prefix_map = {
        "PO": "Porcino", "VA": "Vacunos", "EQ": "Equinos", "AV": "Avícolas",
        "OV": "Ovinos", "CA": "Caprinos"
        # Agrega más si necesitas
    }

    def post(self, request):
        try:
            datos = request.data
            codigo = datos.get('codigo')
            zona = datos.get('zona')
            registrado_por = datos.get('RegistradoPor')

            if not all([codigo, zona, registrado_por]):
                return Response({"error": "Faltan datos requeridos."}, status=400)

            # Validar código en codigos/existencia/codigos
            codigos_ref = db.collection('codigos').document('existencia')
            codigos_doc = codigos_ref.get()

            if not codigos_doc.exists:
                return Response({"error": "No existe el documento de códigos registrados."}, status=404)

            codigos_array = codigos_doc.to_dict().get('codigos', [])
            if codigo not in codigos_array:
                return Response({"error": f"El código '{codigo}' no está registrado."}, status=400)

            # Inferir especie y animal desde el código
            try:
                prefijo, numero = codigo.split("-")
                numero = int(numero)
            except ValueError:
                return Response({"error": "El formato del código es inválido. Use 'ES-XXXX'."}, status=400)

            especie = self.especie_prefix_map.get(prefijo)
            if not especie:
                return Response({"error": f"Prefijo de especie '{prefijo}' no reconocido."}, status=400)

            # Buscar el animal correspondiente al número
            animal = None
            for nombre, base in self.animal_codes.items():
                if numero >= base and numero < base + 1000:
                    animal = nombre
                    break

            if not animal:
                return Response({"error": f"No se encontró un animal válido para el número '{numero}'."}, status=400)

            # Referencia base para existencia
            base_ref = (
                db.collection('Existencia')
                .document(zona)
                .collection(especie)
                .document(animal)
            )

            # Obtener el registro actual
            actual_doc = base_ref.collection('Registros').document('actual').get()
            actual_data = actual_doc.to_dict() if actual_doc.exists else {}

            # Mover 'actual' a 'anterior'
            if actual_data:
                base_ref.collection('Registros').document('anterior').set(actual_data)

            # Guardar el nuevo registro como 'actual'
            base_ref.collection('Registros').document('actual').set({
                'FechaReporte': firestore.SERVER_TIMESTAMP,
                'RegistradoPor': registrado_por,
                'codigos': firestore.ArrayUnion([codigo])
            })

            return Response({
                "mensaje": f"Registro actualizado para {especie} / {animal} con código {codigo}."
            }, status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=500)



class CompararExistenciasView(APIView):
    def get(self, request, zona, especie, animal):
        try:
            base_ref = (
                db.collection('Existencia')
                .document(zona)
                .collection(especie)
                .document(animal)
                .collection('Registros')
            )

            actual = base_ref.document('actual').get().to_dict()
            anterior = base_ref.document('anterior').get().to_dict()

            if not actual or not anterior:
                return Response({"error": "Faltan registros para comparar."}, status=status.HTTP_400_BAD_REQUEST)

            set_actual = set(actual.get('codigos', []))
            set_anterior = set(anterior.get('codigos', []))

            return Response({
                "nuevos": list(set_actual - set_anterior),
                "faltantes": list(set_anterior - set_actual),
                "comunes": list(set_actual & set_anterior),
                "actual": actual,
                "anterior": anterior
            })

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class ObtenerExistenciaAnimales(APIView):
    def get(self, request):
        try:
            existencia_ref = db.collection('Existencia')
            zonas = existencia_ref.stream()

            resultado = {
                "anterior": {},
                "actual": {}
            }

            for zona_doc in zonas:
                zona = zona_doc.id
                resultado["anterior"][zona] = {}
                resultado["actual"][zona] = {}

                especies = zona_doc.reference.collections()

                for especie_col in especies:
                    especie = especie_col.id
                    resultado["anterior"][zona][especie] = {}
                    resultado["actual"][zona][especie] = {}

                    documentos = list(especie_col.stream())

                    for doc in documentos:
                        tipo_animal = doc.id
                        registros_ref = doc.reference.collection("Registros")

                        for tipo_registro in ["anterior", "actual"]:
                            registro_doc = registros_ref.document(tipo_registro).get()
                            if registro_doc.exists:
                                datos = registro_doc.to_dict()
                                codigos = datos.get("codigos", [])
                                resultado[tipo_registro][zona][especie][tipo_animal] = {
                                    "FechaReporte": datos.get("FechaReporte"),
                                    "RegistradoPor": datos.get("RegistradoPor"),
                                    "codigos": codigos,
                                    "total": len(codigos)
                                }

            return Response(resultado, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EliminarAnimales(APIView):
    def delete(self, request):
        datos = request.data
        codigo = datos.get('codigo')
        nacimiento = datos.get('nacimiento')

        if not codigo or not nacimiento:
            return Response(
                {"error": "Los campos 'codigo' y 'nacimiento' son requeridos."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            animales_ref = db.collection('Animales')
            documentos = animales_ref.stream()

            # Buscar el documento y subcolección que contengan el código y nacimiento
            for doc in documentos:
                subcolecciones = doc.reference.collections()

                for subcol in subcolecciones:
                    registros = subcol.stream()

                    for registro in registros:
                        datos_registro = registro.to_dict()
                        if registro.id == codigo and datos_registro.get('birthday') == nacimiento:
                            # Eliminamos el documento específico
                            registro.reference.delete()
                            return Response(
                                {"message": f"Animal con código '{codigo}' eliminado correctamente."},
                                status=status.HTTP_200_OK
                            )

            return Response(
                {"error": "No se encontró ningún animal que coincida con los datos proporcionados."},
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
