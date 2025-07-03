
from django.urls import path
from .views import ExistenciaView

urlpatterns = [
    path('crear/', ExistenciaView.as_view(), name='listar_crear_existencia'),            # GET todos y POST
    path('list/', ExistenciaView.as_view(), name='detallar_actualizar_borrar_alerta'),  # GET, PUT, DELETE por ID
    path('list/<str:id>/', ExistenciaView.as_view(), name='detallar_actualizar_borrar_alerta'),  # GET, PUT, DELETE por ID

]
