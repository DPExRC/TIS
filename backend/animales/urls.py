from django.urls import path
from .views import *

urlpatterns = [
    path('registrar/', RegistrarAnimalAPIView.as_view(), name='registrar_animal'),
    path('total/', ListarAnimalesAPIView.as_view(), name='listar_animales'),
    path('editar/', Editar, name='editar_animal'),
    path('eliminar/', Eliminar, name='eliminar_animal'),
]
