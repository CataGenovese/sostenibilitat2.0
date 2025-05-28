const colorScale = {
  'Muy alta': 'red',
  'Alta': 'orange',
  'Media': 'yellow',
  'Baja': 'green'
};

function initMapa() {
  const map = L.map('map_inc', {
    zoomControl: true,
    dragging: true,
    tap: false // Esto evita que Leaflet capture eventos táctiles fuera del mapa
  }).setView([41.8, 1.6], 8); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  Papa.parse("/public/datos/Incendis_con_coordenades_complet (1).csv", {
    header: true,
    download: true,
    complete: function (results) {
      const data = results.data.filter(d => d.LATITUD && d.LONGITUD);
      console.log("Datos cargados:", data); // <--- Añadido

      data.forEach(row => {
        const hf = parseFloat(row.HAFORESTAL) || 0;
        const hnf = parseFloat(row.HANOFOREST) || 0;
        row.Tipus = hf > hnf ? 'Forestal' : hf < hnf ? 'No forestal' : 'Mixta';
      });

      const resumen = {};
      let total = 0;
      data.forEach(row => {
        const tipo = row.Tipus;
        total++;
        const hf = parseFloat(row.HAFORESTAL) || 0;
        const hnf = parseFloat(row.HANOFOREST) || 0;
        if (!resumen[tipo]) resumen[tipo] = { sup: 0, count: 0 };
        resumen[tipo].sup += hf + hnf;
        resumen[tipo].count += 1;
      });

      const valores = [];
      for (let t in resumen) {
        const r = resumen[t];
        const porc = (r.count / total) * 100;
        resumen[t].valor = r.sup + porc;
        valores.push(resumen[t].valor);
      }

      valores.sort((a, b) => a - b);
      const [q1, q2, q3] = [
        valores[Math.floor(valores.length * 0.25)],
        valores[Math.floor(valores.length * 0.5)],
        valores[Math.floor(valores.length * 0.75)],
      ];

      for (let t in resumen) {
        const v = resumen[t].valor;
        resumen[t].nivel = v <= q1 ? 'Baja' : v <= q2 ? 'Media' : v <= q3 ? 'Alta' : 'Muy alta';
      }

      data.forEach(row => {
        const lat = parseFloat(row.LATITUD);
        const lon = parseFloat(row.LONGITUD);
        const tipo = row.Tipus;
        const prioridad = resumen[tipo].nivel;
        const color = colorScale[prioridad] || 'gray';

        L.circleMarker([lat, lon], {
          radius: 6,
          color: color,
          fillOpacity: 0.8
        }).bindPopup(`
          <strong>${row.TERMEMUNIC}</strong> - ${row["DATA INCENDI"]}<br>
          Tipus: ${tipo}<br>
          Prioritat: ${prioridad}
        `).addTo(map);
      });

      const legend = L.control({ position: 'bottomleft' });
      legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'legend');
        div.innerHTML = "<strong>Prioritat</strong><br>";
        for (const key in colorScale) {
          div.innerHTML += `<i style="background:${colorScale[key]}"></i> ${key}<br>`;
        }
        return div;
      };
      legend.addTo(map);
    }
  });
}

window.initMapa = initMapa;
