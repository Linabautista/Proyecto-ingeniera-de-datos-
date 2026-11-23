// ========================================================
// Del microdato al indicador - Entregable Final (versión MongoDB)
// Realizado por: Lina Bautista, Jessica Gil, Mariana Ussa y Jorge Reza
// ========================================================

db = db.getSiblingDB('proyecto_geih');

// ========================================================
// 1. Colecciones de las tablas grandes (se cargan por CSV)
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
// 4. Consultas para el tablero
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
// 5. Consultas específicas por colección (7 por colección, equivalentes a las de
//    los conteos ponderados fijan un periodo (202601, enero de 2026)
//    para no contar dos veces.
// ========================================================

// --- persona ---
// 1. personas mayores de 20 años en enero de 2026
db.persona.aggregate([
  { $match: { idPeriodo: 202601, edad: { $gt: 20 } } },
  { $group: { _id: null, personasMuestra: { $sum: 1 }, personasExpandidas: { $sum: "$factorExpansion" } } }
]);
// 2. personas entre 18 y 30 años en enero de 2026
db.persona.aggregate([
  { $match: { idPeriodo: 202601, edad: { $gte: 18, $lte: 30 } } },
  { $group: { _id: null, personasMuestra: { $sum: 1 }, personasExpandidas: { $sum: "$factorExpansion" } } }
]);
// 3. mujeres en enero de 2026
db.persona.aggregate([
  { $match: { idPeriodo: 202601, idSexo: 2 } },
  { $group: { _id: null, mujeresMuestra: { $sum: 1 }, mujeresExpandidas: { $sum: "$factorExpansion" } } }
]);
// 4. población de 2026 por periodo
db.persona.aggregate([
  { $group: { _id: "$idPeriodo", personasMuestra: { $sum: 1 }, personasExpandidas: { $sum: "$factorExpansion" } } },
  { $sort: { _id: 1 } }
]);
// 5. población en edad de trabajar por periodo
db.persona.aggregate([
  { $match: { pet: 1 } },
  { $group: { _id: "$idPeriodo", petMuestra: { $sum: 1 }, petExpandida: { $sum: "$factorExpansion" } } },
  { $sort: { _id: 1 } }
]);
// 6. personas por sexo en enero de 2026
db.persona.aggregate([
  { $match: { idPeriodo: 202601 } },
  { $group: { _id: "$idSexo", cantidadPersonas: { $sum: 1 }, personasExpandidas: { $sum: "$factorExpansion" } } }
]);
// 7. edad promedio ponderada en enero de 2026
db.persona.aggregate([
  { $match: { idPeriodo: 202601 } },
  { $group: { _id: null, sumaPonderada: { $sum: { $multiply: ["$edad", "$factorExpansion"] } }, sumaPesos: { $sum: "$factorExpansion" } } },
  { $project: { _id: 0, edadPromedio: { $round: [{ $divide: ["$sumaPonderada", "$sumaPesos"] }, 1] } } }
]);

// --- ocupado ---
// 1. ocupados con jornada superior a 48 horas semanales
db.ocupado.find({ horasTrabajo: { $gt: 48 } }, { idPersona: 1, idRama: 1, horasTrabajo: 1 }).sort({ horasTrabajo: -1 });
// 2. ocupados que no cotizan a pensión
db.ocupado.countDocuments({ cotizaPension: 0 });
// 3. ingreso mínimo, máximo y promedio de los ocupados con ingreso
db.ocupado.aggregate([
  { $match: { ingreso: { $gt: 0 } } },
  { $group: { _id: null, minimo: { $min: "$ingreso" }, maximo: { $max: "$ingreso" }, promedio: { $avg: "$ingreso" } } }
]);
// 4. horas semanales promedio de trabajo
db.ocupado.aggregate([
  { $match: { horasTrabajo: { $ne: null } } },
  { $group: { _id: null, horasPromedio: { $avg: "$horasTrabajo" } } }
]);
// 5. ocupados sin ingreso reportado o con ingreso cero
db.ocupado.find({ $or: [{ ingreso: null }, { ingreso: 0 }] }, { idPersona: 1, idRama: 1, ingreso: 1 });
// 6. las 5 ramas con más ocupados en la muestra
db.ocupado.aggregate([
  { $match: { idRama: { $ne: null } } },
  { $group: { _id: "$idRama", ocupados: { $sum: 1 } } },
  { $sort: { ocupados: -1 } },
  { $limit: 5 }
]);
// 7. ingreso promedio por rama (ramas con al menos 5 ocupados con ingreso)
db.ocupado.aggregate([
  { $match: { ingreso: { $gt: 0 } } },
  { $group: { _id: "$idRama", ocupados: { $sum: 1 }, ingresoPromedio: { $avg: "$ingreso" } } },
  { $match: { ocupados: { $gte: 5 } } },
  { $sort: { ingresoPromedio: -1 } }
]);

