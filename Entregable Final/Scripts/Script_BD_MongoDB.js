// ========================================================
// Del microdato al indicador - Entregable 2 (versión MongoDB)
// Realizado por: Lina Bautista, Jessica Gil, Mariana Ussa y Jorge Reza
// ========================================================

// Limitaciones conocidas frente a la versión SQL (MongoDB Community no tiene
// triggers de servidor ni llaves foráneas fuera de Atlas, así que esto no se  puede resolver 


use proyecto_geih

// ========================================================
// 1. Colecciones de las tablas grandes (se cargan por CSV desde la interfaz)
// ========================================================

// 1.1 persona
db.createCollection("persona", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["idPersona", "idPeriodo", "idSexo", "edad", "clase", "area", "factorExpansion"],
    properties: {
      idPersona:       { bsonType: "string", pattern: "^[0-9]{11}$", description: "directorio(7)+secuencia_p(2)+orden(2)" },
      idPeriodo:       { bsonType: "int" },
      idSexo:          { bsonType: "int", enum: [1, 2] },
      edad:            { bsonType: "int", minimum: 0, maximum: 120 },
      clase:           { bsonType: "int", enum: [1, 2] },
      area:            { bsonType: "int" },
      factorExpansion: { bsonType: ["double", "decimal"], exclusiveMinimum: true, minimum: 0 },
      pet:             { bsonType: "int", enum: [0, 1], description: "población en edad de trabajar (edad >= 15); se completa con el updateMany de abajo, no viene en el CSV" }
    }
  } }
});
db.persona.createIndex({ idPersona: 1 }, { unique: true });
db.persona.createIndex({ idPeriodo: 1 });


// después de CADA importación de persona hay que correr este updateMany para
// dejar "pet" guardado en cada documento, igual que en la tabla SQL.
db.persona.updateMany({}, [
  { $set: { pet: { $cond: [{ $gte: ["$edad", 15] }, 1, 0] } } }
]);
db.persona.createIndex({ pet: 1 });

// 1.2 ocupado
db.createCollection("ocupado", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["idPersona", "cotizaPension"],
    properties: {
      idPersona:     { bsonType: "string" },
      idRama:        { bsonType: ["int", "null"], minimum: 1, maximum: 13, description: "13 ramas agrupadas; null si no sabe, no informa o viene vacía" },
      horasTrabajo:  { bsonType: ["int", "double", "decimal", "null"], minimum: 0, maximum: 168 },
      ingreso:       { bsonType: ["int", "double", "decimal", "null"], minimum: 0 },
      cotizaPension: { bsonType: "int", enum: [0, 1] }
    }
  } }
});
db.ocupado.createIndex({ idPersona: 1 }, { unique: true });
db.ocupado.createIndex({ idRama: 1 });

// 1.3 desocupado
db.createCollection("desocupado", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["idPersona"],
    properties: { idPersona: { bsonType: "string" } }
  } }
});
db.desocupado.createIndex({ idPersona: 1 }, { unique: true });

// 1.4 tipoIndicador (se importa ya calculada desde MySQL)
db.createCollection("tipoIndicador", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["idTipoIndicador", "idPeriodo", "nombreIndicador", "formula", "periodicidad"],
    properties: {
      idTipoIndicador: { bsonType: "int" },
      idPeriodo:       { bsonType: "int" },
      idSexo:          { bsonType: ["int", "null"] },
      idRangoEdad:     { bsonType: ["int", "null"] },
      idTerritorio:    { bsonType: ["int", "null"] },
      idRamaActividad: { bsonType: ["int", "null"] },
      nombreIndicador: { bsonType: "string" },
      formula:         { bsonType: "string" },
      periodicidad:    { enum: ["mensual", "anual"] }
    }
  } }
});
db.tipoIndicador.createIndex({ idTipoIndicador: 1 }, { unique: true });
db.tipoIndicador.createIndex({ idPeriodo: 1 });

// 1.5 indicador (se importa ya calculada desde MySQL)
db.createCollection("indicador", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["idIndicador", "idTipoIndicador", "idUsuario", "valorIndicador", "fechaCalculoIndicador"],
    properties: {
      idIndicador:           { bsonType: "int" },
      idTipoIndicador:       { bsonType: "int" },
      idUsuario:             { bsonType: "int" },
      valorIndicador:        { bsonType: ["double", "decimal"] },
      cvIndicador:           { bsonType: ["double", "decimal", "null"], minimum: 0 },
      fechaCalculoIndicador: { bsonType: "date" }
    }
  } }
});
db.indicador.createIndex({ idIndicador: 1 }, { unique: true });
db.indicador.createIndex({ idTipoIndicador: 1 });
db.indicador.createIndex({ idUsuario: 1 });

