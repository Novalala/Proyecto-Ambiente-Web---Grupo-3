document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("notificacionesForm");
    const alertasActivas = document.getElementById("alertasActivas");
    const estadoAlertas = document.getElementById("estadoAlertas");
    const opciones = document.getElementById("opcionesAlertas");

    const zonaProvincia = document.getElementById("zonaProvincia");
    const zonaCanton = document.getElementById("zonaCanton");
    const zonaDistrito = document.getElementById("zonaDistrito");
    const zonaComunidad = document.getElementById("zonaComunidad");
    const btnAgregarZona = document.getElementById("btnAgregarZona");
    const errorZona = document.getElementById("errorZona");
    const listaZonas = document.getElementById("listaZonas");
    const sinZonas = document.getElementById("sinZonas");

    const tipoProgramados = document.getElementById("tipoProgramados");
    const tipoActivos = document.getElementById("tipoActivos");
    const tipoRestablecimiento = document.getElementById("tipoRestablecimiento");
    const canalWeb = document.getElementById("canalWeb");
    const canalCorreo = document.getElementById("canalCorreo");

    const mensaje = document.getElementById("mensajeNotificaciones");
    const btnGuardar = document.getElementById("btnGuardarPreferencias");

    let zonas = [];

    /*Selects de ubicacion*/
    llenarProvincias(zonaProvincia);
    zonaProvincia.addEventListener("change", () => {
        llenarCantones(zonaProvincia.value, zonaCanton, "Toda la provincia");
        actualizarCamposZona();
    });
    zonaCanton.addEventListener("change", actualizarCamposZona);

    /*Distrito y comunidad solo se habilitan al elegir canton*/
    function actualizarCamposZona(){
        const hayCanton = zonaCanton.value !== "";
        zonaDistrito.disabled = !hayCanton;
        zonaComunidad.disabled = !hayCanton;
        if (!hayCanton){
            zonaDistrito.value = "";
            zonaComunidad.value = "";
        }
    }

    /*Texto legible de una zona*/
    function describirZona(z){
        return [z.comunidad, z.distrito, z.canton, z.provincia].filter(Boolean).join(", ");
    }

    function claveZona(z){
        return [z.provincia, z.canton, z.distrito, z.comunidad].map(v => (v || "").toLowerCase()).join("|");
    }

    /*Dibuja la lista de zonas agregadas*/
    function renderZonas(){
        listaZonas.innerHTML = "";
        zonas.forEach((z, i) => {
            const li = document.createElement("li");
            li.className = "zone-chip";
            li.innerHTML = `<span>${escaparHTML(describirZona(z))}</span>
                <button type="button" class="btn-close btn-close-sm" aria-label="Quitar ${escaparHTML(describirZona(z))}" data-indice="${i}"></button>`;
            listaZonas.appendChild(li);
        });
        sinZonas.classList.toggle("d-none", zonas.length > 0);
    }

    listaZonas.addEventListener("click", (e) => {
        const boton = e.target.closest("[data-indice]");
        if (!boton) return;
        zonas.splice(Number(boton.dataset.indice), 1);
        renderZonas();
    });

    /*Agregar una zona de interes*/
    btnAgregarZona.addEventListener("click", () => {
        errorZona.classList.add("d-none");

        if (!zonaProvincia.value){
            errorZona.textContent = "Selecciona al menos una provincia.";
            errorZona.classList.remove("d-none");
            return;
        }

        const nueva = {
            provincia: zonaProvincia.value,
            canton: zonaCanton.value,
            distrito: zonaDistrito.value.trim(),
            comunidad: zonaComunidad.value.trim()
        };

        if (zonas.some(z => claveZona(z) === claveZona(nueva))){
            errorZona.textContent = "Esa zona ya está en tu lista.";
            errorZona.classList.remove("d-none");
            return;
        }

        zonas.push(nueva);
        renderZonas();

        //Reinicia el formulario de zona
        zonaProvincia.value = "";
        llenarCantones("", zonaCanton, "Toda la provincia");
        actualizarCamposZona();
    });

    /*Interruptor general: desactiva todas las opciones*/
    function actualizarInterruptor(){
        opciones.disabled = !alertasActivas.checked;
        opciones.classList.toggle("is-disabled", !alertasActivas.checked);
        estadoAlertas.textContent = alertasActivas.checked
            ? "Las alertas están activadas"
            : "Las alertas están desactivadas. No recibirás avisos.";
    }
    alertasActivas.addEventListener("change", actualizarInterruptor);

    /*Carga las preferencias guardadas*/
    obtenerUsuario().then(usuario => {
        const p = usuario.notificaciones;
        alertasActivas.checked = p.alertasActivas;
        zonas = p.zonas.slice();
        tipoProgramados.checked = p.tipos.programados;
        tipoActivos.checked = p.tipos.activos;
        tipoRestablecimiento.checked = p.tipos.restablecimiento;
        canalWeb.checked = p.canales.web;
        canalCorreo.checked = p.canales.correo;
        document.getElementById("correoDestino").textContent = `Se enviarán a ${usuario.correo}`;
        renderZonas();
        actualizarInterruptor();
    });

    /*Guardar preferencias*/
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        mensaje.classList.add("d-none");

        if (alertasActivas.checked){
            const errores = [];
            if (zonas.length === 0) errores.push("agrega al menos una zona de interés");
            if (!tipoProgramados.checked && !tipoActivos.checked && !tipoRestablecimiento.checked) errores.push("elige al menos un tipo de aviso");
            if (!canalWeb.checked && !canalCorreo.checked) errores.push("selecciona al menos un canal");

            if (errores.length){
                mostrarMensaje(mensaje, "Para recibir alertas, " + errores.join(", ") + ".", "danger");
                return;
            }
        }

        const preferencias = {
            alertasActivas: alertasActivas.checked,
            zonas: zonas,
            tipos: {
                programados: tipoProgramados.checked,
                activos: tipoActivos.checked,
                restablecimiento: tipoRestablecimiento.checked
            },
            canales: {
                web: canalWeb.checked,
                correo: canalCorreo.checked
            }
        };

        btnGuardar.disabled = true;
        btnGuardar.textContent = "Guardando...";

        try {
            const respuesta = await guardarPreferencias(preferencias);
            if (respuesta.ok){
                mostrarMensaje(mensaje, "Tus preferencias de notificación se guardaron correctamente.", "success");
            } else {
                mostrarMensaje(mensaje, respuesta.mensaje || "No se pudieron guardar las preferencias.", "danger");
            }
        } catch {
            mostrarMensaje(mensaje, "Error de conexión. Inténtalo de nuevo.", "danger");
        } finally {
            btnGuardar.disabled = false;
            btnGuardar.textContent = "Guardar preferencias";
        }
    });
});
