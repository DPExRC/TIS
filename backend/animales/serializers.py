from rest_framework import serializers
from datetime import datetime
from pytz import timezone
from firebase_config import db, initialize_firebase
initialize_firebase()


class AnimalSerializer(serializers.Serializer):
    codigo = serializers.CharField(max_length=10)
    especie = serializers.CharField(max_length=50)
    animal = serializers.CharField(max_length=50)
    fecha_nacimiento = serializers.DateField()

    def create(self, validated_data):
        from google.cloud import firestore
        from pytz import timezone

        fecha_nac = validated_data['fecha_nacimiento']

        tz = timezone("America/Santiago")
        fecha_nac_datetime = tz.localize(datetime.combine(fecha_nac, datetime.min.time()))

        doc_ref = db.collection('RegistroAnimales').document(validated_data['codigo'])
        doc_ref.set({
            'codigo': validated_data['codigo'],
            'especie': validated_data['especie'],
            'animal': validated_data['animal'],
            'fecha_nacimiento': fecha_nac_datetime
        })
        return validated_data
