/*Cantones de Costa Rica por provincia (84 cantones)*/
const CANTONES = {
    "San José": ["San José", "Escazú", "Desamparados", "Puriscal", "Tarrazú", "Aserrí", "Mora", "Goicoechea", "Santa Ana", "Alajuelita", "Vázquez de Coronado", "Acosta", "Tibás", "Moravia", "Montes de Oca", "Turrubares", "Dota", "Curridabat", "Pérez Zeledón", "León Cortés Castro"],
    "Alajuela": ["Alajuela", "San Ramón", "Grecia", "San Mateo", "Atenas", "Naranjo", "Palmares", "Poás", "Orotina", "San Carlos", "Zarcero", "Sarchí", "Upala", "Los Chiles", "Guatuso", "Río Cuarto"],
    "Cartago": ["Cartago", "Paraíso", "La Unión", "Jiménez", "Turrialba", "Alvarado", "Oreamuno", "El Guarco"],
    "Heredia": ["Heredia", "Barva", "Santo Domingo", "Santa Bárbara", "San Rafael", "San Isidro", "Belén", "Flores", "San Pablo", "Sarapiquí"],
    "Guanacaste": ["Liberia", "Nicoya", "Santa Cruz", "Bagaces", "Carrillo", "Cañas", "Abangares", "Tilarán", "Nandayure", "La Cruz", "Hojancha"],
    "Puntarenas": ["Puntarenas", "Esparza", "Buenos Aires", "Montes de Oro", "Osa", "Quepos", "Golfito", "Coto Brus", "Parrita", "Corredores", "Garabito", "Monteverde", "Puerto Jiménez"],
    "Limón": ["Limón", "Pococí", "Siquirres", "Talamanca", "Matina", "Guácimo"]
};

/*Llena un select de provincias*/
function llenarProvincias(select, textoInicial = "Selecciona una provincia"){
    select.innerHTML = `<option value="">${textoInicial}</option>`;
    Object.keys(CANTONES).forEach(provincia => {
        select.add(new Option(provincia, provincia));
    });
}

/*Llena el select de cantones segun la provincia elegida*/
function llenarCantones(provincia, selectCanton, textoInicial = "Selecciona un cantón"){
    selectCanton.innerHTML = `<option value="">${textoInicial}</option>`;
    const lista = CANTONES[provincia] || [];
    lista.forEach(canton => selectCanton.add(new Option(canton, canton)));
    selectCanton.disabled = lista.length === 0;
}

/*Evita insertar HTML al mostrar datos que vienen de la base de datos*/
function escaparHTML(texto){
    const div = document.createElement("div");
    div.textContent = texto ?? "";
    return div.innerHTML;
}
