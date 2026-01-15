let allTiles = {};

async function loadTiles() {
  const res = await fetch("data/tiles.json");
  allTiles = await res.json();
  renderTiles(Object.values(allTiles));
}

function renderTiles(tiles) {
  const container = document.getElementById("tiles");
  container.innerHTML = "";

  tiles.forEach(tile => {
    const div = document.createElement("div");
    div.className = `tile ${tile.type.toLowerCase()}`;

    div.innerHTML = `
      <h2>${tile.name}</h2>
      <div class="meta">
        Gen ${tile.generation} • ${tile.type}
      </div>

      <div><strong>Requires:</strong> 
        ${tile.requiresGoods.map(g => `<span class="pill">${g}</span>`).join("")}
        ${tile.requiresOther.map(o => `<span class="pill">${o}</span>`).join("")}
      </div>

      <div><strong>Produces:</strong> 
        ${tile.produces.length
          ? tile.produces.map(g => `<span class="pill">${g}</span>`).join("")
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

  const filtered = Object.values(allTiles).filter(tile => {
    if (search && !tile.name.toLowerCase().includes(search)) return false;
    if (type && tile.type !== type) return false;
    if (gen && tile.generation !== gen) return false;
    return true;
  });

  renderTiles(filtered);
}

document.getElementById("search").addEventListener("input", applyFilters);
document.getElementById("filter-type").addEventListener("change", applyFilters);
document.getElementById("filter-generation").addEventListener("change", applyFilters);

loadTiles();
