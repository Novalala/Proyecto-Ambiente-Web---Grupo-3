"use strict";

const UBICACIONES = {
    "San José": {
        "San José": ["Carmen", "Merced", "Hospital", "Catedral", "Zapote", "San Francisco de Dos Ríos", "Uruca", "Mata Redonda", "Pavas", "Hatillo", "San Sebastián"],
        "Escazú": [], "Desamparados": [], "Puriscal": [], "Tarrazú": [], "Aserrí": [],
        "Mora": [], "Goicoechea": [], "Santa Ana": [], "Alajuelita": [],
        "Vázquez de Coronado": [], "Acosta": [], "Tibás": [], "Moravia": [],
        "Montes de Oca": [], "Turrubares": [], "Dota": [], "Curridabat": [],
        "Pérez Zeledón": [], "León Cortés Castro": []
    },
    "Alajuela": {
        "Alajuela": [], "San Ramón": [], "Grecia": [], "San Mateo": [], "Atenas": [],
        "Naranjo": [], "Palmares": [], "Poás": [], "Orotina": [], "San Carlos": [],
        "Zarcero": [], "Sarchí": [], "Upala": [], "Los Chiles": [], "Guatuso": [], "Río Cuarto": []
    },
    "Cartago": {
        "Cartago": ["Oriental", "Occidental", "Carmen", "San Nicolás", "Aguacaliente", "Guadalupe", "Corralillo", "Tierra Blanca", "Dulce Nombre", "Llano Grande", "Quebradilla"],
        "Paraíso": [], "La Unión": [], "Jiménez": [], "Turrialba": [],
        "Alvarado": [], "Oreamuno": [], "El Guarco": []
    },
    "Heredia": {
        "Heredia": ["Heredia", "Mercedes", "San Francisco", "Ulloa", "Varablanca"],
        "Barva": [], "Santo Domingo": [], "Santa Bárbara": [], "San Rafael": [],
        "San Isidro": [], "Belén": [], "Flores": [], "San Pablo": [], "Sarapiquí": []
    },
    "Guanacaste": {
        "Liberia": [], "Nicoya": [], "Santa Cruz": [], "Bagaces": [], "Carrillo": [],
        "Cañas": [], "Abangares": [], "Tilarán": [], "Nandayure": [], "La Cruz": [], "Hojancha": []
    },
    "Puntarenas": {
        "Puntarenas": [], "Esparza": [], "Buenos Aires": [], "Montes de Oro": [], "Osa": [],
        "Quepos": [], "Golfito": [], "Coto Brus": [], "Parrita": [], "Corredores": [],
        "Garabito": [], "Monteverde": [], "Puerto Jiménez": []
    },
    "Limón": {
        "Limón": [], "Pococí": [], "Siquirres": [], "Talamanca": [], "Matina": [], "Guácimo": []
    }
};

const INTERRUPCIONES = [
    {
        provincia: "Cartago", canton: "Cartago", distrito: "Oriental",
        descripcion: "Mantenimiento programado de la tubería principal. Sin servicio de agua potable.",
        inicio: "2026-11-03T08:00", fin: "2026-11-03T16:00"
    },
    {
        provincia: "Cartago", canton: "Cartago", distrito: "",
        descripcion: "Trabajos de reparación en tanque de almacenamiento. Posible baja presión.",
        inicio: "2026-11-05T09:00", fin: "2026-11-05T14:00"
    },
    {
        provincia: "Heredia", canton: "Heredia", distrito: "Mercedes",
        descripcion: "Avería imprevista en línea de conducción. Cuadrillas trabajando en la reparación.",
        inicio: "2026-11-01T06:30", fin: "2026-11-01T18:00"
    },
    {
        provincia: "San José", canton: "Escazú", distrito: "",
        descripcion: "Cambio de válvulas en red de distribución.",
        inicio: "2026-11-04T22:00", fin: "2026-11-05T05:00"
    }
];


const form        = document.getElementById("formFiltros");
const selProv     = document.getElementById("provincia");
const selCanton   = document.getElementById("canton");
const selDistrito = document.getElementById("distrito");
const mensaje     = document.getElementById("mensaje");
const cuerpoTabla = document.getElementById("cuerpoTabla");


