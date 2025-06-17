from dataclasses import dataclass
from datetime import date

@dataclass
class Animal:
    codigo: str
    especie: str
    nombre: str
    fecha_nacimiento: date
