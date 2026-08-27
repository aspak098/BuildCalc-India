(() => {
  "use strict";

  const qs = (sel, root = document) => root.querySelector(sel);
  const num = (form, name) => Number(form.elements[name]?.value || 0);
  const fmt = (value, digits = 2) =>
    Number(value).toLocaleString("en-IN", { maximumFractionDigits: digits });

  function valid(...values) {
    return values.every(v => Number.isFinite(v) && v >= 0);
  }

  function calculateTile(form) {
    const length = num(form, "length");
    const width = num(form, "width");
    const tileLength = num(form, "tileLength");
    const tileWidth = num(form, "tileWidth");
    const wastage = num(form, "wastage");

    if (!valid(length, width, tileLength, tileWidth, wastage) || !length || !width || !tileLength || !tileWidth)
      throw new Error("Please enter valid measurements.");

    const roomArea = length * width;
    const tileArea = tileLength * tileWidth;
    const base = roomArea / tileArea;
    const required = Math.ceil(base * (1 + wastage / 100));

    return `Floor area: ${fmt(roomArea)} sq ft • Tiles needed: ${fmt(required, 0)} (incl. ${fmt(wastage, 1)}% wastage)`;
  }

  function calculatePaint(form) {
    const length = num(form, "length");
    const width = num(form, "width");
    const height = num(form, "height");
    const openings = num(form, "openings");
    const coats = num(form, "coats");
    const coverage = num(form, "coverage");

    if (!valid(length, width, height, openings, coats, coverage) || !height || !coats || !coverage)
      throw new Error("Please enter valid measurements.");

    const wallArea = 2 * (length + width) * height;
    const netArea = Math.max(0, wallArea - openings);
    const litres = (netArea * coats) / coverage;

    return `Paint required: ${fmt(litres)} L • Net wall area: ${fmt(netArea)} sq ft`;
  }

  function calculateConcrete(form) {
    const length = num(form, "length");
    const width = num(form, "width");
    const thickness = num(form, "thickness");
    const unit = form.elements.unit.value;

    if (!valid(length, width, thickness) || !length || !width || !thickness)
      throw new Error("Please enter valid measurements.");

    const volume = length * width * thickness;
    if (unit === "ft") {
      return `Concrete volume: ${fmt(volume)} cu ft (${fmt(volume * 0.0283168466)} m³)`;
    }
    return `Concrete volume: ${fmt(volume)} m³ (${fmt(volume * 35.3146667)} cu ft)`;
  }

  function calculateBrick(form) {
    const length = num(form, "length");
    const height = num(form, "height");
    const thickness = num(form, "thickness");
    const wastage = num(form, "wastage");

    if (!valid(length, height, thickness, wastage) || !length || !height)
      throw new Error("Please enter valid measurements.");

    const wallArea = length * height;
    // Common estimating values: ~5 bricks/sq ft for 4.5" wall and ~10 bricks/sq ft for 9" wall.
    const bricksPerSqFt = thickness <= 4.5 ? 5 : 10;
    const required = Math.ceil(wallArea * bricksPerSqFt * (1 + wastage / 100));

    return `Wall area: ${fmt(wallArea)} sq ft • Bricks needed: ${fmt(required, 0)} (estimate)`;
  }

  function calculateArea(form) {
    const length = num(form, "length");
    const width = num(form, "width");
    const unit = form.elements.unit.value;

    if (!valid(length, width) || !length || !width)
      throw new Error("Please enter valid measurements.");

    const area = length * width;
    if (unit === "ft") return `Area: ${fmt(area)} sq ft (${fmt(area * 0.09290304)} m²)`;
    return `Area: ${fmt(area)} m² (${fmt(area * 10.7639104)} sq ft)`;
  }

  function calculateVolume(form) {
    const length = num(form, "length");
    const width = num(form, "width");
    const height = num(form, "height");
    const unit = form.elements.unit.value;

    if (!valid(length, width, height) || !length || !width || !height)
      throw new Error("Please enter valid measurements.");

    const volume = length * width * height;
    if (unit === "ft") return `Volume: ${fmt(volume)} cu ft (${fmt(volume * 0.0283168466)} m³)`;
    return `Volume: ${fmt(volume)} m³ (${fmt(volume * 35.3146667)} cu ft)`;
  }

  const calculators = {
    tile: calculateTile,
    paint: calculatePaint,
    concrete: calculateConcrete,
    brick: calculateBrick,
    area: calculateArea,
    volume: calculateVolume
  };

  document.querySelectorAll(".calc-form").forEach(form => {
    form.addEventListener("submit", event => {
      event.preventDefault();
      const output = qs(".result", form);
      try {
        output.textContent = calculators[form.dataset.calc](form);
      } catch (error) {
        output.textContent = error.message || "Please check your inputs.";
      }
    });
  });

  const search = qs("#calculatorSearch");
  const cards = [...document.querySelectorAll(".calc-card")];
  const count = qs("#searchCount");

  function filterCards() {
    const query = search.value.trim().toLowerCase();
    let shown = 0;
    cards.forEach(card => {
      const haystack = `${card.dataset.search} ${card.textContent}`.toLowerCase();
      const match = !query || haystack.includes(query);
      card.hidden = !match;
      if (match) shown++;
    });
    count.textContent = query ? `${shown} calculator${shown === 1 ? "" : "s"} found` : "";
  }

  search.addEventListener("input", filterCards);
})();