// ========================================================
// 2. Catálogos
// ========================================================

// 2.1 usuario
db.createCollection("usuario", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["idUsuario", "nombreUsuario", "correoUsuario", "rolUsuario", "activo"],
    properties: {
      idUsuario:     { bsonType: "int" },
      nombreUsuario: { bsonType: "string" },
      correoUsuario: { bsonType: "string", pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$" },
      rolUsuario:    { enum: ["administrador", "ingeniero de datos", "investigador"] },
      activo:        { bsonType: "bool" }
    }
  } }
});
db.usuario.insertMany([
  { idUsuario: 1,  nombreUsuario: "Mariana Vargas",             correoUsuario: "mariana@example.com",             rolUsuario: "administrador",       activo: true },
  { idUsuario: 2,  nombreUsuario: "Jessica Tellez",             correoUsuario: "jessica@example.com",             rolUsuario: "ingeniero de datos",  activo: true },
  { idUsuario: 3,  nombreUsuario: "Jorge Díaz",                 correoUsuario: "jorge@example.com",               rolUsuario: "ingeniero de datos",  activo: true },
  { idUsuario: 4,  nombreUsuario: "Lina Parra",                 correoUsuario: "lina@example.com",                rolUsuario: "ingeniero de datos",  activo: true },
  { idUsuario: 5,  nombreUsuario: "Camila Ramírez Moreno",      correoUsuario: "camila.ramirez01@example.com",    rolUsuario: "investigador",        activo: true },
  { idUsuario: 6,  nombreUsuario: "Andrés Cárdenas Peña",       correoUsuario: "andres.cardenas02@example.com",   rolUsuario: "investigador",        activo: true },
  { idUsuario: 7,  nombreUsuario: "Valentina Rincón Torres",    correoUsuario: "valentina.rincon03@example.com",  rolUsuario: "investigador",        activo: true },
  { idUsuario: 8,  nombreUsuario: "Santiago Montoya Quintero",  correoUsuario: "santiago.montoya04@example.com",  rolUsuario: "investigador",        activo: true },
  { idUsuario: 9,  nombreUsuario: "Daniela Herrera Montoya",    correoUsuario: "daniela.herrera05@example.com",   rolUsuario: "investigador",        activo: true },
  { idUsuario: 10, nombreUsuario: "Sebastián Quintero Cárdenas",correoUsuario: "sebastian.quintero06@example.com",rolUsuario: "investigador",        activo: true },
  { idUsuario: 11, nombreUsuario: "Laura Suárez Ibáñez",        correoUsuario: "laura.suarez07@example.com",      rolUsuario: "investigador",        activo: true },
  { idUsuario: 12, nombreUsuario: "Juan Torres Vargas",         correoUsuario: "juan.torres08@example.com",       rolUsuario: "investigador",        activo: true },
  { idUsuario: 13, nombreUsuario: "Paula Mejía Duarte",         correoUsuario: "paula.mejia09@example.com",       rolUsuario: "investigador",        activo: false },
  { idUsuario: 14, nombreUsuario: "Felipe Peña Castro",         correoUsuario: "felipe.pena10@example.com",       rolUsuario: "investigador",        activo: true },
  { idUsuario: 15, nombreUsuario: "Natalia Franco Acosta",      correoUsuario: "natalia.franco11@example.com",    rolUsuario: "investigador",        activo: true },
  { idUsuario: 16, nombreUsuario: "David Moreno Gómez",         correoUsuario: "david.moreno12@example.com",      rolUsuario: "investigador",        activo: true },
  { idUsuario: 17, nombreUsuario: "Carolina Salazar Salazar",   correoUsuario: "carolina.salazar13@example.com",  rolUsuario: "investigador",        activo: true },
  { idUsuario: 18, nombreUsuario: "Mateo Cortés Franco",        correoUsuario: "mateo.cortes14@example.com",      rolUsuario: "investigador",        activo: true },
  { idUsuario: 19, nombreUsuario: "Isabella Gómez Mejía",       correoUsuario: "isabella.gomez15@example.com",    rolUsuario: "investigador",        activo: true },
  { idUsuario: 20, nombreUsuario: "Nicolás Ortiz Suárez",       correoUsuario: "nicolas.ortiz16@example.com",     rolUsuario: "investigador",        activo: true },
  { idUsuario: 21, nombreUsuario: "Sofía Acosta Herrera",       correoUsuario: "sofia.acosta17@example.com",      rolUsuario: "investigador",        activo: true },
  { idUsuario: 22, nombreUsuario: "Daniel Lozano Rincón",       correoUsuario: "daniel.lozano18@example.com",     rolUsuario: "investigador",        activo: false },
  { idUsuario: 23, nombreUsuario: "María Castro Ramírez",       correoUsuario: "maria.castro19@example.com",      rolUsuario: "investigador",        activo: true },
  { idUsuario: 24, nombreUsuario: "Alejandro Pineda Beltrán",   correoUsuario: "alejandro.pineda20@example.com",  rolUsuario: "investigador",        activo: true },
  { idUsuario: 25, nombreUsuario: "Luisa Duarte Rojas",         correoUsuario: "luisa.duarte21@example.com",      rolUsuario: "investigador",        activo: true },
  { idUsuario: 26, nombreUsuario: "Tomás Rojas Pineda",         correoUsuario: "tomas.rojas22@example.com",       rolUsuario: "investigador",        activo: true },
  { idUsuario: 27, nombreUsuario: "Juliana Vargas Lozano",      correoUsuario: "juliana.vargas23@example.com",    rolUsuario: "investigador",        activo: true },
  { idUsuario: 28, nombreUsuario: "Esteban Beltrán Ortiz",      correoUsuario: "esteban.beltran24@example.com",   rolUsuario: "investigador",        activo: true },
  { idUsuario: 29, nombreUsuario: "Manuela Ibáñez Cortés",      correoUsuario: "manuela.ibanez25@example.com",    rolUsuario: "investigador",        activo: true },
  { idUsuario: 30, nombreUsuario: "Camila Ramírez Moreno",      correoUsuario: "camila.ramirez26@example.com",    rolUsuario: "investigador",        activo: true },
  { idUsuario: 31, nombreUsuario: "Andrés Cárdenas Peña",       correoUsuario: "andres.cardenas27@example.com",   rolUsuario: "investigador",        activo: false },
  { idUsuario: 32, nombreUsuario: "Valentina Rincón Torres",    correoUsuario: "valentina.rincon28@example.com",  rolUsuario: "investigador",        activo: true },
  { idUsuario: 33, nombreUsuario: "Santiago Montoya Quintero",  correoUsuario: "santiago.montoya29@example.com",  rolUsuario: "investigador",        activo: true },
  { idUsuario: 34, nombreUsuario: "Daniela Herrera Montoya",    correoUsuario: "daniela.herrera30@example.com",   rolUsuario: "investigador",        activo: true },
  { idUsuario: 35, nombreUsuario: "Sebastián Quintero Cárdenas",correoUsuario: "sebastian.quintero31@example.com",rolUsuario: "investigador",        activo: true },
  { idUsuario: 36, nombreUsuario: "Laura Suárez Ibáñez",        correoUsuario: "laura.suarez32@example.com",      rolUsuario: "investigador",        activo: true },
  { idUsuario: 37, nombreUsuario: "Juan Torres Vargas",         correoUsuario: "juan.torres33@example.com",       rolUsuario: "investigador",        activo: true },
  { idUsuario: 38, nombreUsuario: "Paula Mejía Duarte",         correoUsuario: "paula.mejia34@example.com",       rolUsuario: "investigador",        activo: true },
  { idUsuario: 39, nombreUsuario: "Felipe Peña Castro",         correoUsuario: "felipe.pena35@example.com",       rolUsuario: "investigador",        activo: true },
  { idUsuario: 40, nombreUsuario: "Natalia Franco Acosta",      correoUsuario: "natalia.franco36@example.com",    rolUsuario: "investigador",        activo: false },
  { idUsuario: 41, nombreUsuario: "David Moreno Gómez",         correoUsuario: "david.moreno37@example.com",      rolUsuario: "investigador",        activo: true },
  { idUsuario: 42, nombreUsuario: "Carolina Salazar Salazar",   correoUsuario: "carolina.salazar38@example.com",  rolUsuario: "investigador",        activo: true },
  { idUsuario: 43, nombreUsuario: "Mateo Cortés Franco",        correoUsuario: "mateo.cortes39@example.com",      rolUsuario: "investigador",        activo: true },
  { idUsuario: 44, nombreUsuario: "Isabella Gómez Mejía",       correoUsuario: "isabella.gomez40@example.com",    rolUsuario: "investigador",        activo: true },
  { idUsuario: 45, nombreUsuario: "Nicolás Ortiz Suárez",       correoUsuario: "nicolas.ortiz41@example.com",     rolUsuario: "investigador",        activo: true },
  { idUsuario: 46, nombreUsuario: "Sofía Acosta Herrera",       correoUsuario: "sofia.acosta42@example.com",      rolUsuario: "investigador",        activo: true },
  { idUsuario: 47, nombreUsuario: "Daniel Lozano Rincón",       correoUsuario: "daniel.lozano43@example.com",     rolUsuario: "investigador",        activo: true },
  { idUsuario: 48, nombreUsuario: "María Castro Ramírez",       correoUsuario: "maria.castro44@example.com",      rolUsuario: "investigador",        activo: true },
  { idUsuario: 49, nombreUsuario: "Alejandro Pineda Beltrán",   correoUsuario: "alejandro.pineda45@example.com",  rolUsuario: "investigador",        activo: false },
  { idUsuario: 50, nombreUsuario: "Luisa Duarte Rojas",         correoUsuario: "luisa.duarte46@example.com",      rolUsuario: "investigador",        activo: true }
]);
db.usuario.createIndex({ idUsuario: 1 }, { unique: true });
db.usuario.createIndex({ correoUsuario: 1 }, { unique: true });

