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

obtenerIncendios({ "$limit": 5 }).then(data => {
    console.log(data[0]); // así puedes ver los nombres exactos de los campos para filtrar
  });
  