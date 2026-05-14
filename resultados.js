document.addEventListener('DOMContentLoaded', () => {
  const voters = JSON.parse(localStorage.getItem('cinevota_voters')) || [];
  const courses = JSON.parse(localStorage.getItem('cinevota_courses')) || [];
  
  // Render Table
  document.getElementById('r-total').textContent = voters.length;
  const tbody = document.getElementById('r-tbody');
  
  if (voters.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state">Aún no hay evaluaciones registradas en esta sesión.</div></td></tr>`;
  } else {
    // Reverse to show newest first
    const sortedVoters = [...voters].reverse();

    tbody.innerHTML = sortedVoters.map((v, index) => {
      let dateStr = '—';
      if(v.date) {
        const dateObj = new Date(v.date);
        dateStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      }
      
      let ratingsHtml = '';
      if(v.ratings && Object.keys(v.ratings).length > 0) {
        ratingsHtml = Object.keys(v.ratings).map(cId => {
          const course = courses.find(c => c.id === parseInt(cId));
          const stars = v.ratings[cId];
          if(course) {
            return `<div style="margin-bottom:4px; display:inline-block; margin-right:10px; background:var(--off); padding:3px 8px; border-radius:6px; font-size:0.8rem; border:1px solid var(--g200);">
              <span style="opacity:0.7">${course.tag}:</span> <strong style="color:#FFD700; text-shadow:0 0 2px rgba(255,215,0,0.5)">${stars}⭐</strong>
            </div>`;
          }
          return '';
        }).join('');
      } else {
        // Fallback for old simple votes
        const course = courses.find(c => c.id === v.courseId);
        if(course) ratingsHtml = `<div class="course-badge" style="background:${course.bg}; color:${course.fg};"><span>${course.emoji}</span> Votó por este</div>`;
      }

      return `
        <tr>
          <td style="color:var(--g500); font-weight:600;">${voters.length - index}</td>
          <td><div style="font-weight:700; color:var(--g900); display:flex; align-items:center; gap:0.5rem;"><span style="background:var(--g100); padding:5px; border-radius:50%; font-size:12px;">👤</span> ${v.name}</div></td>
          <td style="color:var(--g700); font-size:0.85rem;">${dateStr}</td>
          <td>${ratingsHtml}</td>
        </tr>
      `;
    }).join('');
  }

  // Render Chart.js
  const ctx = document.getElementById('resultsChart');
  if(!ctx) return;

  const labels = courses.map(c => c.emoji + " " + c.name);
  const dataAverages = courses.map(c => c.ratingCount > 0 ? (c.totalStars / c.ratingCount).toFixed(2) : 0);
  const colors = courses.map(c => c.c1);
  const borderColors = courses.map(c => c.c2);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Promedio de Estrellas',
        data: dataAverages,
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 2,
        borderRadius: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return 'Promedio: ' + context.parsed.y + ' ⭐';
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 5,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
});

window.triggerAdminReset = function() {
  const pwd = prompt("🔐 Acceso Administrativo\nIngresa la contraseña para reiniciar todas las votaciones:");
  if (pwd === "admin123") {
    if(confirm("⚠️ ADVERTENCIA: Estás a punto de borrar todos los votos y empezar de cero. ¿Estás absolutamente seguro?")) {
      localStorage.removeItem('cinevota_courses');
      localStorage.removeItem('cinevota_voters');
      alert("✅ El sistema ha sido reiniciado con éxito.");
      window.location.reload();
    }
  } else if (pwd !== null) {
    alert("❌ Contraseña incorrecta.");
  }
};
