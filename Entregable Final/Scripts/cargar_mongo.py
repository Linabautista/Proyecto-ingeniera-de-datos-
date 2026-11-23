# -*- coding: utf-8 -*-
"""Carga persona/ocupado/desocupado/tipoIndicador/indicador a Mongo sin pasar por Compass.
Requiere: 1) que Script_BD_MongoDB.js ya se haya corrido en mongosh (colecciones + validadores
+ catálogos + vistas); 2) que Script_BD_SQL_FINAL.sql ya se haya corrido en MySQL (tipoIndicador
e indicador calculados ahí). Se corre con: python cargar_mongo.py
"""
import io
import os
import subprocess

import pandas as pd
import pymongo

RAIZ_DATOS = r"C:\Users\jessi\OneDrive\Documents\GitHub\Proyecto-ingeniera-de-datos-\Datos para BD"
MYSQL_EXE = r"C:\xampp\mysql\bin\mysql.exe"
MYSQL_DB = "proyecto_geih"

NOMBRE_MES = {1: "Enero", 2: "Febrero", 3: "Marzo", 4: "Abril", 5: "Mayo", 6: "Junio",
              7: "Julio", 8: "Agosto", 9: "Septiembre", 10: "Octubre", 11: "Noviembre", 12: "Diciembre"}


def periodos_disponibles():
    """En vez de una lista fija de periodos, se detectan los que ya tienen CSV en Datos para BD
    (así, cuando se agrega un periodo nuevo como el de la demo en vivo, este script lo recoge solo,
    sin tener que editar el código cada vez)."""
    base_2026 = os.path.join(RAIZ_DATOS, "2026")
    periodos = []
    for mes in range(1, 13):
        carpeta = os.path.join(base_2026, NOMBRE_MES[mes])
        idPeriodo = 202600 + mes
        if os.path.isfile(os.path.join(carpeta, "persona_%d.csv" % idPeriodo)):
            periodos.append((idPeriodo, NOMBRE_MES[mes]))
    return periodos


PERIODOS = periodos_disponibles()

cliente = pymongo.MongoClient("mongodb://localhost:27017")
db = cliente["proyecto_geih"]


def consultar_mysql(consulta_sql):
    """Corre una consulta en el MySQL/MariaDB de XAMPP y devuelve el resultado como
    DataFrame, sin necesidad de exportar el CSV a mano desde DBeaver."""
    resultado = subprocess.run(
        [MYSQL_EXE, "-u", "root", "--default-character-set=utf8mb4", MYSQL_DB, "--batch", "-e", consulta_sql],
        capture_output=True, text=True, encoding="utf-8", check=True,
    )
    return pd.read_csv(io.StringIO(resultado.stdout), sep="\t", na_values=["NULL"])


def construir_registros(df, columnas_int=(), columnas_float=()):
    """Pandas deja NaN en las celdas vacías y vuelve float hasta las columnas enteras
    cuando hay nulos mezclados; aquí se quita el campo ausente (igual que el 'Ignore
    empty strings' de Compass) y se castea cada columna al tipo que pide el validador."""
    registros = []
    for fila in df.to_dict("records"):
        limpia = {}
        for k, v in fila.items():
            if pd.isna(v):
                continue
            if k in columnas_int:
                v = int(v)
            elif k in columnas_float:
                v = float(v)
            limpia[k] = v
        registros.append(limpia)
    return registros


def cargar_persona_ocupado_desocupado():
    for idPeriodo, carpeta in PERIODOS:
        if db.persona.count_documents({"idPeriodo": idPeriodo}, limit=1):
            print("persona %d ya estaba cargada, se omite" % idPeriodo)
            continue
        base = r"%s\2026\%s" % (RAIZ_DATOS, carpeta)

        p = pd.read_csv(r"%s\persona_%d.csv" % (base, idPeriodo), dtype={"idPersona": str})
        db.persona.insert_many(construir_registros(
            p, columnas_int=("idPeriodo", "idSexo", "edad", "clase", "area"),
            columnas_float=("factorExpansion",)))

        o = pd.read_csv(r"%s\ocupado_%d.csv" % (base, idPeriodo), dtype={"idPersona": str})
        db.ocupado.insert_many(construir_registros(
            o, columnas_int=("idRama", "cotizaPension"),
            columnas_float=("horasTrabajo", "ingreso")))

        d = pd.read_csv(r"%s\desocupado_%d.csv" % (base, idPeriodo), dtype={"idPersona": str})
        db.desocupado.insert_many(construir_registros(d))

        print("Cargado periodo %d: %d personas, %d ocupados, %d desocupados" % (idPeriodo, len(p), len(o), len(d)))

    # Igual que el updateMany documentado en Script_BD_MongoDB.js: pet no viene en el CSV.
    db.persona.update_many({}, [
        {"$set": {"pet": {"$cond": [{"$gte": ["$edad", 15]}, 1, 0]}}}
    ])
    print("pet actualizado en persona")


def cargar_tipoIndicador_e_indicador():
    # Incremental: se compara contra lo que ya hay en Mongo (por id), no contra "la colección está
    # vacía o no" — así recoge los periodos nuevos (como el de la demo) sin duplicar los que ya estaban.
    ids_tipo_existentes = set(db.tipoIndicador.distinct("idTipoIndicador"))
    t = consultar_mysql(
        "select idTipoIndicador, idPeriodo, idSexo, idRangoEdad, idTerritorio, idRamaActividad, "
        "nombreIndicador, formula, periodicidad from tipoIndicador"
    )
    t = t[~t["idTipoIndicador"].isin(ids_tipo_existentes)]
    registros = construir_registros(
        t, columnas_int=("idTipoIndicador", "idPeriodo", "idSexo", "idRangoEdad",
                          "idTerritorio", "idRamaActividad"))
    if registros:
        db.tipoIndicador.insert_many(registros)
    print("tipoIndicador: %d filas nuevas insertadas" % len(registros))

    ids_ind_existentes = set(db.indicador.distinct("idIndicador"))
    i = consultar_mysql(
        "select idIndicador, idTipoIndicador, idUsuario, valorIndicador, cvIndicador, "
        "date_format(fechaCalculoIndicador,'%Y-%m-%d') as fechaCalculoIndicador from indicador"
    )
    i = i[~i["idIndicador"].isin(ids_ind_existentes)]
    i["fechaCalculoIndicador"] = pd.to_datetime(i["fechaCalculoIndicador"])
    registros = construir_registros(
        i, columnas_int=("idIndicador", "idTipoIndicador", "idUsuario"),
        columnas_float=("valorIndicador", "cvIndicador"))
    for r in registros:
        r["fechaCalculoIndicador"] = r["fechaCalculoIndicador"].to_pydatetime()
    if registros:
        db.indicador.insert_many(registros)
    print("indicador: %d filas nuevas insertadas" % len(registros))


if __name__ == "__main__":
    cargar_persona_ocupado_desocupado()
    cargar_tipoIndicador_e_indicador()
    print("Listo.")
