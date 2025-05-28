const BASE_URL = "https://analisi.transparenciacatalunya.cat/resource/9r29-e8ha.json";
const APP_TOKEN = "ISZKwx5fLfNNV_l_vd0ChqUENodaPj5vhxb2";

const buscarBtn = document.getElementById("buscarBtn");
const graficoCanvas = document.getElementById("grafico");
let grafico = null;

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

const selects = {};

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

function actualizarBotonBuscar() {
  const haySeleccionado = Object.values(selects).some(select => select.value);
  buscarBtn.style.display = haySeleccionado ? "inline-block" : "none";
}

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("dropdowns");

  for (const campo of campos) {
    const label = document.createElement("label");
    label.setAttribute("for", `${campo}-select`);
    label.textContent = `Filtrar por ${campo}:`;
    container.appendChild(label);

    const select = document.createElement("select");
    select.id = `${campo}-select`;
    selects[campo] = select;

    select.addEventListener("change", () => {
      actualizarBotonBuscar();
    });

    container.appendChild(select);
  }

  for (const campo of campos) {
    const select = selects[campo];
    select.innerHTML = "";

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
});

buscarBtn.addEventListener("click", async () => {
  const filtros = {};
  for (const campo of campos) {
    const valor = selects[campo].value;
    if (valor) filtros[campo] = valor;
  }

  const datos = await obtenerIncendios(filtros);
  if (!datos || datos.length === 0) {
    alert("No se han encontrado datos.");
    return;
  }

  const labels = datos.map(d => d.data_incendi?.split("T")[0]);
  const valores = datos.map(d => parseFloat(d.haforestal) || 0);

  if (grafico) grafico.destroy();
  grafico = new Chart(graficoCanvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Hectáreas forestales afectadas',
        data: valores,
        backgroundColor: 'rgba(56, 142, 60, 0.6)',
        borderColor: 'rgba(56, 142, 60, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        x: { title: { display: true, text: 'Fecha' } },
        y: { beginAtZero: true, title: { display: true, text: 'Hectáreas' } }
      }
    }
  });
});
