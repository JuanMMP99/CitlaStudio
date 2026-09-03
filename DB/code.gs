/**
 * CITLA STUDIO - BACKEND (Google Apps Script + Google Sheets)
 * ---------------------------------------------------------------
 * Este script hace DOS trabajos:
 *
 * 1) Sirve una API JSON (doGet / doPost) que consume el front de Angular
 *    (público) para: listar servicios activos, listar dinámicas activas,
 *    consultar horarios disponibles, crear una cita y enviar un mensaje
 *    de contacto. Todo con validaciones en servidor.
 *
 * 2) Sirve el panel de administración (admin.html) como una mini app web
 *    aparte, que usa google.script.run (sin problemas de CORS) para hacer
 *    TODO lo que el negocio necesita: confirmar/cancelar/eliminar citas,
 *    agendar citas manuales, administrar dinámicas, servicios y mensajes.
 *
 * ------------------------- INSTALACIÓN -------------------------
 * 1. Crea una hoja de cálculo nueva en Google Sheets.
 * 2. Extensiones > Apps Script.
 * 3. Pega este archivo como Code.gs y crea admin.html (pestaña HTML)
 *    con el contenido del archivo admin.html que te entregué aparte.
 * 4. Corre UNA vez la función `setupInicial` (menú Ejecutar > setupInicial)
 *    para crear las hojas, encabezados y la contraseña de admin.
 *    Autoriza los permisos que te pida Google.
 * 5. Implementar > Nueva implementación > tipo "Aplicación web".
 *      - Ejecutar como: Yo (tu cuenta)
 *      - Quién tiene acceso: Cualquier usuario
 * 6. Copia la URL que termina en /exec. Esa es:
 *      - La URL que Angular usará como API_URL.
 *      - La URL + "?page=admin" es el panel de administración
 *        (ej: https://script.google.com/macros/s/XXXX/exec?page=admin)
 * 7. Cambia la contraseña por defecto (ver CONFIG.ADMIN_PASSWORD_DEFAULT)
 *    desde el panel admin o modificando la propiedad del script.
 * ------------------------------------------------------------------
 */

// ==================== CONFIGURACIÓN ====================

const SHEET_CITAS = 'Citas';
const SHEET_SERVICIOS = 'Servicios';
const SHEET_DINAMICAS = 'Dinamicas';
const SHEET_MENSAJES = 'Mensajes';

const CONFIG = {
  ADMIN_PASSWORD_DEFAULT: 'citla2024', // Cámbiala después del setup inicial
  INTERVALO_MIN: 60, // minutos entre horarios disponibles
  HORARIOS: {
    // 0 = domingo ... 6 = sábado
    0: null, // cerrado
    1: { inicio: '09:00', fin: '19:00' },
    2: { inicio: '09:00', fin: '19:00' },
    3: { inicio: '09:00', fin: '19:00' },
    4: { inicio: '09:00', fin: '19:00' },
    5: { inicio: '09:00', fin: '19:00' },
    6: { inicio: '10:00', fin: '17:00' }
  }
};

const HEADERS = {
  [SHEET_CITAS]: ['ID', 'Nombre', 'Telefono', 'Correo', 'Servicio', 'Fecha', 'Hora', 'Notas', 'Estado', 'Origen', 'FechaCreacion'],
  [SHEET_SERVICIOS]: ['ID', 'Nombre', 'DuracionMin', 'Activo'],
  [SHEET_DINAMICAS]: ['ID', 'Titulo', 'Descripcion', 'Tipo', 'Activa', 'FechaCreacion'],
  [SHEET_MENSAJES]: ['ID', 'Nombre', 'Correo', 'Asunto', 'Mensaje', 'Fecha', 'Leido']
};

// ==================== SETUP (correr una sola vez) ====================

function setupInicial() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  Object.keys(HEADERS).forEach(function (name) {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    sh.clear();
    sh.appendRow(HEADERS[name]);
    sh.setFrozenRows(1);
  });

  // Elimina la hoja "Hoja 1" / "Sheet1" por defecto si quedó vacía
  const def = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
  if (def && ss.getSheets().length > 1) ss.deleteSheet(def);

  // Servicios de ejemplo (edítalos luego desde el panel admin)
  const servicios = ss.getSheetByName(SHEET_SERVICIOS);
  servicios.appendRow([nextId(servicios), 'Manicure', 60, true]);
  servicios.appendRow([nextId(servicios), 'Uñas Acrílicas', 90, true]);
  servicios.appendRow([nextId(servicios), 'Extensiones de pestañas', 90, true]);
  servicios.appendRow([nextId(servicios), 'Tratamiento facial', 60, true]);

  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('ADMIN_PASSWORD')) {
    props.setProperty('ADMIN_PASSWORD', CONFIG.ADMIN_PASSWORD_DEFAULT);
  }

  Logger.log('Setup completo. Contraseña de admin inicial: ' + CONFIG.ADMIN_PASSWORD_DEFAULT);
}