// --- desocupado ---
// 1. total de desocupados en la muestra
db.desocupado.countDocuments();
// 2. primer y último identificador de desocupado
db.desocupado.aggregate([
  { $group: { _id: null, primero: { $min: "$idPersona" }, ultimo: { $max: "$idPersona" } } }
]);
// 3. los 10 primeros desocupados por identificador
db.desocupado.find().sort({ idPersona: 1 }).limit(10);
// 4. los 5 últimos desocupados por identificador
db.desocupado.find().sort({ idPersona: -1 }).limit(5);
// 5. desocupados cuyo identificador empieza por 5
db.desocupado.countDocuments({ idPersona: /^5/ });
// 6. longitud de los identificadores de desocupado
db.desocupado.aggregate([
  { $group: { _id: { $strLenCP: "$idPersona" }, desocupados: { $sum: 1 } } }
]);
// 7. directorios con más de un desocupado (primeros 8 dígitos del identificador)
db.desocupado.aggregate([
  { $group: { _id: { $substrCP: ["$idPersona", 0, 8] }, desocupados: { $sum: 1 } } },
  { $match: { desocupados: { $gt: 1 } } },
  { $sort: { desocupados: -1 } }
]);

// --- usuario ---
// 1. usuarios por rol
db.usuario.aggregate([{ $group: { _id: "$rolUsuario", usuarios: { $sum: 1 } } }]);
// 2. usuarios activos e inactivos por rol
db.usuario.aggregate([
  { $group: { _id: "$rolUsuario",
      activos: { $sum: { $cond: ["$activo", 1, 0] } },
      inactivos: { $sum: { $cond: ["$activo", 0, 1] } } } },
  { $sort: { _id: 1 } }
]);
// 3. usuarios ordenados por nombre
db.usuario.find({}, { nombreUsuario: 1, rolUsuario: 1 }).sort({ nombreUsuario: 1 });
// 4. usuarios inactivos
db.usuario.find({ activo: false }, { idUsuario: 1, nombreUsuario: 1, rolUsuario: 1 });
// 5. usuarios con rol de investigador o ingeniero de datos
db.usuario.find({ rolUsuario: { $in: ["investigador", "ingeniero de datos"] } }, { nombreUsuario: 1, rolUsuario: 1 })
  .sort({ rolUsuario: 1, nombreUsuario: 1 });
// 6. usuarios por dominio de correo
db.usuario.aggregate([
  { $group: { _id: { $arrayElemAt: [{ $split: ["$correoUsuario", "@"] }, 1] }, usuarios: { $sum: 1 } } }
]);
// 7. usuarios cuyo correo contiene "andres"
db.usuario.find({ correoUsuario: /andres/i }, { nombreUsuario: 1, correoUsuario: 1 });

// --- periodo (catálogo vigente: 2026, enero a septiembre) ---
// 1. periodos del primer trimestre
db.periodo.find({ mes: { $gte: 1, $lte: 3 } }).sort({ mes: 1 });
// 2. periodos del segundo trimestre
db.periodo.find({ mes: { $gte: 4, $lte: 6 } }).sort({ mes: 1 });
// 3. periodos del tercer trimestre
db.periodo.find({ mes: { $gte: 7, $lte: 9 } }).sort({ mes: 1 });
// 4. último periodo del catálogo
db.periodo.find().sort({ idPeriodo: -1 }).limit(1);
// 5. primer periodo del catálogo
db.periodo.find().sort({ idPeriodo: 1 }).limit(1);
// 6. cantidad de periodos del catálogo
db.periodo.countDocuments();
// 7. periodo correspondiente a septiembre
db.periodo.findOne({ mes: 9 });

// --- sexo ---
// 1. categoría con identificador 1
db.sexo.findOne({ idSexo: 1 });
// 2. categorías cuyo nombre empieza por "M"
db.sexo.find({ nombreSexo: /^M/ });
// 3. cantidad de categorías
db.sexo.countDocuments();
// 4. categorías ordenadas por nombre de forma descendente
db.sexo.find().sort({ nombreSexo: -1 });
// 5. longitud del nombre de cada categoría
db.sexo.aggregate([{ $project: { nombreSexo: 1, longitud: { $strLenCP: "$nombreSexo" } } }]);
// 6. nombres en mayúsculas
db.sexo.aggregate([{ $project: { idSexo: 1, nombreMayuscula: { $toUpper: "$nombreSexo" } } }]);
// 7. identificador más alto del catálogo
db.sexo.aggregate([{ $group: { _id: null, ultimoId: { $max: "$idSexo" } } }]);