// 2.2 periodo (igual rango que en el script SQL: solo 2026-01 a 2026-09, el alcance real
// del tablero; 202609 es el periodo que se carga en la sección de demo en vivo)
db.createCollection("periodo", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["idPeriodo", "anio", "mes"],
    properties: {
      idPeriodo: { bsonType: "int" },
      anio:      { bsonType: "int" },
      mes:       { bsonType: "int", minimum: 1, maximum: 12 }
    }
  } }
});
{
  const periodos = [];
  for (let mes = 1; mes <= 9; mes++) {
    periodos.push({ idPeriodo: 202600 + mes, anio: 2026, mes: mes });
  }
  db.periodo.insertMany(periodos);
}
db.periodo.createIndex({ idPeriodo: 1 }, { unique: true });
db.periodo.createIndex({ anio: 1, mes: 1 }, { unique: true });

// 2.3 sexo
db.createCollection("sexo", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["idSexo", "nombreSexo"],
    properties: { idSexo: { bsonType: "int" }, nombreSexo: { bsonType: "string" } }
  } }
});
db.sexo.insertMany([
  { idSexo: 1, nombreSexo: "Hombre" },
  { idSexo: 2, nombreSexo: "Mujer" }
]);
db.sexo.createIndex({ idSexo: 1 }, { unique: true });
db.sexo.createIndex({ nombreSexo: 1 }, { unique: true });

