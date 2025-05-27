// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    fetch('/dates')
      .then(res => res.json())
      .then(fechas => {
        // Contar incendios por mes (simplificado)
        const counts = {};
        
        fechas.forEach(f => {
          const mes = new Date(f).toLocaleString('es-ES', { month: 'long' });
          counts[mes] = (counts[mes] || 0) + 1;
        });
  
        // Ordenar meses por calendario
        const mesesOrdenados = [
          'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
          'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];
  
        const meses = mesesOrdenados.filter(mes => counts[mes]);
        const valores = meses.map(mes => counts[mes]);
  
        const data = [{
          x: meses,
          y: valores,
          type: 'bar',
          marker: { color: 'orange' }
        }];
  
        const layout = {
          title: 'Número de Incendios por Mes',
          xaxis: { title: 'Mes', tickangle: -45 },
          yaxis: { title: 'Número de Incendios' },
          margin: { t: 50, b: 100 }
        };
  
        Plotly.newPlot('grafico_incendios', data, layout);
      })
      .catch(error => console.error('Error cargando fechas:', error));
  });
  