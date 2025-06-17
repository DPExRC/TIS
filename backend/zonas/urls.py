from django.urls import path
from .views import ZonaList, ZonaDetail

urlpatterns = [
    path("list/", ZonaList.as_view(), name="zona_list"),
    path("<str:nombre>/", ZonaDetail.as_view(), name="zona_detail"),
]