// --- rangoEdad ---
// 1. rangos ordenados por edad inicial
db.rangoEdad.find({}, { nombreRangoEdad: 1, edadInicial: 1, edadFinal: 1 }).sort({ edadInicial: 1 });
// 2. rango abierto (sin edad final)
db.rangoEdad.find({ edadFinal: null });
// 3. amplitud en años de cada rango cerrado
db.rangoEdad.aggregate([
  { $match: { edadFinal: { $ne: null } } },
  { $project: { nombreRangoEdad: 1, anios: { $add: [{ $subtract: ["$edadFinal", "$edadInicial"] }, 1] } } }
]);
// 4. rango al que pertenece una persona de 30 años
db.rangoEdad.findOne({ edadInicial: { $lte: 30 }, $or: [{ edadFinal: null }, { edadFinal: { $gte: 30 } }] });
// 5. rangos cerrados con amplitud mayor a 15 años
db.rangoEdad.aggregate([
  { $match: { edadFinal: { $ne: null } } },
  { $project: { nombreRangoEdad: 1, anios: { $add: [{ $subtract: ["$edadFinal", "$edadInicial"] }, 1] } } },
  { $match: { anios: { $gt: 15 } } }
]);
// 6. edad inicial más baja del catálogo
db.rangoEdad.aggregate([{ $group: { _id: null, edadMinima: { $min: "$edadInicial" } } }]);
// 7. rangos que empiezan después de los 25 años
db.rangoEdad.find({ edadInicial: { $gt: 25 } }).sort({ edadInicial: 1 });

// --- territorio ---
// 1. territorios por tipo
db.territorio.aggregate([{ $group: { _id: "$tipoTerritorio", territorios: { $sum: 1 } } }]);
// 2. ciudades en orden alfabético
db.territorio.find({ tipoTerritorio: "ciudad" }, { nombreTerritorio: 1 }).sort({ nombreTerritorio: 1 });
// 3. áreas metropolitanas (nombre con "A.M.")
db.territorio.find({ nombreTerritorio: /A\.M\./ });
// 4. zonas (urbano y rural)
db.territorio.find({ tipoTerritorio: "zona" });
// 5. territorio nacional
db.territorio.find({ tipoTerritorio: "nacional" });
// 6. ciudades con código de territorio mayor a 50
db.territorio.find({ tipoTerritorio: "ciudad", idTerritorio: { $gt: 50 } }, { idTerritorio: 1, nombreTerritorio: 1 }).sort({ idTerritorio: 1 });
// 7. ciudades que no son área metropolitana
db.territorio.find({ tipoTerritorio: "ciudad", nombreTerritorio: { $not: /A\.M\./ } }, { nombreTerritorio: 1 }).sort({ nombreTerritorio: 1 });

// --- ramaActividad ---
// 1. las cinco primeras ramas del catálogo
db.ramaActividad.find({ idRamaActividad: { $gte: 1, $lte: 5 } });
// 2. ramas cuyo nombre incluye "comercio"
db.ramaActividad.find({ nombreRama: /comercio/i });
// 3. ramas ordenadas alfabéticamente
db.ramaActividad.find().sort({ nombreRama: 1 });
// 4. rama con el nombre más largo
db.ramaActividad.aggregate([
  { $project: { nombreRama: 1, longitud: { $strLenCP: "$nombreRama" } } },
  { $sort: { longitud: -1 } },
  { $limit: 1 }
]);
// 5. cantidad de ramas del catálogo
db.ramaActividad.countDocuments();
// 6. ramas cuyo nombre incluye la palabra "servicios"
db.ramaActividad.find({ nombreRama: /servicios/i });
// 7. ramas con identificador entre 6 y 10
db.ramaActividad.find({ idRamaActividad: { $gte: 6, $lte: 10 } });

