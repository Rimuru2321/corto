function renderProjection() {
  const courses = JSON.parse(localStorage.getItem('cinevota_courses')) || [];
  
  const total = courses.reduce((s,c) => s + c.votes, 0);
  
  const totEl = document.getElementById('p-total');
  // Add pulse animation if value changed
  if (totEl.textContent !== total.toString()) {
    totEl.textContent = total;
    totEl.classList.remove('pulse');
    void totEl.offsetWidth; // trigger reflow
    totEl.classList.add('pulse');
  }

  const sorted = [...courses].sort((a,b) => b.votes - a.votes);
  const grid = document.getElementById('p-grid');
  
  if(grid) {
    grid.innerHTML = sorted.map((c, i) => {
      const pct = total > 0 ? Math.round(c.votes / total * 100) : 0;
      const top = i === 0 && c.votes > 0;
      
      return `
      <div class="proj-item ${top ? 'first' : ''}">
        <div class="proj-bg-bar" style="width: ${pct}%"></div>
        <div class="proj-rank">${top ? '👑' : i+1}</div>
        <div class="proj-info">
          <div class="proj-name">${c.emoji} ${c.name}</div>
          <div class="proj-stats">
            <div class="proj-pct">${pct}%</div>
            <div class="proj-votes">${c.votes} votos</div>
          </div>
        </div>
      </div>
      `;
    }).join('');
  }
}

// Initial render
document.addEventListener('DOMContentLoaded', () => {
  renderProjection();
  // Poll every 2 seconds for new votes
  setInterval(renderProjection, 2000);
});
