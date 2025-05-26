const BASE_URL = "https://analisi.transparenciacatalunya.cat/resource/9r29-e8ha.json";

/**
 * Realiza una petición a la API de incendios forestales sin app token.
 * @param {Object} params - Parámetros para filtrar la consulta.
 * @returns {Promise<Array>} - Lista de registros devueltos por la API.
 */
async function obtenerIncendios(params = {}) {
  const query = new URLSearchParams({
    "$limit": 5000,
    ...params
  });

  try {
    const respuesta = await fetch(`${BASE_URL}?${query.toString()}`);

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

/*obtenerIncendios({ "$limit": 5 }).then(data => {
    console.log(data[0]); // así puedes ver los nombres exactos de los campos para filtrar
  });*/

/**
 * Devuelve todos los valores únicos de un campo.
 * @param {string} campo
 * @returns {Promise<string[]>}
 */
async function getAll(campo) {
  try {
    const res = await fetch(`${BASE_URL}?$select=distinct ${campo}&$limit=5000`);
    const data = await res.json();
    return data
      .map(item => item[campo])
      .filter(v => v != null && v !== "")
      .sort((a, b) => a.localeCompare(b, 'es'));
  } catch (error) {
    console.error(`Error al obtener valores únicos para ${campo}:`, error);
    return [];
  }
}

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

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("dropdowns");

  for (const campo of campos) {
    // Crea label
    const label = document.createElement("label");
    label.setAttribute("for", `${campo}-select`);
    label.textContent = `Filtrar por ${campo}:`;
    container.appendChild(label);

    // Crea select
    const select = document.createElement("select");
    select.id = `${campo}-select`;
    select.style.marginBottom = "1em";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = `--Selecciona ${campo}--`;
    select.appendChild(defaultOption);

    // Carga opciones únicas
    const opciones = await getAll(campo);
    opciones.forEach(valor => {
      const option = document.createElement("option");
      option.value = valor;
      option.textContent = valor;
      select.appendChild(option);
    });

    // Evento al cambiar opción
    select.addEventListener("change", async () => {
      const valorSeleccionado = select.value;
      if (valorSeleccionado) {
        await obtenerIncendios({ [campo]: valorSeleccionado });
      }
    });

    // Añade al contenedor
    container.appendChild(select);
    container.appendChild(document.createElement("br"));
  }
});