// ==================== ENTRADAS WEB ====================

function doGet(e) {
  const params = e.parameter || {};

  if (params.page === 'admin') {
    return HtmlService.createHtmlOutputFromFile('admin')
      .setTitle('Citla Studio - Administración')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }

  if (params.action) {
    return handleApi(params.action, params);
  }

  return jsonResponse({ ok: true, mensaje: 'Citla Studio API. Usa ?action=... o ?page=admin' });
}

function doPost(e) {
  let body = {};
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ ok: false, error: 'JSON inválido en la petición.' });
  }
  return handleApi(body.action, body.data || {});
}

function handleApi(action, data) {
  try {
    switch (action) {
      case 'getServicios':
        return jsonResponse({ ok: true, servicios: getServiciosActivos() });

      case 'getDinamicas':
        return jsonResponse({ ok: true, dinamicas: getDinamicasActivas() });

      case 'getHorariosDisponibles':
        return jsonResponse({ ok: true, horarios: getHorariosDisponibles(data.fecha) });

      case 'crearCita':
        return jsonResponse(crearCitaPublica(data));

      case 'enviarMensaje':
        return jsonResponse(enviarMensajePublico(data));

      default:
        return jsonResponse({ ok: false, error: 'Acción no reconocida: ' + action });
    }
  } catch (err) {
    return jsonResponse({ ok: false, error: 'Error del servidor: ' + err.message });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ==================== HELPERS DE HOJA ====================

function sheet(name) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sh) throw new Error('No existe la hoja "' + name + '". Corre setupInicial().');
  return sh;
}

function nextId(sh) {
  const last = sh.getLastRow();
  if (last <= 1) return 1;
  const ids = sh.getRange(2, 1, last - 1, 1).getValues().flat().map(Number).filter(function (n) { return !isNaN(n); });
  return ids.length ? Math.max.apply(null, ids) + 1 : 1;
}

function sheetToObjects(sh) {
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1).map(function (row) {
    const obj = {};
    headers.forEach(function (h, i) { obj[h] = row[i]; });
    return obj;
  });
}

function findRowById(sh, id) {
  const values = sh.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) return i + 1; // fila real (1-indexed, +1 por encabezado)
  }
  return -1;
}

function formatFecha(fecha) {
  if (Object.prototype.toString.call(fecha) === '[object Date]') {
    return Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(fecha);
}

// ==================== VALIDACIONES ====================

function esCorreoValido(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(correo || '').trim());
}

function esTelefonoValido(telefono) {
  return /^[0-9]{10}$/.test(String(telefono || '').trim());
}

function esFechaValida(fecha) {
  const d = new Date(fecha + 'T00:00:00');
  return !isNaN(d.getTime());
}

function obtenerHorarioDia(fecha) {
  const d = new Date(fecha + 'T00:00:00');
  return CONFIG.HORARIOS[d.getDay()] || null;
}

function generarSlotsDia(fecha) {
  const horario = obtenerHorarioDia(fecha);
  if (!horario) return [];

  const slots = [];
  const [hIni, mIni] = horario.inicio.split(':').map(Number);
  const [hFin, mFin] = horario.fin.split(':').map(Number);

  let cursor = hIni * 60 + mIni;
  const fin = hFin * 60 + mFin;

  while (cursor < fin) {
    const h = Math.floor(cursor / 60);
    const m = cursor % 60;
    slots.push(
      (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m)
    );
    cursor += CONFIG.INTERVALO_MIN;
  }
  return slots;
}

/**
 * Valida los datos de una cita (nombre, telefono, correo, servicio, fecha, hora).
 * Devuelve { valido: boolean, errores: string[] }
 */
