from django.urls import path
from .views import HorarioView, ListaHorariosView

urlpatterns = [
    path("listar/", ListaHorariosView.as_view(), name='listar_horarios'),         
    path("guardar/", HorarioView.as_view(),name="guardar_horario"),
    path("<str:nombre>/", HorarioView.as_view(),name="obtener_horario"),
]