// 2.4 rangoEdad
db.createCollection("rangoEdad", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["idRangoEdad", "nombreRangoEdad", "edadInicial"],
    properties: {
      idRangoEdad:     { bsonType: "int" },
      nombreRangoEdad: { bsonType: "string" },
      edadInicial:     { bsonType: "int" },
      edadFinal:       { bsonType: ["int", "null"], description: "null en el rango de 60 años o más" }
    }
  } }
});
db.rangoEdad.insertMany([
  { idRangoEdad: 1, nombreRangoEdad: "15-17",    edadInicial: 15, edadFinal: 17 },
  { idRangoEdad: 2, nombreRangoEdad: "18-28",    edadInicial: 18, edadFinal: 28 },
  { idRangoEdad: 3, nombreRangoEdad: "29-44",    edadInicial: 29, edadFinal: 44 },
  { idRangoEdad: 4, nombreRangoEdad: "45-59",    edadInicial: 45, edadFinal: 59 },
  { idRangoEdad: 5, nombreRangoEdad: "60 o más", edadInicial: 60, edadFinal: null }
]);
db.rangoEdad.createIndex({ idRangoEdad: 1 }, { unique: true });
db.rangoEdad.createIndex({ nombreRangoEdad: 1 }, { unique: true });

// 2.5 territorio
db.createCollection("territorio", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["idTerritorio", "nombreTerritorio", "tipoTerritorio"],
    properties: {
      idTerritorio:     { bsonType: "int" },
      nombreTerritorio: { bsonType: "string" },
      tipoTerritorio:   { enum: ["nacional", "zona", "ciudad"] }
    }
  } }
});
db.territorio.insertMany([
  { idTerritorio: 3,  nombreTerritorio: "Nacional",            tipoTerritorio: "nacional" },
  { idTerritorio: 1,  nombreTerritorio: "Urbano",               tipoTerritorio: "zona" },
  { idTerritorio: 2,  nombreTerritorio: "Resto",                tipoTerritorio: "zona" },
  { idTerritorio: 11, nombreTerritorio: "Bogotá D.C.",          tipoTerritorio: "ciudad" },
  { idTerritorio: 5,  nombreTerritorio: "Medellín y A.M.",      tipoTerritorio: "ciudad" },
  { idTerritorio: 76, nombreTerritorio: "Cali y A.M.",          tipoTerritorio: "ciudad" },
  { idTerritorio: 8,  nombreTerritorio: "Barranquilla y A.M.",  tipoTerritorio: "ciudad" },
  { idTerritorio: 68, nombreTerritorio: "Bucaramanga y A.M.",   tipoTerritorio: "ciudad" },
  { idTerritorio: 17, nombreTerritorio: "Manizales y A.M.",     tipoTerritorio: "ciudad" },
  { idTerritorio: 66, nombreTerritorio: "Pereira y A.M.",       tipoTerritorio: "ciudad" },
  { idTerritorio: 54, nombreTerritorio: "Cúcuta y A.M.",        tipoTerritorio: "ciudad" },
  { idTerritorio: 52, nombreTerritorio: "Pasto",                tipoTerritorio: "ciudad" },
  { idTerritorio: 73, nombreTerritorio: "Ibagué",               tipoTerritorio: "ciudad" },
  { idTerritorio: 23, nombreTerritorio: "Montería",             tipoTerritorio: "ciudad" },
  { idTerritorio: 13, nombreTerritorio: "Cartagena",            tipoTerritorio: "ciudad" },
  { idTerritorio: 50, nombreTerritorio: "Villavicencio",        tipoTerritorio: "ciudad" }
]);
db.territorio.createIndex({ idTerritorio: 1 }, { unique: true });