function validarDatosCita(data) {
  const errores = [];

  if (!data.nombre || String(data.nombre).trim().length < 3) {
    errores.push('El nombre debe tener al menos 3 caracteres.');
  }
  if (!esTelefonoValido(data.telefono)) {
    errores.push('El teléfono debe tener exactamente 10 dígitos.');
  }
  if (!esCorreoValido(data.correo)) {
    errores.push('El correo electrónico no es válido.');
  }
  if (!data.servicio || String(data.servicio).trim() === '') {
    errores.push('Selecciona un servicio.');
  }
  if (!data.fecha || !esFechaValida(data.fecha)) {
    errores.push('La fecha no es válida.');
  } else {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaCita = new Date(data.fecha + 'T00:00:00');
    if (fechaCita < hoy) {
      errores.push('No se pueden agendar citas en fechas pasadas.');
    }
    const horario = obtenerHorarioDia(data.fecha);
    if (!horario) {
      errores.push('Ese día no hay servicio disponible.');
    } else if (!data.hora) {
      errores.push('Selecciona una hora.');
    } else if (generarSlotsDia(data.fecha).indexOf(data.hora) === -1) {
      errores.push('La hora seleccionada está fuera del horario de atención.');
    }
  }

  return { valido: errores.length === 0, errores: errores };
}

/**
 * Revisa contra la hoja Citas si el slot fecha+hora ya está ocupado
 * (una cita Pendiente o Confirmada bloquea el horario; Cancelada no).
 */
function horaEstaDisponible(fecha, hora, idExcluir) {
  const sh = sheet(SHEET_CITAS);
  const citas = sheetToObjects(sh);
  return !citas.some(function (c) {
    if (idExcluir && String(c.ID) === String(idExcluir)) return false;
    return formatFecha(c.Fecha) === fecha && c.Hora === hora && c.Estado !== 'Cancelada';
  });
}

// ==================== SERVICIOS (lectura pública) ====================

function getServiciosActivos() {
  return sheetToObjects(sheet(SHEET_SERVICIOS))
    .filter(function (s) { return s.Activo === true || s.Activo === 'TRUE' || s.Activo === 'true'; })
    .map(function (s) { return { id: s.ID, nombre: s.Nombre, duracion: s.DuracionMin }; });
}

// ==================== DINÁMICAS (lectura pública) ====================

function getDinamicasActivas() {
  return sheetToObjects(sheet(SHEET_DINAMICAS))
    .filter(function (d) { return d.Activa === true || d.Activa === 'TRUE' || d.Activa === 'true'; })
    .map(function (d) { return { id: d.ID, titulo: d.Titulo, descripcion: d.Descripcion, tipo: d.Tipo }; });
}

// ==================== HORARIOS DISPONIBLES (lectura pública) ====================

function getHorariosDisponibles(fecha) {
  if (!fecha || !esFechaValida(fecha)) return [];
  const slots = generarSlotsDia(fecha);
  return slots.map(function (hora) {
    return { hora: hora, disponible: horaEstaDisponible(fecha, hora, null) };
  });
}

// ==================== CREAR CITA (público - desde Angular) ====================

function crearCitaPublica(data) {
  const validacion = validarDatosCita(data);
  if (!validacion.valido) {
    return { ok: false, errores: validacion.errores };
  }
  if (!horaEstaDisponible(data.fecha, data.hora, null)) {
    return { ok: false, errores: ['Lo sentimos, ese horario ya fue tomado. Elige otro.'] };
  }

  const sh = sheet(SHEET_CITAS);
  const id = nextId(sh);
  sh.appendRow([
    id,
    String(data.nombre).trim(),
    String(data.telefono).trim(),
    String(data.correo).trim(),
    String(data.servicio).trim(),
    data.fecha,
    data.hora,
    data.notas ? String(data.notas).trim() : '',
    'Pendiente',
    'Cliente',
    new Date()
  ]);

  return { ok: true, id: id, mensaje: 'Cita registrada correctamente. Te contactaremos para confirmar.' };
}

// ==================== MENSAJES DE CONTACTO (público) ====================

function validarDatosMensaje(data) {
  const errores = [];
  if (!data.nombre || String(data.nombre).trim().length < 3) {
    errores.push('El nombre debe tener al menos 3 caracteres.');
  }
  if (!esCorreoValido(data.correo)) {
    errores.push('El correo electrónico no es válido.');
  }
  if (!data.mensaje || String(data.mensaje).trim().length < 5) {
    errores.push('El mensaje es demasiado corto.');
  }
  return { valido: errores.length === 0, errores: errores };
}

function enviarMensajePublico(data) {
  const validacion = validarDatosMensaje(data);
  if (!validacion.valido) {
    return { ok: false, errores: validacion.errores };
  }

  const sh = sheet(SHEET_MENSAJES);
  const id = nextId(sh);
  sh.appendRow([
    id,
    String(data.nombre).trim(),
    String(data.correo).trim(),
    data.asunto ? String(data.asunto).trim() : '',
    String(data.mensaje).trim(),
    new Date(),
    false
  ]);

  return { ok: true, id: id, mensaje: 'Mensaje enviado correctamente. Te responderemos pronto.' };
}

