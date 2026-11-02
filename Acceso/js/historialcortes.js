/*
  Datos de ejemplo.*/
const cortesDemo = [
    { id: 108, provincia: "San José", canton: "Desamparados", distrito: "San Rafael Arriba", comunidades: "Barrio Los Ángeles, Calle Fallas",
      motivo: "Reparación de tubería", descripcion: "Fuga en tubería principal de 150 mm detectada en la vía.",
      inicio: "2026-10-28T08:00", fin: "2026-10-28T14:30", estado: "Finalizado" },
    { id: 104, provincia: "Heredia", canton: "Santo Domingo", distrito: "Santa Rosa", comunidades: "Urbanización El Socorro",
      motivo: "Mantenimiento de tanque", descripcion: "Limpieza y desinfección del tanque de almacenamiento.",
      inicio: "2026-10-22T09:00", fin: "2026-10-22T13:00", estado: "Finalizado" },
    { id: 99, provincia: "Alajuela", canton: "Alajuela", distrito: "Desamparados", comunidades: "",
      motivo: "Avería en la red", descripcion: "Daño en válvula de control. No se registró la hora exacta de restablecimiento.",
      inicio: "2026-10-15T22:00", fin: null, estado: "Restablecido" },
    { id: 95, provincia: "Guanacaste", canton: "Liberia", distrito: "Liberia", comunidades: "Barrio Los Cerros, Condega",
      motivo: "Racionamiento por baja de fuentes", descripcion: "Racionamiento nocturno por disminución del caudal de los pozos.",
      inicio: "2026-10-09T18:00", fin: "2026-10-10T05:00", estado: "Finalizado" },
    { id: 90, provincia: "Cartago", canton: "La Unión", distrito: "Tres Ríos", comunidades: "",
      motivo: "Mantenimiento programado", descripcion: "El trabajo fue reprogramado y el corte no se realizó.",
      inicio: "2026-09-30T08:00", fin: null, estado: "Cancelado" },
    { id: 86, provincia: "Puntarenas", canton: "Esparza", distrito: "Espíritu Santo", comunidades: "Centro",
      motivo: "Daño en tubería por obras viales", descripcion: "Maquinaria de obras viales dañó una tubería secundaria.",
      inicio: "2026-09-18T10:15", fin: "2026-09-18T19:40", estado: "Finalizado" },
    { id: 81, provincia: "San José", canton: "Curridabat", distrito: "Granadilla", comunidades: "Granadilla Norte",
      motivo: "Conexión de nueva tubería", descripcion: "Interconexión de la nueva línea de conducción.",
      inicio: "2026-09-05T07:00", fin: "2026-09-05T12:00", estado: "Finalizado" },
    { id: 77, provincia: "Limón", canton: "Pococí", distrito: "Guápiles", comunidades: "La Emilia",
      motivo: "Daño en la fuente", descripcion: "Lluvias intensas aumentaron la turbiedad del agua captada.",
      inicio: "2026-08-27T06:00", fin: "2026-08-28T16:00", estado: "Restablecido parcialmente" }
];

/*Formato de fecha y duracion*/
const formatoFecha = new Intl.DateTimeFormat("es-CR", { day: "2-digit", month: "short", year: "numeric" });
const formatoFechaHora = new Intl.DateTimeFormat("es-CR", { dateStyle: "long", timeStyle: "short" });

function calcularDuracion(corte){
    if (!corte.fin) return null;
    const minutos = Math.round((new Date(corte.fin) - new Date(corte.inicio)) / 60000);
    if (minutos <= 0) return null;
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    if (h === 0) return `${m} min`;
    return m ? `${h} h ${m} min` : `${h} h`;
}

