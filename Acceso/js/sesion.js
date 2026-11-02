/*
  Datos de ejemplo del usuario mientras se conecta el backend.
  Cuando exista el PHP, reemplazar el contenido de las funciones por fetch()
  (las rutas indicadas en los TODO son sugerencias).
*/
const usuarioDemo = {
    nombre: "María Mora Pérez",
    correo: "maria.mora@correo.com",
    provincia: "Heredia",
    canton: "Santo Domingo",
    distrito: "Santa Rosa",
    notificaciones: {
        alertasActivas: true,
        zonas: [
            { provincia: "Heredia", canton: "Santo Domingo", distrito: "Santa Rosa", comunidad: "" },
            { provincia: "San José", canton: "San José", distrito: "Carmen", comunidad: "" }
        ],
        tipos: { programados: true, activos: true, restablecimiento: false },
        canales: { web: true, correo: false }
    }
};

/*Obtiene los datos del usuario con sesion iniciada*/
function obtenerUsuario(){
    // TODO: return fetch("../php/usuario/obtener.php").then(r => r.json());
    return Promise.resolve(structuredClone(usuarioDemo));
}

/*Guarda los datos personales (NO incluye las preferencias de notificacion)*/
function guardarPerfil(datos){
    // TODO: return fetch("../php/usuario/actualizarPerfil.php", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(datos) }).then(r => r.json());
    console.log("Perfil a guardar:", datos);
    return new Promise(resolve => setTimeout(() => resolve({ ok: true }), 600));
}

/*Guarda solo las preferencias de notificacion*/
function guardarPreferencias(preferencias){
    // TODO: return fetch("../php/usuario/guardarNotificaciones.php", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(preferencias) }).then(r => r.json());
    console.log("Preferencias a guardar:", preferencias);
    return new Promise(resolve => setTimeout(() => resolve({ ok: true }), 600));
}

/*Cierra la sesion y regresa al login*/
function cerrarSesion(){
    // TODO: fetch("../php/logout.php") para destruir la sesion en el servidor
    window.location.href = "login.html";
}

/*Muestra un mensaje de exito o error en un div .alert*/
function mostrarMensaje(div, texto, tipo){
    div.className = `alert alert-${tipo}`;
    div.textContent = texto;
    div.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