// ==================== ADMIN: AUTENTICACIÓN ====================

function checkAdminPassword(password) {
  const real = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');
  if (!password || password !== real) {
    throw new Error('Contraseña incorrecta.');
  }
}

function adminLogin(password) {
  const real = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');
  return password === real;
}

function adminCambiarPassword(passwordActual, passwordNueva) {
  checkAdminPassword(passwordActual);
  if (!passwordNueva || passwordNueva.length < 6) {
    throw new Error('La nueva contraseña debe tener al menos 6 caracteres.');
  }
  PropertiesService.getScriptProperties().setProperty('ADMIN_PASSWORD', passwordNueva);
  return true;
}

// ==================== ADMIN: CITAS ====================

function adminGetCitas(password) {
  checkAdminPassword(password);
  return sheetToObjects(sheet(SHEET_CITAS))
    .map(function (c) {
      return {
        id: c.ID,
        nombre: c.Nombre,
        telefono: c.Telefono,
        correo: c.Correo,
        servicio: c.Servicio,
        fecha: formatFecha(c.Fecha),
        hora: c.Hora,
        notas: c.Notas,
        estado: c.Estado,
        origen: c.Origen
      };
    })
    .sort(function (a, b) { return (a.fecha + a.hora).localeCompare(b.fecha + b.hora); });
}

function adminCrearCitaManual(password, data) {
  checkAdminPassword(password);
  const validacion = validarDatosCita(data);
  if (!validacion.valido) return { ok: false, errores: validacion.errores };
  if (!horaEstaDisponible(data.fecha, data.hora, null)) {
    return { ok: false, errores: ['Ese horario ya está ocupado.'] };
  }

  const sh = sheet(SHEET_CITAS);
  const id = nextId(sh);
  sh.appendRow([
    id,
    String(data.nombre).trim(),
    String(data.telefono).trim(),
    String(data.correo || '').trim(),
    String(data.servicio).trim(),
    data.fecha,
    data.hora,
    data.notas ? String(data.notas).trim() : '',
    'Confirmada',
    'Admin',
    new Date()
  ]);
  return { ok: true, id: id };
}

function adminActualizarEstadoCita(password, id, estado) {
  checkAdminPassword(password);
  const estadosValidos = ['Pendiente', 'Confirmada', 'Cancelada'];
  if (estadosValidos.indexOf(estado) === -1) throw new Error('Estado inválido.');

  const sh = sheet(SHEET_CITAS);
  const fila = findRowById(sh, id);
  if (fila === -1) throw new Error('Cita no encontrada.');

  const col = HEADERS[SHEET_CITAS].indexOf('Estado') + 1;
  sh.getRange(fila, col).setValue(estado);
  return true;
}

function adminEliminarCita(password, id) {
  checkAdminPassword(password);
  const sh = sheet(SHEET_CITAS);
  const fila = findRowById(sh, id);
  if (fila === -1) throw new Error('Cita no encontrada.');
  sh.deleteRow(fila);
  return true;
}

// ==================== ADMIN: SERVICIOS ====================

function adminGetServicios(password) {
  checkAdminPassword(password);
  return sheetToObjects(sheet(SHEET_SERVICIOS)).map(function (s) {
    return { id: s.ID, nombre: s.Nombre, duracion: s.DuracionMin, activo: s.Activo === true || s.Activo === 'TRUE' };
  });
}

function adminCrearServicio(password, data) {
  checkAdminPassword(password);
  if (!data.nombre || String(data.nombre).trim() === '') throw new Error('El nombre del servicio es requerido.');

  const sh = sheet(SHEET_SERVICIOS);
  const id = nextId(sh);
  sh.appendRow([id, String(data.nombre).trim(), Number(data.duracion) || 60, true]);
  return { ok: true, id: id };
}

function adminActualizarServicio(password, id, data) {
  checkAdminPassword(password);
  const sh = sheet(SHEET_SERVICIOS);
  const fila = findRowById(sh, id);
  if (fila === -1) throw new Error('Servicio no encontrado.');

  const headers = HEADERS[SHEET_SERVICIOS];
  if (data.nombre !== undefined) sh.getRange(fila, headers.indexOf('Nombre') + 1).setValue(data.nombre);
  if (data.duracion !== undefined) sh.getRange(fila, headers.indexOf('DuracionMin') + 1).setValue(Number(data.duracion));
  if (data.activo !== undefined) sh.getRange(fila, headers.indexOf('Activo') + 1).setValue(!!data.activo);
  return true;
}