function llenarSelect(select, opciones, textoInicial) {
    select.innerHTML = "";
    const base = document.createElement("option");
    base.value = "";
    base.textContent = textoInicial;
    select.appendChild(base);

    opciones.forEach(function (texto) {
        const op = document.createElement("option");
        op.value = texto;
        op.textContent = texto;
        select.appendChild(op);
    });
}

function formatearFecha(iso) {
    const f = new Date(iso);
    if (isNaN(f)) return "—";
    return f.toLocaleString("es-CR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: false
    });
}

function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = "mensaje-estado " + tipo;
}

function ocultarMensaje() {
    mensaje.className = "mensaje-estado d-none";
    mensaje.textContent = "";
}

function filaVacia() {
    cuerpoTabla.innerHTML = "";
    const tr = document.createElement("tr");
    tr.className = "fila-vacia";
    const td = document.createElement("td");
    td.colSpan = 3;
    const p = document.createElement("p");
    p.textContent = "No hay registros para mostrar";
    td.appendChild(p);
    tr.appendChild(td);
    cuerpoTabla.appendChild(tr);
}

// Marca o limpia el estado inválido de un campo
function validarCampo(select) {
    const valido = select.value !== "";
    select.classList.toggle("is-invalid", !valido);
    return valido;
}


llenarSelect(selProv, Object.keys(UBICACIONES), "Seleccionar provincia");

selProv.addEventListener("change", function () {
    ocultarMensaje();
    filaVacia();
    selProv.classList.remove("is-invalid");

    // Reiniciar cantón y distrito
    llenarSelect(selDistrito, [], "Seleccionar distrito");
    selDistrito.disabled = true;

    if (selProv.value === "") {
        llenarSelect(selCanton, [], "Seleccionar cantón");
        selCanton.disabled = true;
        return;
    }

    llenarSelect(selCanton, Object.keys(UBICACIONES[selProv.value]), "Seleccionar cantón");
    selCanton.disabled = false;
});

selCanton.addEventListener("change", function () {
    ocultarMensaje();
    filaVacia();
    selCanton.classList.remove("is-invalid");

    const distritos = selCanton.value ? UBICACIONES[selProv.value][selCanton.value] : [];
    llenarSelect(selDistrito, distritos, "Seleccionar distrito");
    selDistrito.disabled = distritos.length === 0;
});

selDistrito.addEventListener("change", function () {
    ocultarMensaje();
    filaVacia();
});


form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Validación: provincia y cantón son obligatorios
    const provOk = validarCampo(selProv);
    const cantonOk = selCanton.disabled ? false : validarCampo(selCanton);
    if (!provOk || !cantonOk) {
        if (provOk && selCanton.disabled === false) selCanton.classList.add("is-invalid");
        ocultarMensaje();
        filaVacia();
        return;
    }

    const prov = selProv.value;
    const canton = selCanton.value;
    const distrito = selDistrito.value;

    const resultados = INTERRUPCIONES.filter(function (i) {
        if (i.provincia !== prov || i.canton !== canton) return false;
        if (distrito === "") return true;
        return i.distrito === distrito || i.distrito === "";
    });

    if (resultados.length === 0) {
        filaVacia();
        mostrarMensaje(
            "No hay avisos de cortes de agua programados para la zona seleccionada.",
            "sin-avisos"
        );
        return;
    }

    cuerpoTabla.innerHTML = "";
    resultados.forEach(function (i) {
        const tr = document.createElement("tr");
        [i.descripcion, formatearFecha(i.inicio), formatearFecha(i.fin)].forEach(function (texto) {
            const td = document.createElement("td");
            td.textContent = texto; 
            tr.appendChild(td);
        });
        cuerpoTabla.appendChild(tr);
    });

    mostrarMensaje(
        "Se encontraron " + resultados.length + (resultados.length === 1 ? " aviso" : " avisos") + " de interrupción en la zona.",
        "con-avisos"
    );
});