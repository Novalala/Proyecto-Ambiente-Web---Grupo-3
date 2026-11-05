document.addEventListener("DOMContentLoaded", () => {
    /*Carga los datos del usuario en la pantalla*/
    obtenerUsuario().then(usuario => {
        const zona = [usuario.distrito, usuario.canton, usuario.provincia].filter(Boolean).join(", ");

        document.getElementById("perfilNombre").textContent = usuario.nombre;
        document.getElementById("perfilCorreo").textContent = usuario.correo;
        document.getElementById("datoNombre").textContent = usuario.nombre;
        document.getElementById("datoCorreo").textContent = usuario.correo;
        document.getElementById("datoZona").textContent = zona || "Sin zona registrada";

        //Iniciales para el avatar (ej. "María Mora" -> "MM")
        const iniciales = usuario.nombre.split(" ").filter(Boolean).slice(0, 2).map(p => p[0]).join("");
        document.getElementById("avatarIniciales").textContent = iniciales.toUpperCase();

        //Resumen del estado de las notificaciones
        const notif = usuario.notificaciones;
        const resumen = document.getElementById("resumenNotificaciones");
        if (notif && notif.alertasActivas){
            const n = notif.zonas.length;
            resumen.textContent = `Alertas activadas • ${n} ${n === 1 ? "zona" : "zonas"} de interés`;
        } else {
            resumen.textContent = "Alertas desactivadas";
        }
    }).catch(() => {
        document.getElementById("perfilNombre").textContent = "No se pudieron cargar los datos";
    });

    /*Cerrar sesion*/
    document.getElementById("confirmarCerrarSesion").addEventListener("click", cerrarSesion);
});
