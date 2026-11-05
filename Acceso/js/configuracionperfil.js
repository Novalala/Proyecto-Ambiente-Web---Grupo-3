document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("perfilForm");
    const nombre = document.getElementById("nombre");
    const correo = document.getElementById("correo");
    const provincia = document.getElementById("provincia");
    const canton = document.getElementById("canton");
    const distrito = document.getElementById("distrito");
    const switchContrasena = document.getElementById("cambiarContrasena");
    const grupoActual = document.getElementById("grupoContrasenaActual");
    const grupoNueva = document.getElementById("grupoNuevaContrasena");
    const contrasenaActual = document.getElementById("contrasenaActual");
    const nuevaContrasena = document.getElementById("nuevaContrasena");
    const confirmarContrasena = document.getElementById("confirmarContrasena");
    const mensaje = document.getElementById("mensajePerfil");
    const btnGuardar = document.getElementById("btnGuardarPerfil");

    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    let correoOriginal = "";

    /*Selecciones de ubicacion*/
    llenarProvincias(provincia);
    provincia.addEventListener("change", () => llenarCantones(provincia.value, canton));

    /*Carga los datos actuales del usuario*/
    obtenerUsuario().then(usuario => {
        nombre.value = usuario.nombre;
        correo.value = usuario.correo;
        correoOriginal = usuario.correo;
        provincia.value = usuario.provincia;
        llenarCantones(usuario.provincia, canton);
        canton.value = usuario.canton;
        distrito.value = usuario.distrito;
    });

    /*Botones Mostrar / Ocultar*/
    document.querySelectorAll(".btn-mostrar").forEach(boton => {
        boton.addEventListener("click", () => {
            const input = document.getElementById(boton.dataset.objetivo);
            const oculto = input.type === "password";
            input.type = oculto ? "text" : "password";
            boton.textContent = oculto ? "Ocultar" : "Mostrar";
        });
    });

    /*Se pide la contrasena actual si cambia el correo o la contrasena*/
    function actualizarCamposContrasena(){
        const cambiaCorreo = correo.value.trim().toLowerCase() !== correoOriginal.toLowerCase();
        grupoNueva.classList.toggle("d-none", !switchContrasena.checked);
        grupoActual.classList.toggle("d-none", !(switchContrasena.checked || cambiaCorreo));
    }
    switchContrasena.addEventListener("change", actualizarCamposContrasena);
    correo.addEventListener("input", actualizarCamposContrasena);

    /*Indicador de requisitos de la contrasena*/
    const reglas = {
        largo: v => v.length >= 8,
        mayuscula: v => /[A-ZÁÉÍÓÚÑ]/.test(v),
        numero: v => /\d/.test(v)
    };
    nuevaContrasena.addEventListener("input", () => {
        document.querySelectorAll("#requisitosContrasena li").forEach(li => {
            li.classList.toggle("ok", reglas[li.dataset.regla](nuevaContrasena.value));
        });
    });

    /*Marcar un campo como valido o invalido*/
    function validarCampo(campo, esValido){
        campo.classList.toggle("is-invalid", !esValido);
        return esValido;
    }

    /*Quitar error al escribir*/
    form.querySelectorAll("input, select").forEach(campo => {
        campo.addEventListener("input", () => campo.classList.remove("is-invalid"));
        campo.addEventListener("change", () => campo.classList.remove("is-invalid"));
    });

    /*Envio del formulario*/
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        mensaje.classList.add("d-none");

        const cambiaCorreo = correo.value.trim().toLowerCase() !== correoOriginal.toLowerCase();
        const cambiaContrasena = switchContrasena.checked;
        let valido = true;

        valido &= validarCampo(nombre, nombre.value.trim().split(/\s+/).length >= 2);
        valido &= validarCampo(correo, regexCorreo.test(correo.value.trim()));
        valido &= validarCampo(provincia, provincia.value !== "");
        valido &= validarCampo(canton, canton.value !== "");
        valido &= validarCampo(distrito, distrito.value.trim() !== "");

        if (cambiaCorreo || cambiaContrasena){
            valido &= validarCampo(contrasenaActual, contrasenaActual.value !== "");
        }
        if (cambiaContrasena){
            const v = nuevaContrasena.value;
            valido &= validarCampo(nuevaContrasena, Object.values(reglas).every(regla => regla(v)));
            valido &= validarCampo(confirmarContrasena, confirmarContrasena.value !== "" && confirmarContrasena.value === v);
        }

        if (!valido){
            mostrarMensaje(mensaje, "Revisa los campos marcados en rojo.", "danger");
            return;
        }

        /*datos personales*/
        const datos = {
            nombre: nombre.value.trim(),
            correo: correo.value.trim(),
            provincia: provincia.value,
            canton: canton.value,
            distrito: distrito.value.trim()
        };
        if (cambiaCorreo || cambiaContrasena) datos.contrasenaActual = contrasenaActual.value;
        if (cambiaContrasena) datos.nuevaContrasena = nuevaContrasena.value;

        btnGuardar.disabled = true;
        btnGuardar.textContent = "Guardando...";

        try {
            const respuesta = await guardarPerfil(datos);
            if (respuesta.ok){
                mostrarMensaje(mensaje, "Tus datos se actualizaron correctamente.", "success");
                correoOriginal = datos.correo;
                //Limpiar los campos de contrasena
                switchContrasena.checked = false;
                [contrasenaActual, nuevaContrasena, confirmarContrasena].forEach(c => c.value = "");
                document.querySelectorAll("#requisitosContrasena li").forEach(li => li.classList.remove("ok"));
                actualizarCamposContrasena();
            } else {
                mostrarMensaje(mensaje, respuesta.mensaje || "No se pudieron guardar los cambios.", "danger");
            }
        } catch {
            mostrarMensaje(mensaje, "Error de conexión. Intente de nuevo.", "danger");
        } finally {
            btnGuardar.disabled = false;
            btnGuardar.textContent = "Guardar cambios";
        }
    });
});
