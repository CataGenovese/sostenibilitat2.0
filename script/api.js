const BASE_URL = "https://analisi.transparenciacatalunya.cat/resource/9r29-e8ha.json";
const APP_TOKEN = "ISZKwx5fLfNNV_l_vd0ChqUENodaPj5vhxb2"; // Tu token

// para obtener tu propio token tienes que registrarte en la web https://analisi.transparenciacatalunya.cat/login
//documentación para obtener el token: https://dev.socrata.com/docs/app-tokens.html


/**
 * Realiza una petición a la API de incendios forestales, opcionalmente con token.
 * @param {Object} params - Parámetros para filtrar la consulta.
 * @param {boolean} useToken - Si true, añade el token en headers.
 * @returns {Promise<Array>} - Lista de registros devueltos por la API.
 */
async function obtenerIncendios(params = {}, useToken = false) {
  const query = new URLSearchParams({
    "$limit": 5000,
    ...params
  });

  const url = `${BASE_URL}?${query.toString()}`;
  const fetchOptions = useToken ? { headers: { "X-App-Token": APP_TOKEN } } : {};

  try {
    const respuesta = await fetch(url, fetchOptions);
    if (!respuesta.ok) throw new Error("Error en la petición: " + respuesta.status);
    const datos = await respuesta.json();
    console.log("Se han obtenido", datos.length, "registros.");
    document.getElementById("output").textContent = JSON.stringify(datos, null, 2);
    return datos;
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    document.getElementById("output").textContent = "Error al obtener los datos: " + error.message;
  }
}

// Ejemplos de uso:

// 1. Filtrar por fecha de incendio
//obtenerIncendios({ data_incendi: "2025-01-11T00:00:00.000" });

// 2. Filtrar por código de comarca
//obtenerIncendios({ codi_comarca: "11" });

// 3. Filtrar por nombre de comarca
//obtenerIncendios({ comarca: "Baix Llobregat" });

// 4. Filtrar por código de municipio
//obtenerIncendios({ codi_municipi: "80898" });

// 5. Filtrar por nombre de municipio
//obtenerIncendios({ termemunic: "Gavà" });

// 6. Filtrar por hectáreas arboladas
//obtenerIncendios({ haarbrades: "0" });

// 7. Filtrar por hectáreas no arboladas
//obtenerIncendios({ hanoarbrad: "0.006" });

// 8. Filtrar por hectáreas no forestales
//obtenerIncendios({ hanoforest: "0" });

// 9. Filtrar por hectáreas forestales
//obtenerIncendios({ haforestal: "0.006" });


/*obtenerIncendios({ "$limit": 5 }).then(data => {
    console.log(data[0]); // así puedes ver los nombres exactos de los campos para filtrar
  });*/


/**
 * Devuelve valores únicos para un campo, opcionalmente con token.
 * @param {string} campo
 * @param {boolean} useToken
 * @returns {Promise<string[]>}
 */
async function getAll(campo, useToken = false) {
  const query = new URLSearchParams({
    "$select": `distinct ${campo}`,
    "$limit": 5000
  });

  const url = `${BASE_URL}?${query.toString()}`;
  const fetchOptions = useToken ? { headers: { "X-App-Token": APP_TOKEN } } : {};

  try {
    const res = await fetch(url, fetchOptions);
    if (!res.ok) throw new Error("Error en la petición: " + res.status);
    const data = await res.json();
    return data
      .map(item => item[campo])
      .filter(v => v != null && v !== "")
      .sort((a, b) => a.toString().localeCompare(b.toString(), 'es'));
  } catch (error) {
    console.error(`Error al obtener valores únicos para ${campo}:`, error);
    return [];
  }
}


// Ejemplo para inicializar dropdowns usando:
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("dropdowns");
  const campos = [
    "data_incendi",
    "codi_comarca",
    "comarca",
    "codi_municipi",
    "termemunic",
    "haarbrades",
    "hanoarbrad",
    "hanoforest",
    "haforestal"
  ];

  // Guardamos los selects en un objeto para fácil acceso
  const selects = {};

  // Función para cargar opciones para un select
  async function cargarOpciones(campo) {
    const select = selects[campo];
    select.innerHTML = "";

    // Opción por defecto
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = `--Selecciona ${campo}--`;
    select.appendChild(defaultOption);

    const opciones = await getAll(campo);
    opciones.forEach(valor => {
      const option = document.createElement("option");
      option.value = valor;
      option.textContent = valor;
      select.appendChild(option);
    });
  }

  // Función que se ejecuta al cambiar un select
  async function onChangeSelect(campoCambiado) {
    // Resetear los demás selects
    for (const campo of campos) {
      if (campo !== campoCambiado) {
        selects[campo].selectedIndex = 0;
        await cargarOpciones(campo); // recargar opciones
      }
    }

    // Hacer la petición filtrada con el valor seleccionado
    const valor = selects[campoCambiado].value;
    if (valor) {
      await obtenerIncendios({ [campoCambiado]: valor });
    } else {
      document.getElementById("output").textContent = "";
    }
  }

  // Crear todos los selects con sus labels
  for (const campo of campos) {
    const label = document.createElement("label");
    label.setAttribute("for", `${campo}-select`);
    label.textContent = `Filtrar por ${campo}:`;
    container.appendChild(label);

    const select = document.createElement("select");
    select.id = `${campo}-select`;
    selects[campo] = select;

    // Evento change
    select.addEventListener("change", () => onChangeSelect(campo));

    container.appendChild(select);
  }

  // Cargar opciones iniciales para todos los selects
  for (const campo of campos) {
    await cargarOpciones(campo);
  }
});