// 2.6 ramaActividad
db.createCollection("ramaActividad", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["idRamaActividad", "nombreRama"],
    properties: { idRamaActividad: { bsonType: "int" }, nombreRama: { bsonType: "string" } }
  } }
});
db.ramaActividad.insertMany([
  { idRamaActividad: 1,  nombreRama: "Agricultura, ganadería, caza, silvicultura y pesca" },
  { idRamaActividad: 2,  nombreRama: "Suministro de electricidad, gas, agua y gestión de desechos" },
  { idRamaActividad: 3,  nombreRama: "Industrias manufactureras" },
  { idRamaActividad: 4,  nombreRama: "Construcción" },
  { idRamaActividad: 5,  nombreRama: "Comercio y reparación de vehículos" },
  { idRamaActividad: 6,  nombreRama: "Alojamiento y servicios de comida" },
  { idRamaActividad: 7,  nombreRama: "Transporte y almacenamiento" },
  { idRamaActividad: 8,  nombreRama: "Información y comunicaciones" },
  { idRamaActividad: 9,  nombreRama: "Actividades financieras y de seguros" },
  { idRamaActividad: 10, nombreRama: "Actividades inmobiliarias" },
  { idRamaActividad: 11, nombreRama: "Actividades profesionales, científicas, técnicas y servicios administrativos" },
  { idRamaActividad: 12, nombreRama: "Administración pública y defensa, educación y atención de la salud humana" },
  { idRamaActividad: 13, nombreRama: "Actividades artísticas, entretenimiento, recreación y otras actividades de servicios" }
]);
db.ramaActividad.createIndex({ idRamaActividad: 1 }, { unique: true });

// 2.7 auditoriaIndicador
// Sin trigger ni llave foránea real (Mongo no los tiene fuera de Atlas)
db.createCollection("auditoriaIndicador", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["idIndicador", "accionAuditoria", "usuarioBD", "fechaAuditoria"],
    properties: {
      idIndicador:            { bsonType: "int" },
      accionAuditoria:        { enum: ["INSERT", "UPDATE", "DELETE"] },
      valorAnteriorIndicador: { bsonType: ["double", "decimal", "null"] },
      valorNuevoIndicador:    { bsonType: ["double", "decimal", "null"] },
      usuarioBD:               { bsonType: "string" },
      fechaAuditoria:          { bsonType: "date" }
    }
  } }
});
db.auditoriaIndicador.createIndex({ idIndicador: 1 });
db.auditoriaIndicador.createIndex({ fechaAuditoria: 1 });

