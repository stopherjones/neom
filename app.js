let allTiles = [];

async function loadTiles() {
  try {
    const res = await fetch("data/tiles.json");
    if (!res.ok) throw new Error('Network response was not ok');
    const tilesArray = await res.json();
    
    // Transform the data to match expected structure
    allTiles = tilesArray.map(tile => {
      let requiresGoods = [];
      let requiresOther = [];
      
      if (tile.requires !== "none") {
        const reqs = tile.requires.split(',').map(r => r.trim());
        reqs.forEach(req => {
          if (req.startsWith('£') || /^\d+$/.test(req)) {
            requiresOther.push(req);
          } else {
            requiresGoods.push(req);
          }
        });
      }
      
      const produces = tile.produces ? tile.produces.split(',').map(p => p.trim()) : [];
      
      return {
        ...tile,
        requiresGoods,
        requiresOther,
        produces
      };
    });
    
    renderTiles(allTiles);
  } catch (error) {
    console.error('Error loading tiles:', error);
  }
}

function renderTiles(tiles) {
  const container = document.getElementById("tiles");
  if (!container) {
    console.error('Container #tiles not found!');
    return;
  }
  container.innerHTML = "";

  tiles.forEach(tile => {
    const div = document.createElement("div");
    div.className = `tile ${tile.type.split(' & ')[0].toLowerCase()}`;

    div.innerHTML = `
      <h2>${tile.name}</h2>
      <div class="meta">
        Gen ${tile.generation} • ${tile.type}
      </div>

      <div><strong>Requires:</strong> 
        ${(tile.requiresGoods || []).map(g => `<span class="pill">${g}</span>`).join("")}
        ${(tile.requiresOther || []).map(o => `<span class="pill">${o}</span>`).join("")}
      </div>

      <div><strong>Produces:</strong> 
        ${(tile.produces || []).length
          ? (tile.produces || []).map(g => `<span class="pill">${g}</span>`).join("")
          : "<span class='pill'>—</span>"}
      </div>

      <p>${tile.description || ""}</p>
    `;

    container.appendChild(div);
  });
}

function applyFilters() {
  const search = document.getElementById("search").value.toLowerCase();
  const type = document.getElementById("filter-type").value;
  const gen = document.getElementById("filter-generation").value;

  const filtered = allTiles.filter(tile => {
    if (search && !tile.name.toLowerCase().includes(search)) return false;
    if (type && !tile.type.includes(type)) return false;
    if (gen && tile.generation !== gen) return false;
    return true;
  });

  renderTiles(filtered);
}

document.getElementById("search").addEventListener("input", applyFilters);
document.getElementById("filter-type").addEventListener("change", applyFilters);
document.getElementById("filter-generation").addEventListener("change", applyFilters);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadTiles);
} else {
  loadTiles();
}
