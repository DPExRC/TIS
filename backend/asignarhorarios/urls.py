from django.urls import path
from .views import AsignarHorarioView

urlpatterns = [
    path('horarios/', AsignarHorarioView.as_view(), name='asignar_horario'),
]