function claseEstado(estado){
    switch (estado){
        case "Finalizado": return "badge-finalizado";
        case "Restablecido": return "badge-finalizado";
        case "Restablecido parcialmente": return "badge-parcial";
        case "Cancelado": return "badge-cancelado";
        default: return "badge-otro";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const filtrosForm = document.getElementById("filtrosForm");
    const filtroProvincia = document.getElementById("filtroProvincia");
    const filtroCanton = document.getElementById("filtroCanton");
    const filtroDesde = document.getElementById("filtroDesde");
    const filtroHasta = document.getElementById("filtroHasta");
    const tabla = document.getElementById("tablaHistorial");
    const sinResultados = document.getElementById("sinResultados");
    const contador = document.getElementById("contadorResultados");
    const modal = new bootstrap.Modal(document.getElementById("modalDetalle"));
    const contenidoDetalle = document.getElementById("contenidoDetalle");

    /*Solo cortes que ya terminaron (seguridad extra por si llegan activos)*/
    const ahora = new Date();
    const historial = cortesDemo
        .filter(c => new Date(c.fin || c.inicio) < ahora)
        .sort((a, b) => new Date(b.inicio) - new Date(a.inicio));

    /*La fecha */
    const hoy = ahora.toISOString().slice(0, 10);
    filtroDesde.max = hoy;
    filtroHasta.max = hoy;

    llenarProvincias(filtroProvincia, "Todas las provincias");
    filtroProvincia.addEventListener("change", () => {
        llenarCantones(filtroProvincia.value, filtroCanton, "Todos los cantones");
    });

    /*tabla*/
    function renderTabla(lista){
        tabla.innerHTML = lista.map(c => {
            const duracion = calcularDuracion(c);
            return `
            <tr>
                <td data-label="Fecha">${formatoFecha.format(new Date(c.inicio))}</td>
                <td data-label="Ubicación">
                    <strong>${escaparHTML(c.distrito)}</strong><br>
                    <span class="text-muted-app small">${escaparHTML(c.canton)}, ${escaparHTML(c.provincia)}</span>
                </td>
                <td data-label="Motivo">${escaparHTML(c.motivo)}</td>
                <td data-label="Duración">${duracion ? duracion : '<span class="text-muted-app">No disponible</span>'}</td>
                <td data-label="Estado"><span class="status-badge ${claseEstado(c.estado)}">${escaparHTML(c.estado)}</span></td>
                <td class="text-end">
                    <button type="button" class="btn btn-sm btn-detalle" data-id="${c.id}">Ver detalles</button>
                </td>
            </tr>`;
        }).join("");

        sinResultados.classList.toggle("d-none", lista.length > 0);
        contador.textContent = `${lista.length} ${lista.length === 1 ? "resultado" : "resultados"}`;
    }

    /*Aplicar los filtros*/
    function filtrar(){
        const desde = filtroDesde.value ? new Date(filtroDesde.value + "T00:00") : null;
        const hasta = filtroHasta.value ? new Date(filtroHasta.value + "T23:59") : null;

        const resultado = historial.filter(c => {
            const fecha = new Date(c.inicio);
            if (filtroProvincia.value && c.provincia !== filtroProvincia.value) return false;
            if (filtroCanton.value && c.canton !== filtroCanton.value) return false;
            if (desde && fecha < desde) return false;
            if (hasta && fecha > hasta) return false;
            return true;
        });
        renderTabla(resultado);
    }

    filtrosForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const rangoInvalido = filtroDesde.value && filtroHasta.value && filtroHasta.value < filtroDesde.value;
        filtroHasta.classList.toggle("is-invalid", Boolean(rangoInvalido));
        if (rangoInvalido) return;
        filtrar();
    });

    document.getElementById("btnLimpiar").addEventListener("click", () => {
        filtrosForm.reset();
        llenarCantones("", filtroCanton, "Todos los cantones");
        filtroHasta.classList.remove("is-invalid");
        renderTabla(historial);
    });

    /*Detalle de cortes*/
    tabla.addEventListener("click", (e) => {
        const boton = e.target.closest(".btn-detalle");
        if (!boton) return;
        const c = historial.find(x => x.id === Number(boton.dataset.id));
        if (!c) return;

        const duracion = calcularDuracion(c);
        contenidoDetalle.innerHTML = `
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                <div>
                    <p class="detail-code mb-1">Corte #${c.id}</p>
                    <h3 class="detail-title">${escaparHTML(c.motivo)}</h3>
                </div>
                <span class="status-badge ${claseEstado(c.estado)}">${escaparHTML(c.estado)}</span>
            </div>
            <dl class="detail-grid">
                <div><dt>Provincia</dt><dd>${escaparHTML(c.provincia)}</dd></div>
                <div><dt>Cantón</dt><dd>${escaparHTML(c.canton)}</dd></div>
                <div><dt>Distrito</dt><dd>${escaparHTML(c.distrito)}</dd></div>
                <div><dt>Comunidades</dt><dd>${escaparHTML(c.comunidades) || "No especificadas"}</dd></div>
                <div><dt>Inicio</dt><dd>${formatoFechaHora.format(new Date(c.inicio))}</dd></div>
                <div><dt>Restablecimiento</dt><dd>${c.fin ? formatoFechaHora.format(new Date(c.fin)) : "No registrado"}</dd></div>
                <div><dt>Duración registrada</dt><dd>${duracion || "No disponible"}</dd></div>
            </dl>
            <h4 class="detail-subtitle">Descripción</h4>
            <p class="mb-0">${escaparHTML(c.descripcion)}</p>`;
        modal.show();
    });

    renderTabla(historial);
});