// ========================================================
// 3. Vistas
// ========================================================

// 3.1 v_infoPersonas: persona + condición laboral (ocupado/desocupado/inactivo/menor de 15)
db.createView("v_infoPersonas", "persona", [
  { $lookup: { from: "ocupado",    localField: "idPersona", foreignField: "idPersona", as: "oc" } },
  { $lookup: { from: "desocupado", localField: "idPersona", foreignField: "idPersona", as: "des" } },
  { $addFields: {
      pet: { $ifNull: ["$pet", { $cond: [{ $gte: ["$edad", 15] }, 1, 0] }] },
      ocupadoInfo: { $arrayElemAt: ["$oc", 0] },
      esOcupado: { $gt: [{ $size: "$oc" }, 0] },
      esDesocupado: { $gt: [{ $size: "$des" }, 0] }
  } },
  { $addFields: {
      condicion: { $switch: {
        branches: [
          { case: "$esOcupado", then: "Ocupado" },
          { case: "$esDesocupado", then: "Desocupado" },
          { case: { $eq: ["$pet", 1] }, then: "Inactivo" }
        ],
        default: "Menor de 15"
      } },
      // rango de edad (catálogo rangoEdad: 1=15-17, 2=18-28, 3=29-44, 4=45-59, 5=60 o más);
      // queda null para menores de 15, igual que el left join de la vista equivalente en SQL
      idRangoEdad: { $switch: {
        branches: [
          { case: { $and: [{ $gte: ["$edad", 15] }, { $lte: ["$edad", 17] }] }, then: 1 },
          { case: { $and: [{ $gte: ["$edad", 18] }, { $lte: ["$edad", 28] }] }, then: 2 },
          { case: { $and: [{ $gte: ["$edad", 29] }, { $lte: ["$edad", 44] }] }, then: 3 },
          { case: { $and: [{ $gte: ["$edad", 45] }, { $lte: ["$edad", 59] }] }, then: 4 },
          { case: { $gte: ["$edad", 60] }, then: 5 }
        ],
        default: null
      } },
      idRama:        "$ocupadoInfo.idRama",
      horasTrabajo:  "$ocupadoInfo.horasTrabajo",
      ingreso:       "$ocupadoInfo.ingreso",
      cotizaPension: "$ocupadoInfo.cotizaPension"
  } },
  { $project: { oc: 0, des: 0, ocupadoInfo: 0, esOcupado: 0, esDesocupado: 0 } }
]);

// 3.2 v_indicador_detalle: indicador con sus dimensiones escritas
db.createView("v_indicador_detalle", "indicador", [
  { $lookup: { from: "tipoIndicador", localField: "idTipoIndicador", foreignField: "idTipoIndicador", as: "ti" } },
  { $unwind: "$ti" },
  { $lookup: { from: "periodo", localField: "ti.idPeriodo", foreignField: "idPeriodo", as: "pe" } },
  { $unwind: "$pe" },
  { $lookup: { from: "usuario", localField: "idUsuario", foreignField: "idUsuario", as: "us" } },
  { $unwind: "$us" },
  { $lookup: { from: "sexo",          localField: "ti.idSexo",          foreignField: "idSexo",          as: "se" } },
  { $lookup: { from: "rangoEdad",     localField: "ti.idRangoEdad",     foreignField: "idRangoEdad",     as: "re" } },
  { $lookup: { from: "territorio",    localField: "ti.idTerritorio",    foreignField: "idTerritorio",    as: "te" } },
  { $lookup: { from: "ramaActividad", localField: "ti.idRamaActividad", foreignField: "idRamaActividad", as: "ra" } },
  { $project: {
      _id: 0,
      idIndicador:     1,
      anio:            "$pe.anio",
      mes:             "$pe.mes",
      nombreIndicador: "$ti.nombreIndicador",
      sexo:            { $ifNull: [{ $arrayElemAt: ["$se.nombreSexo", 0] }, "Todos"] },
      rangoEdad:       { $ifNull: [{ $arrayElemAt: ["$re.nombreRangoEdad", 0] }, "Todos"] },
      territorio:      { $ifNull: [{ $arrayElemAt: ["$te.nombreTerritorio", 0] }, "Nacional"] },
      ramaActividad:   { $ifNull: [{ $arrayElemAt: ["$ra.nombreRama", 0] }, "Todas"] },
      valorIndicador:  1,
      cvIndicador:     1,
      confiabilidad: { $switch: {
        branches: [
          { case: { $eq: ["$cvIndicador", null] }, then: "Sin dato" },
          { case: { $lte: ["$cvIndicador", 15] },  then: "Confiable" }
        ],
        default: "Baja confiabilidad"
      } },
      fechaCalculoIndicador: 1,
      usuario: "$us.nombreUsuario"
  } }
]);

