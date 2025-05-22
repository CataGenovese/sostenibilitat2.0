async function loadDates() {
  const res = await fetch("/dates");
  const dates = await res.json();
  const select = document.getElementById("fecha-select");
  dates.forEach(date => {
    const option = document.createElement("option");
    option.value = date;
    option.textContent = date;
    select.appendChild(option);
  });
}

async function loadComarcas() {
  const res = await fetch("/comarcas");
  const comarcas = await res.json();
  const select = document.getElementById("comarca-select");
  comarcas.forEach(comarca => {
    const option = document.createElement("option");
    option.value = comarca;
    option.textContent = comarca;
    select.appendChild(option);
  });
}

document.getElementById("fecha-select").addEventListener("change", async function() {
  const fecha = this.value;
  if (!fecha) {
    document.getElementById("details").textContent = "";
    return;
  }
  const res = await fetch(`/incendios/date/${encodeURIComponent(fecha)}`);
  const data = await res.json();
  if (data.length === 0) {
    document.getElementById("details").textContent = "No hay incendios en esa fecha.";
  } else {
    let output = `Incendios en fecha ${fecha}:\n\n`;
    data.forEach((incendio, i) => {
      output += `${i + 1}. Comarca: ${incendio.comarca} - Hectáreas quemadas: ${incendio.hectareas}\n`;
    });
    document.getElementById("details").textContent = output;
  }
});

document.getElementById("comarca-select").addEventListener("change", async function() {
  const comarca = this.value;
  if (!comarca) {
    document.getElementById("details").textContent = "";
    return;
  }
  const res = await fetch(`/incendios/comarca/${encodeURIComponent(comarca)}`);
  const data = await res.json();
  if (data.length === 0) {
    document.getElementById("details").textContent = "No hay incendios en esa comarca.";
  } else {
    let output = `Incendios en comarca ${comarca}:\n\n`;
    data.forEach((incendio, i) => {
      output += `${i + 1}. Fecha: ${incendio.fecha} - Hectáreas quemadas: ${incendio.hectareas}\n`;
    });
    document.getElementById("details").textContent = output;
  }
});

loadDates();
loadComarcas();
