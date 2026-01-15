let allTiles = [];

async function loadTiles() {
  try {
    const res = await fetch("data/tiles.json");
    if (!res.ok) throw new Error('Network response was not ok');
    const tilesArray = await res.json();
    
    // Transform the data to match expected structure
    allTiles = tilesArray.map(tile => {
      // Combine all required goods from the different categories
      const requiresGoods = [
        ...tile.requires.raw,
        ...tile.requires.processed,
        ...tile.requires.luxury
      ];
      
      // Handle money requirements and tile requirements
      const requiresOther = [];
      if (tile.requires.money > 0) {
        requiresOther.push(`£${tile.requires.money}`);
      }
      // Add any tile requirements if they exist
      requiresOther.push(...tile.requires.tiles);
      
      // Combine all produced goods
      const produces = [
        ...tile.produces.raw,
        ...tile.produces.processed,
        ...tile.produces.luxury
      ];
      
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
  const resourceChain = document.getElementById("filter-resource-chain").value;

  let filtered = allTiles.filter(tile => {
    if (search && !tile.name.toLowerCase().includes(search)) return false;
    if (type && !tile.type.includes(type)) return false;
    if (gen && tile.generation !== gen) return false;
    if (resourceChain && !isInResourceChain(tile, resourceChain)) return false;
    return true;
  });

  // Sort by tile type when resource chain filter is active
  if (resourceChain) {
    const typeOrder = {
      'Resource': 1,
      'Industrial': 2,
      'Residential': 3,
      'Commercial': 4,
      'Public': 5
    };

    const genOrder = {
      'I': 1,
      'II': 2,
      'III': 3,
      'C': 4
    };

    filtered = filtered.sort((a, b) => {
      const aTypeOrder = typeOrder[a.type.split(' ')[0]] || 99;
      const bTypeOrder = typeOrder[b.type.split(' ')[0]] || 99;
      
      // First sort by tile type
      if (aTypeOrder !== bTypeOrder) {
        return aTypeOrder - bTypeOrder;
      }
      
      // Then sort by generation within the same type
      const aGenOrder = genOrder[a.generation] || 99;
      const bGenOrder = genOrder[b.generation] || 99;
      return aGenOrder - bGenOrder;
    });
  }

  renderTiles(filtered);
}

function isInResourceChain(tile, chain) {
  // Define resource chains as production relationships
  const resourceChains = {
    // Raw resources
    stone: { type: 'raw', produces: ['Stone'], chain: ['Stone', 'Concrete', 'Glass', 'Jewelry'] },
    gas: { type: 'raw', produces: ['Gas'], chain: ['Gas', 'Plastics', 'Sports Cars'] },
    oil: { type: 'raw', produces: ['Oil'], chain: ['Oil', 'Plastics', 'Sports Cars'] },
    ore: { type: 'raw', produces: ['Ore'], chain: ['Ore', 'Gold', 'Copper', 'Steel', 'Electronics', 'Jewelry'] },
    wood: { type: 'raw', produces: ['Wood'], chain: ['Wood', 'Lumber'] },
    coal: { type: 'raw', produces: ['Coal'], chain: ['Coal', 'Diamonds', 'Steel', 'Electronics', 'Jewelry'] },
    
    // Processed goods
    concrete: { type: 'processed', produces: ['Concrete'], chain: ['Stone', 'Concrete'] },
    glass: { type: 'processed', produces: ['Glass'], chain: ['Stone', 'Glass', 'Jewelry', 'Sports Cars'] },
    plastics: { type: 'processed', produces: ['Plastics'], chain: ['Gas', 'Oil', 'Plastics', 'Sports Cars'] },
    gold: { type: 'processed', produces: ['Gold'], chain: ['Ore', 'Gold', 'Jewelry'] },
    copper: { type: 'processed', produces: ['Copper'], chain: ['Ore', 'Copper', 'Electronics'] },
    lumber: { type: 'processed', produces: ['Lumber'], chain: ['Wood', 'Lumber'] },
    diamonds: { type: 'processed', produces: ['Diamonds'], chain: ['Coal', 'Diamonds', 'Electronics', 'Jewelry'] },
    steel: { type: 'processed', produces: ['Steel'], chain: ['Coal', 'Ore', 'Steel', 'Electronics', 'Sports Cars'] },
    
    // Luxury goods
    electronics: { type: 'luxury', produces: ['Electronics'], chain: ['Steel', 'Copper', 'Diamonds', 'Electronics'] },
    jewelry: { type: 'luxury', produces: ['Jewelry'], chain: ['Gold', 'Glass', 'Diamonds', 'Jewelry'] },
    'sports-cars': { type: 'luxury', produces: ['Sports Cars'], chain: ['Plastics', 'Steel', 'Glass', 'Sports Cars'] }
  };

  const chainData = resourceChains[chain];
  if (!chainData) return true; // Invalid chain, show all

  const resources = chainData.chain;

  // Check if tile produces any of these resources
  const producesAny = resources.some(resource => 
    tile.produces.includes(resource)
  );

  // Check if tile requires any of these resources
  const requiresAny = resources.some(resource => 
    tile.requiresGoods.includes(resource)
  );

  return producesAny || requiresAny;
}

document.getElementById("search").addEventListener("input", applyFilters);
document.getElementById("filter-type").addEventListener("change", applyFilters);
document.getElementById("filter-generation").addEventListener("change", applyFilters);
document.getElementById("filter-resource-chain").addEventListener("change", applyFilters);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadTiles);
} else {
  loadTiles();
}
