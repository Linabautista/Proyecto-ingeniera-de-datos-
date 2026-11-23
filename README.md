# Del microdato al indicador

Proyecto de indicadores del mercado laboral colombiano, construida a partir de los microdatos de la Gran Encuesta Integrada de Hogares (GEIH) del DANE: preparación de datos en Python, carga y cálculo de indicadores tanto en una base relacional (MySQL) como en MongoDB, y tableros en Power BI conectados a cada una. Es el proyecto de la clase de Ingeniería de Datos.

**Equipo:** Lina Bautista, Jessica Gil, Mariana Ussa y Jorge Reza.

Este repositorio reúne los entregables del proyecto:

- **Entregable 1:** planteamiento del proyecto y alternativas de diseño.
- **Entregable 2:** fase relacional (diseño, base de datos en SQL y preparación de los datos en Python). Congelado como quedó entregado.
- **Entregable Final:** versión vigente del proyecto — base relacional optimizada, versión en MongoDB, y los tableros de Power BI conectados a ambas.

Los microdatos del DANE y los CSV ya procesados para cargar a las bases de datos se comparten entre entregables desde la raíz del repositorio (`Microdatos GEIH/` y `Datos para BD/`); el alcance vigente es **2026, enero a septiembre**.

## Contenido del repositorio

```
Entregable 1/
├── Entregable_1_Proyecto_IngDatos.pdf   Documento del entregable
├── Alternativa1.drawio.png              Primera alternativa de diseño
├── Alternativa2..drawio.png             Segunda alternativa de diseño
└── diagrama_clases_proyecto.drawio.png  Diagrama de clases

Entregable 2/                            
├── Entregable_2_Proyecto_IngDatos.pdf   Documento del entregable
├── casos prueba periodo persona sexo .pdf
├── Diccionario BD.xlsx                  Diccionario de datos (una hoja por tabla)
├── Diagramas/                           Diagramas de clases, MER, modelo lógico y modelo físico
├── Scripts/
│   ├── preparar_geih.ipynb              Cuaderno de Python que prepara los datos
│   └── Script_BD_SQL_FINAL.sql          Script de la base de datos de esta fase (MySQL)
└── Datos para BD/                       Muestra local usada por esta fase

Entregable Final/                        
├── Entregable_Final_Proyecto_IngDatos.pdf  Documento del entregable
├── Diccionario BD.xlsx                     Diccionario de datos
├── Diagramas/                               Diagramas de clases, MER, modelo lógico, modelo físico (SQL), modelo no relacional (Mongo), modelo de arquitectura de BD NoSQL
├── Scripts/
│   ├── preparar_geih.ipynb              Cuaderno de Python: procesa los microdatos del DANE
│   │                                     y genera los CSV en Datos para BD/ automáticamente
│   ├── Script_BD_SQL_FINAL.sql          Base de datos relacional completa (tablas, funciones,
│   │                                     procedimientos, triggers, vistas) en MySQL
│   ├── Script_BD_MongoDB.js              Base de datos No relacional completa en MongoDB (colecciones, validadores, vistas)
│   └── cargar_mongo.py                  Carga persona/ocupado/desocupado/tipoIndicador/indicador
│                                         a MongoDB por código, sin pasar por la interfaz de Compass
└── Power BI/
    ├── Fotos Tablero/                   Capturas de las páginas del tablero (Resumen, Por
    │                                    territorio, Por sexo, Por edad, Por rama)
    ├── Mongo/
    │   ├── Tablero_GEIH_Mongo.pbix          Tablero conectado a MongoDB
    │   ├── Plantilla_tablero_GEIH_Mongo.pbit  Plantilla del tablero
    │   └── powerbi_mongodb_geih.py           Script fuente de datos (Power BI -> Python -> Mongo)
    └── SQL/
        └── Tablero_GEIH_SQL.pbix            Tablero conectado directo a MariaDB/MySQL

Microdatos GEIH/   Archivos originales del DANE, por año y mes (alcance vigente: 2026, enero-septiembre)
Datos para BD/     CSV ya procesados, listos para cargar en SQL/Mongo (mismo alcance)
```