// --- tipoIndicador ---
// 1. cantidad de definiciones por indicador
db.tipoIndicador.aggregate([
  { $group: { _id: "$nombreIndicador", definiciones: { $sum: 1 } } },
  { $sort: { definiciones: -1 } }
]);
// 2. definiciones nacionales sin ninguna otra desagregación
db.tipoIndicador.find(
  { idTerritorio: 3, idSexo: null, idRangoEdad: null, idRamaActividad: null },
  { idTipoIndicador: 1, nombreIndicador: 1, idPeriodo: 1 }
).sort({ idPeriodo: 1, nombreIndicador: 1 });
// 3. definiciones por periodo y periodicidad
db.tipoIndicador.aggregate([
  { $group: { _id: { idPeriodo: "$idPeriodo", periodicidad: "$periodicidad" }, definiciones: { $sum: 1 } } },
  { $sort: { "_id.idPeriodo": 1 } }
]);
// 4. definiciones nacionales de la tasa de desocupación con su fórmula
db.tipoIndicador.find(
  { nombreIndicador: "Tasa de desocupación", idTerritorio: 3, idSexo: null, idRangoEdad: null, idRamaActividad: null },
  { idTipoIndicador: 1, idPeriodo: 1, formula: 1 }
);
// 5. definiciones de enero de 2026 desagregadas por sexo
db.tipoIndicador.find(
  { idPeriodo: 202601, idSexo: { $ne: null } },
  { idTipoIndicador: 1, nombreIndicador: 1, idSexo: 1 }
).sort({ nombreIndicador: 1, idSexo: 1 });
// 6. definiciones de enero de 2026 desagregadas por rama de actividad
db.tipoIndicador.find(
  { idPeriodo: 202601, idRamaActividad: { $ne: null } },
  { nombreIndicador: 1, idRamaActividad: 1 }
).sort({ nombreIndicador: 1, idRamaActividad: 1 });
// 7. definiciones de enero de 2026 desagregadas por rango de edad
db.tipoIndicador.find(
  { idPeriodo: 202601, idRangoEdad: { $ne: null } },
  { nombreIndicador: 1, idRangoEdad: 1 }
).sort({ nombreIndicador: 1, idRangoEdad: 1 });

// --- indicador ---
// 1. indicadores con baja confiabilidad (CV superior a 15 %)
db.indicador.countDocuments({ cvIndicador: { $gt: 15 } });
// 2. indicadores con confiabilidad aceptable (CV entre 5 % y 15 %)
db.indicador.find(
  { cvIndicador: { $gte: 5, $lte: 15 } },
  { idIndicador: 1, idTipoIndicador: 1, valorIndicador: 1, cvIndicador: 1 }
).sort({ cvIndicador: 1 }).limit(10);
// 3. valor mínimo, máximo y promedio de los indicadores
db.indicador.aggregate([
  { $group: { _id: null, minimo: { $min: "$valorIndicador" }, maximo: { $max: "$valorIndicador" }, promedio: { $avg: "$valorIndicador" } } }
]);
// 4. indicadores calculados por día
db.indicador.aggregate([
  { $group: { _id: "$fechaCalculoIndicador", indicadores: { $sum: 1 } } },
  { $sort: { _id: 1 } }
]);
// 5. indicadores calculados por cada usuario
db.indicador.aggregate([
  { $group: { _id: "$idUsuario", indicadores: { $sum: 1 } } },
  { $sort: { indicadores: -1 } }
]);
// 6. los 10 indicadores con mayor valor
db.indicador.find(
  {},
  { idIndicador: 1, idTipoIndicador: 1, valorIndicador: 1, cvIndicador: 1 }
).sort({ valorIndicador: -1 }).limit(10);
// 7. indicadores clasificados por confiabilidad según su CV
db.indicador.aggregate([
  { $group: { _id: {
      $switch: { branches: [
        { case: { $eq: ["$cvIndicador", null] }, then: "sin CV" },
        { case: { $lte: ["$cvIndicador", 5] }, then: "alta (CV hasta 5 %)" },
        { case: { $lte: ["$cvIndicador", 15] }, then: "aceptable (CV hasta 15 %)" }
      ], default: "baja (CV mayor a 15 %)" } },
      indicadores: { $sum: 1 } } }
]);

// ========================================================
// 6. Modificaciones: solo usuario se modifica. persona/ocupado/desocupado son el microdato del
//    DANE (no se altera, solo se agregan periodos nuevos); tipoIndicador/indicador son datos
//    derivados que se recalculan completos con sp_calcular_periodo/cargar_mongo.py, no se editan
//    a mano fila por fila; auditoriaIndicador es un registro de solo lectura. En SQL esto mismo
//    lo bloquean los triggers trg_persona_bu/bd, trg_ocupado_bu/bd, trg_desocupado_bu/bd y
//    trg_auditoria_bu/bd — Mongo Community no tiene triggers, así que aquí queda como una regla
//    de uso
// ========================================================

// Inactivar un usuario sin eliminar su registro (no se borra: se conserva el historial de qué
// usuario calculó cada indicador).
db.usuario.updateOne({ idUsuario: 1 }, { $set: { activo: false } });
// Verificación
db.usuario.findOne({ idUsuario: 1 });
// Revertir (como el rollback de la transacción equivalente en SQL): deja la base intacta
// para que la prueba se pueda repetir.
db.usuario.updateOne({ idUsuario: 1 }, { $set: { activo: true } });

// ========================================================
// 7. Auditoría manual de indicador (sin triggers: se llama a mano, como con cualquier
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

