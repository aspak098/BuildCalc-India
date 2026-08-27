(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const value = (form, name) => Number(form.elements[name]?.value || 0);

  const format = (number, decimals = 2) =>
    Number(number).toLocaleString("en-IN", {
      maximumFractionDigits: decimals
    });

  const positive = (...numbers) =>
    numbers.every(n => Number.isFinite(n) && n > 0);

  function tile(form) {
    const L = value(form, "length");
    const W = value(form, "width");
    const tL = value(form, "tileLength");
    const tW = value(form, "tileWidth");
    const waste = value(form, "wastage");

    if (!positive(L, W, tL, tW) || waste < 0) throw new Error("Please enter valid measurements.");

    const roomArea = L * W;
    const oneTileArea = tL * tW;
    const tiles = Math.ceil((roomArea / oneTileArea) * (1 + waste / 100));

    return `Floor area: ${format(roomArea)} sq ft | Tiles required: ${format(tiles, 0)} | Wastage: ${format(waste, 1)}%`;
  }

  function paint(form) {
    const L = value(form, "length");
    const W = value(form, "width");
    const H = value(form, "height");
    const openings = value(form, "openings");
    const coats = value(form, "coats");
    const coverage = value(form, "coverage");

    if (!positive(L, W, H, coats, coverage) || openings < 0) throw new Error("Please enter valid measurements.");

    const grossWallArea = 2 * (L + W) * H;
    const netWallArea = Math.max(0, grossWallArea - openings);
    const litres = (netWallArea * coats) / coverage;

    return `Net wall area: ${format(netWallArea)} sq ft | Paint required: ${format(litres)} L`;
  }

  function concrete(form) {
    const L = value(form, "length");
    const W = value(form, "width");
    const T = value(form, "thickness");
    const unit = form.elements.unit.value;

    if (!positive(L, W, T)) throw new Error("Please enter valid measurements.");

    const volume = L * W * T;

    if (unit === "ft") {
      return `Concrete volume: ${format(volume)} cu ft | ${format(volume * 0.0283168466)} m³`;
    }
    return `Concrete volume: ${format(volume)} m³ | ${format(volume * 35.3146667)} cu ft`;
  }

  function brick(form) {
    const L = value(form, "length");
    const H = value(form, "height");
    const thickness = value(form, "thickness");
    const waste = value(form, "wastage");

    if (!positive(L, H) || waste < 0) throw new Error("Please enter valid measurements.");

    const wallArea = L * H;
    const bricksPerSqFt = thickness === 4.5 ? 5 : 10;
    const bricks = Math.ceil(wallArea * bricksPerSqFt * (1 + waste / 100));

    return `Wall area: ${format(wallArea)} sq ft | Estimated bricks: ${format(bricks, 0)} | Wastage: ${format(waste, 1)}%`;
  }

  function area(form) {
    const L = value(form, "length");
    const W = value(form, "width");
    const unit = form.elements.unit.value;

    if (!positive(L, W)) throw new Error("Please enter valid measurements.");

    const result = L * W;

    if (unit === "ft") {
      return `Area: ${format(result)} sq ft | ${format(result * 0.09290304)} m²`;
    }
    return `Area: ${format(result)} m² | ${format(result * 10.7639104)} sq ft`;
  }

  function volume(form) {
    const L = value(form, "length");
    const W = value(form, "width");
    const H = value(form, "height");
    const unit = form.elements.unit.value;

    if (!positive(L, W, H)) throw new Error("Please enter valid measurements.");

    const result = L * W * H;

    if (unit === "ft") {
      return `Volume: ${format(result)} cu ft | ${format(result * 0.0283168466)} m³`;
    }
    return `Volume: ${format(result)} m³ | ${format(result * 35.3146667)} cu ft`;
  }

  const calculators = { tile, paint, concrete, brick, area, volume };

  document.querySelectorAll("form[data-calculator]").forEach(form => {
    form.addEventListener("submit", event => {
      event.preventDefault();

      const result = $(".result", form);
      try {
        result.textContent = calculators[form.dataset.calculator](form);
        result.classList.add("show");
      } catch (error) {
        result.textContent = error.message;
        result.classList.add("show");
      }
    });
  });

  const search = $("#calculatorSearch");
  const cards = [...document.querySelectorAll(".card")];
  const count = $("#searchCount");

  search.addEventListener("input", () => {
    const query = search.value.trim().toLowerCase();
    let shown = 0;

    cards.forEach(card => {
      const text = `${card.dataset.search} ${card.textContent}`.toLowerCase();
      const match = !query || text.includes(query);
      card.hidden = !match;
      if (match) shown++;
    });

    count.textContent = query ? `${shown} calculator${shown === 1 ? "" : "s"} found` : "";
  });
})();