function adminEliminarServicio(password, id) {
  checkAdminPassword(password);
  const sh = sheet(SHEET_SERVICIOS);
  const fila = findRowById(sh, id);
  if (fila === -1) throw new Error('Servicio no encontrado.');
  sh.deleteRow(fila);
  return true;
}

// ==================== ADMIN: DINÁMICAS ====================

function adminGetDinamicas(password) {
  checkAdminPassword(password);
  return sheetToObjects(sheet(SHEET_DINAMICAS)).map(function (d) {
    return {
      id: d.ID,
      titulo: d.Titulo,
      descripcion: d.Descripcion,
      tipo: d.Tipo,
      activa: d.Activa === true || d.Activa === 'TRUE'
    };
  });
}

function adminCrearDinamica(password, data) {
  checkAdminPassword(password);
  if (!data.titulo || String(data.titulo).trim() === '') throw new Error('El título es requerido.');

  const sh = sheet(SHEET_DINAMICAS);
  const id = nextId(sh);
  sh.appendRow([id, String(data.titulo).trim(), String(data.descripcion || '').trim(), String(data.tipo || '').trim(), true, new Date()]);
  return { ok: true, id: id };
}

function adminActualizarDinamica(password, id, data) {
  checkAdminPassword(password);
  const sh = sheet(SHEET_DINAMICAS);
  const fila = findRowById(sh, id);
  if (fila === -1) throw new Error('Dinámica no encontrada.');

  const headers = HEADERS[SHEET_DINAMICAS];
  if (data.titulo !== undefined) sh.getRange(fila, headers.indexOf('Titulo') + 1).setValue(data.titulo);
  if (data.descripcion !== undefined) sh.getRange(fila, headers.indexOf('Descripcion') + 1).setValue(data.descripcion);
  if (data.tipo !== undefined) sh.getRange(fila, headers.indexOf('Tipo') + 1).setValue(data.tipo);
  if (data.activa !== undefined) sh.getRange(fila, headers.indexOf('Activa') + 1).setValue(!!data.activa);
  return true;
}

function adminEliminarDinamica(password, id) {
  checkAdminPassword(password);
  const sh = sheet(SHEET_DINAMICAS);
  const fila = findRowById(sh, id);
  if (fila === -1) throw new Error('Dinámica no encontrada.');
  sh.deleteRow(fila);
  return true;
}

// ==================== ADMIN: MENSAJES ====================

function adminGetMensajes(password) {
  checkAdminPassword(password);
  return sheetToObjects(sheet(SHEET_MENSAJES))
    .map(function (m) {
      return {
        id: m.ID,
        nombre: m.Nombre,
        correo: m.Correo,
        asunto: m.Asunto,
        mensaje: m.Mensaje,
        fecha: m.Fecha,
        leido: m.Leido === true || m.Leido === 'TRUE'
      };
    })
    .sort(function (a, b) { return new Date(b.fecha) - new Date(a.fecha); });
}

function adminMarcarMensajeLeido(password, id) {
  checkAdminPassword(password);
  const sh = sheet(SHEET_MENSAJES);
  const fila = findRowById(sh, id);
  if (fila === -1) throw new Error('Mensaje no encontrado.');
  const col = HEADERS[SHEET_MENSAJES].indexOf('Leido') + 1;
  sh.getRange(fila, col).setValue(true);
  return true;
}

function adminEliminarMensaje(password, id) {
  checkAdminPassword(password);
  const sh = sheet(SHEET_MENSAJES);
  const fila = findRowById(sh, id);
  if (fila === -1) throw new Error('Mensaje no encontrado.');
  sh.deleteRow(fila);
  return true;
}

// ==================== ADMIN: ESTADÍSTICAS ====================

function adminGetEstadisticas(password) {
  checkAdminPassword(password);
  const citas = sheetToObjects(sheet(SHEET_CITAS));
  const dinamicas = sheetToObjects(sheet(SHEET_DINAMICAS));
  const mensajes = sheetToObjects(sheet(SHEET_MENSAJES));

  const hoy = formatFecha(new Date());

  return {
    citasTotales: citas.length,
    citasPendientes: citas.filter(function (c) { return c.Estado === 'Pendiente'; }).length,
    citasConfirmadas: citas.filter(function (c) { return c.Estado === 'Confirmada'; }).length,
    citasHoy: citas.filter(function (c) { return formatFecha(c.Fecha) === hoy && c.Estado !== 'Cancelada'; }).length,
    dinamicasActivas: dinamicas.filter(function (d) { return d.Activa === true || d.Activa === 'TRUE'; }).length,
    mensajesSinLeer: mensajes.filter(function (m) { return !(m.Leido === true || m.Leido === 'TRUE'); }).length
  };
}
