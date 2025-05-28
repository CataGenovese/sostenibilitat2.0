const BASE_URL = "https://analisi.transparenciacatalunya.cat/resource/9r29-e8ha.json";
const APP_TOKEN = "ISZKwx5fLfNNV_l_vd0ChqUENodaPj5vhxb2"; // Reemplaza con tu token real de aplicación

// para obtener tu propio token tienes que registrarte en la web https://analisi.transparenciacatalunya.cat/login
//documentación para obtener el token: https://dev.socrata.com/docs/app-tokens.html


/**
 * Realiza una petición a la API de incendios forestales con los parámetros indicados.
 * @param {Object} params - Parámetros para filtrar la consulta.
 * @returns {Promise<Array>} - Lista de registros devueltos por la API.
 */

/*async function obtenerIncendios(params = {}) {
    const query = new URLSearchParams({
        "$limit": 5000,
        "$$app_token": APP_TOKEN,
        ...params
    });

    try {
        const respuesta = await fetch(`${BASE_URL}?${query}`);
        if (!respuesta.ok) throw new Error("Error en la petición: " + respuesta.status);
        const datos = await respuesta.json();
        console.log("Se han obtenido", datos.length, "registros.");
        console.log(datos);
        document.getElementById("output").textContent = JSON.stringify(datos, null, 2);
        return datos;
    } catch (error) {
        console.error("Error al obtener los datos:", error);
        document.getElementById("output").textContent = "Error al obtener los datos.";
    }
}*/

async function obtenerIncendios(params = {}) {
    const query = new URLSearchParams({
      "$limit": 5000,
      ...params
    });
  
    try {
      const respuesta = await fetch(`${BASE_URL}?${query}`, {
        headers: {
          "X-App-Token": APP_TOKEN
        }
      });
  
      if (!respuesta.ok) throw new Error("Error en la petición: " + respuesta.status);
      const datos = await respuesta.json();
      console.log("Se han obtenido", datos.length, "registros.");
      console.log(datos);
      document.getElementById("output").textContent = JSON.stringify(datos, null, 2);
      return datos;
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      document.getElementById("output").textContent = "Error al obtener los datos."+ error.message;
    }
  }
  

// Ejemplos de uso:

// 1. Filtrar por fecha de incendio
obtenerIncendios({ data_incendi: "2025-01-11T00:00:00.000" });

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
