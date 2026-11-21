# powerbi_mongodb_geih.py
# Script de origen de datos para Power BI Desktop: Obtener datos > Más... > Script de Python.
# Lee la base proyecto_geih de MongoDB y entrega la tabla que necesita el tablero:
#   indicadores -> un registro por indicador/periodo/dimensión (igual a v_indicador_detalle)
# Requisitos en el equipo: Python 3, pandas y pymongo
#   pip install pandas pymongo
# Datos requeridos en MongoDB: Script_BD_MongoDB.js ejecutado (colecciones + vistas) y
# persona/ocupado/desocupado/tipoIndicador/indicador ya cargados (ver cargar_mongo.py).

import pandas as pd
from pymongo import MongoClient

URI = "mongodb://localhost:27017/?directConnection=true"   # Atlas: pega aquí tu cadena mongodb+srv://
BASE = "proyecto_geih"

cliente = MongoClient(URI, serverSelectionTimeoutMS=10000)
db = cliente[BASE]

# v_indicador_detalle ya hace el join de indicador + tipoIndicador + periodo/sexo/rangoEdad/
# territorio/ramaActividad/usuario (ver Script_BD_MongoDB.js, sección 3.2); el tablero no necesita
# nada más (v_resumen_laboral_periodo y v_ocupados_por_rama son solo para explorar el microdato).
NOMBRES_MES = {1: "Enero", 2: "Febrero", 3: "Marzo", 4: "Abril", 5: "Mayo", 6: "Junio",
               7: "Julio", 8: "Agosto", 9: "Septiembre", 10: "Octubre", 11: "Noviembre", 12: "Diciembre"}

# Orden de despliegue para el filtro/eje de territorio: nacional, luego urbano/rural, luego
# ciudades (en vez del orden alfabético que usaría Power BI por defecto).
ORDEN_TERRITORIO = {
    "Nacional": 1, "Urbano": 2, "Resto": 3,
    "Bogotá D.C.": 4, "Medellín y A.M.": 5, "Cali y A.M.": 6, "Barranquilla y A.M.": 7,
    "Bucaramanga y A.M.": 8, "Manizales y A.M.": 9, "Pereira y A.M.": 10, "Cúcuta y A.M.": 11,
    "Pasto": 12, "Ibagué": 13, "Montería": 14, "Cartagena": 15, "Villavicencio": 16,
}

# Orden de despliegue para rangoEdad: "Todos" primero, luego los rangos de menor a mayor edad.
ORDEN_RANGO_EDAD = {"Todos": 0, "15-17": 1, "18-28": 2, "29-44": 3, "45-59": 4, "60 o más": 5}

indicadores = pd.DataFrame(list(db.v_indicador_detalle.find({}, {"_id": 0})))
indicadores["nombreMes"] = indicadores["mes"].map(NOMBRES_MES)
indicadores["ordenTerritorio"] = indicadores["territorio"].map(ORDEN_TERRITORIO)
indicadores["ordenRangoEdad"] = indicadores["rangoEdad"].map(ORDEN_RANGO_EDAD)
indicadores = indicadores[["anio", "mes", "nombreMes", "nombreIndicador", "sexo", "rangoEdad",
                           "ordenRangoEdad", "territorio", "ordenTerritorio", "ramaActividad",
                           "valorIndicador", "cvIndicador", "confiabilidad",
                           "fechaCalculoIndicador", "usuario"]]
indicadores = indicadores.sort_values(["anio", "mes", "nombreIndicador"]).reset_index(drop=True)

cliente.close()