// 3.3 v_resumen_laboral_periodo: cifras expandidas por periodo
db.createView("v_resumen_laboral_periodo", "v_infoPersonas", [
  { $group: {
      _id: "$idPeriodo",
      personasMuestra: { $sum: 1 },
      poblacion:       { $sum: "$factorExpansion" },
      pet:             { $sum: { $cond: [{ $eq: ["$pet", 1] }, "$factorExpansion", 0] } },
      ocupados:        { $sum: { $cond: [{ $eq: ["$condicion", "Ocupado"] }, "$factorExpansion", 0] } },
      desocupados:     { $sum: { $cond: [{ $eq: ["$condicion", "Desocupado"] }, "$factorExpansion", 0] } }
  } },
  { $project: { _id: 0, idPeriodo: "$_id", personasMuestra: 1, poblacion: 1, pet: 1, ocupados: 1, desocupados: 1 } },
  { $sort: { idPeriodo: 1 } }
]);

// 3.4 v_ocupados_por_rama: ocupados por rama de actividad y periodo
db.createView("v_ocupados_por_rama", "v_infoPersonas", [
  { $match: { condicion: "Ocupado" } },
  { $lookup: { from: "ramaActividad", localField: "idRama", foreignField: "idRamaActividad", as: "ra" } },
  { $unwind: "$ra" },
  { $group: {
      _id: { idPeriodo: "$idPeriodo", idRamaActividad: "$idRama", nombreRama: "$ra.nombreRama" },
      ocupadosMuestra:     { $sum: 1 },
      ocupadosExpandidos:  { $sum: "$factorExpansion" }
  } },
  { $project: {
      _id: 0, idPeriodo: "$_id.idPeriodo", idRamaActividad: "$_id.idRamaActividad",
      nombreRama: "$_id.nombreRama", ocupadosMuestra: 1, ocupadosExpandidos: 1
  } }
]);

// ========================================================
// Agregaciones y Consultas
// ========================================================

// persona: población expandida por periodo
db.persona.aggregate([
  { $group: { _id: "$idPeriodo", personasMuestra: { $sum: 1 }, personasExpandidas: { $sum: "$factorExpansion" } } },
  { $sort: { _id: 1 } }
]);

// persona: personas por sexo en un periodo
db.persona.aggregate([
  { $match: { idPeriodo: 202601 } },
  { $group: { _id: "$idSexo", cantidadPersonas: { $sum: 1 }, personasExpandidas: { $sum: "$factorExpansion" } } }
]);

// ocupado: ingreso mínimo, máximo y promedio
db.ocupado.aggregate([
  { $match: { ingreso: { $gt: 0 } } },
  { $group: { _id: null, minimo: { $min: "$ingreso" }, maximo: { $max: "$ingreso" }, promedio: { $avg: "$ingreso" } } }
]);

// ocupado: las 5 ramas con más ocupados
db.ocupado.aggregate([
  { $match: { idRama: { $ne: null } } },
  { $group: { _id: "$idRama", ocupados: { $sum: 1 } } },
  { $sort: { ocupados: -1 } },
  { $limit: 5 }
]);

// desocupado: total de desocupados
db.desocupado.countDocuments();

// usuario: usuarios por rol
db.usuario.aggregate([
  { $group: { _id: "$rolUsuario", usuarios: { $sum: 1 } } }
]);

// persona + ocupado + sexo: ocupados expandidos por sexo (join equivalente a persona+ocupado+sexo)
db.ocupado.aggregate([
  { $lookup: { from: "persona", localField: "idPersona", foreignField: "idPersona", as: "p" } },
  { $unwind: "$p" },
  { $match: { "p.idPeriodo": 202601 } },
  { $lookup: { from: "sexo", localField: "p.idSexo", foreignField: "idSexo", as: "s" } },
  { $unwind: "$s" },
  { $group: { _id: "$s.nombreSexo", ocupadosMuestra: { $sum: 1 }, ocupadosExpandidos: { $sum: "$p.factorExpansion" } } }
]);

