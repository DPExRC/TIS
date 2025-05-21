"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from usuarios.views import LoginView, RegisterView
from animales.views import ObtenerAnimales, RegistrarAnimales, CantidadAnimales, RegistrarExistenciaAnimales

urlpatterns = [
    path('admin/', admin.site.urls),
    path("login/", LoginView.as_view(), name="login"),
    path("register/", RegisterView.as_view(), name="register"),
    path("animales/", ObtenerAnimales.as_view(), name="animales"),
    path("registro-animales/", RegistrarAnimales.as_view(), name="registro_animales"),
    path("cantidad-animales/", CantidadAnimales.as_view(), name="cantidad_animales"),
    path("registrar-existencia/", RegistrarExistenciaAnimales.as_view(), name="registrar_existencia"),


]