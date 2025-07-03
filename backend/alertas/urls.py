
from django.urls import path
from .views import AlertasView

urlpatterns = [
    path('crear/', AlertasView.as_view(), name='listar_crear_alertas'),            # GET todos y POST
    path('list/', AlertasView.as_view(), name='detallar_actualizar_borrar_alerta'),  # GET, PUT, DELETE por ID
    path('list/<str:id>/', AlertasView.as_view(), name='detallar_actualizar_borrar_alerta'),  # GET, PUT, DELETE por ID

]