// indicador + tipoIndicador: tasa de desocupación nacional por mes (vía la vista v_indicador_detalle)
db.v_indicador_detalle.find(
  { nombreIndicador: "Tasa de desocupación", territorio: "Nacional", sexo: "Todos", rangoEdad: "Todos", ramaActividad: "Todas" },
  { anio: 1, mes: 1, valorIndicador: 1, cvIndicador: 1 }
).sort({ anio: 1, mes: 1 });

// Verificación: cuántos indicadores quedaron calculados por periodo (equivalente al join +
// group by que se usa en MySQL para confirmar lo mismo). Debe dar los mismos números que allá.
db.indicador.aggregate([
  { $lookup: { from: "tipoIndicador", localField: "idTipoIndicador", foreignField: "idTipoIndicador", as: "t" } },
  { $unwind: "$t" },
  { $group: { _id: "$t.idPeriodo", indicadores: { $sum: 1 } } },
  { $sort: { _id: 1 } }
]);

// Tablero "Resumen": Población total, PET, PEA y TGP nacionales del último mes, sin tocar persona/ocupado/desocupado
db.v_indicador_detalle.find(
  { nombreIndicador: { $in: ["Población total", "PET", "PEA", "TGP"] },
    territorio: "Nacional", sexo: "Todos", rangoEdad: "Todos", ramaActividad: "Todas" },
  { nombreIndicador: 1, anio: 1, mes: 1, valorIndicador: 1 }
).sort({ anio: 1, mes: 1 });

// Tablero "Ocupados": tasa de ocupación de una ciudad puntual (una sola dimensión a la vez, como quedó definida)
db.v_indicador_detalle.find(
  { nombreIndicador: "Tasa de ocupación", territorio: "Medellín y A.M.", sexo: "Todos", rangoEdad: "Todos", ramaActividad: "Todas" },
  { anio: 1, mes: 1, valorIndicador: 1, cvIndicador: 1 }
).sort({ anio: 1, mes: 1 });

// Tablero "Ocupados": Ocupados por rama de actividad del último mes (gráfica de barras del tablero)
db.v_indicador_detalle.find(
  { nombreIndicador: "Ocupados", territorio: "Nacional", sexo: "Todos", rangoEdad: "Todos", ramaActividad: { $ne: "Todas" } },
  { ramaActividad: 1, anio: 1, mes: 1, valorIndicador: 1 }
).sort({ valorIndicador: -1 });

// Tablero "Desocupados": tasa de desocupación por sexo y por rango de edad del último mes
db.v_indicador_detalle.find(
  { nombreIndicador: "Tasa de desocupación", territorio: "Nacional", ramaActividad: "Todas",
    $or: [ { sexo: { $ne: "Todos" }, rangoEdad: "Todos" }, { sexo: "Todos", rangoEdad: { $ne: "Todos" } } ] },
  { sexo: 1, rangoEdad: 1, anio: 1, mes: 1, valorIndicador: 1 }
);

// Tablero "Por sexo"/"Por edad"/"Por rama": el mismo sexo, rango de edad o rama, pero solo en zona urbana
// (cruce sexo×zona, rango×zona o rama×zona — ya viene en el CSV de tipoIndicador/indicador, no es nada especial en Mongo)
db.v_indicador_detalle.find(
  { nombreIndicador: "Tasa de ocupación", sexo: "Mujer", territorio: "Urbano", rangoEdad: "Todos", ramaActividad: "Todas" },
  { anio: 1, mes: 1, valorIndicador: 1 }
).sort({ anio: 1, mes: 1 });

// v_resumen_laboral_periodo y v_ocupados_por_rama: siguen existiendo para explorar el microdato,
// pero el tablero ya no las necesita — todo lo anterior sale de indicador/v_indicador_detalle.
db.v_resumen_laboral_periodo.find().sort({ idPeriodo: 1 });
db.v_ocupados_por_rama.find({ idPeriodo: 202601 }).sort({ ocupadosExpandidos: -1 });

// ========================================================
// 5. Auditoría manual de indicador (sin triggers: se llama a mano, como con cualquier
//    otra operación en Mongo, p. ej. createIndex)
// ========================================================

function registrarAuditoriaIndicador(idIndicador, accion, valorAnterior, valorNuevo, usuarioBD) {
  db.auditoriaIndicador.insertOne({
    idIndicador: idIndicador,
    accionAuditoria: accion,
    valorAnteriorIndicador: valorAnterior,
    valorNuevoIndicador: valorNuevo,
    usuarioBD: usuarioBD,
    fechaAuditoria: new Date()
  });
}

