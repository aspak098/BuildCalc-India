(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);

  // Read a number safely. Empty/invalid values are rejected,
  // while valid decimals such as 2.5, 0.5 etc. work normally.
  function getNumber(form, name, label) {
    const field = form.elements[name];
    const raw = field ? field.value.trim() : "";

    if (raw === "") {
      throw new Error(`Please enter ${label}.`);
    }

    const n = Number(raw);

    if (!Number.isFinite(n) || n < 0) {
      throw new Error(`Please enter a valid ${label}.`);
    }

    return n;
  }

  function requiredPositive(form, name, label) {
    const n = getNumber(form, name, label);
    if (n <= 0) throw new Error(`${label} must be greater than 0.`);
    return n;
  }

  function format(n, decimals = 2) {
    return Number(n).toLocaleString("en-IN", {
      maximumFractionDigits: decimals
    });
  }

  // 1. TILE CALCULATOR
  function tile(form) {
    const length = requiredPositive(form, "length", "room length");
    const width = requiredPositive(form, "width", "room width");
    const tileLength = requiredPositive(form, "tileLength", "tile length");
    const tileWidth = requiredPositive(form, "tileWidth", "tile width");
    const wastage = getNumber(form, "wastage", "wastage percentage");

    const roomArea = length * width;
    const tileArea = tileLength * tileWidth;
    const tilesWithoutWastage = roomArea / tileArea;
    const tiles = Math.ceil(tilesWithoutWastage * (1 + wastage / 100));

    return `
      <strong>Result</strong><br>
      Floor Area: ${format(roomArea)} sq ft<br>
      Tiles without wastage: ${format(Math.ceil(tilesWithoutWastage), 0)}<br>
      <b>Tiles Required: ${format(tiles, 0)}</b>
    `;
  }

  // 2. PAINT CALCULATOR
  function paint(form) {
    const length = requiredPositive(form, "length", "room length");
    const width = requiredPositive(form, "width", "room width");
    const height = requiredPositive(form, "height", "wall height");
    const openings = getNumber(form, "openings", "doors and windows area");
    const coats = requiredPositive(form, "coats", "number of coats");
    const coverage = requiredPositive(form, "coverage", "paint coverage");

    const grossWallArea = 2 * (length + width) * height;
    const netWallArea = Math.max(0, grossWallArea - openings);
    const litres = (netWallArea * coats) / coverage;

    return `
      <strong>Result</strong><br>
      Wall Area: ${format(grossWallArea)} sq ft<br>
      Net Paint Area: ${format(netWallArea)} sq ft<br>
      <b>Paint Required: ${format(litres)} litres</b>
    `;
  }

  // 3. CONCRETE CALCULATOR
  function concrete(form) {
    const length = requiredPositive(form, "length", "length");
    const width = requiredPositive(form, "width", "width");
    const thickness = requiredPositive(form, "thickness", "thickness");
    const unit = form.elements.unit.value;

    const volume = length * width * thickness;

    if (unit === "ft") {
      const cubicMetres = volume * 0.0283168466;
      return `
        <strong>Result</strong><br>
        <b>Concrete: ${format(volume)} cubic feet</b><br>
        Concrete: ${format(cubicMetres)} cubic metres
      `;
    }

    const cubicFeet = volume * 35.3146667;
    return `
      <strong>Result</strong><br>
      <b>Concrete: ${format(volume)} cubic metres</b><br>
      Concrete: ${format(cubicFeet)} cubic feet
    `;
  }

  // 4. BRICK CALCULATOR
  function brick(form) {
    const length = requiredPositive(form, "length", "wall length");
    const height = requiredPositive(form, "height", "wall height");
    const thickness = Number(form.elements.thickness.value);
    const wastage = getNumber(form, "wastage", "wastage percentage");

    const wallArea = length * height;

    // Approximate Indian construction estimate:
    // 4.5 inch wall ≈ 5 bricks/sq ft
    // 9 inch wall ≈ 10 bricks/sq ft
    const bricksPerSqFt = thickness === 4.5 ? 5 : 10;
    const baseBricks = wallArea * bricksPerSqFt;
    const bricks = Math.ceil(baseBricks * (1 + wastage / 100));

    return `
      <strong>Result</strong><br>
      Wall Area: ${format(wallArea)} sq ft<br>
      Bricks before wastage: ${format(Math.ceil(baseBricks), 0)}<br>
      <b>Estimated Bricks Required: ${format(bricks, 0)}</b>
    `;
  }

  // 5. AREA CALCULATOR
  function area(form) {
    const length = requiredPositive(form, "length", "length");
    const width = requiredPositive(form, "width", "width");
    const unit = form.elements.unit.value;

    const result = length * width;

    if (unit === "ft") {
      return `
        <strong>Result</strong><br>
        <b>Area: ${format(result)} sq ft</b><br>
        Area: ${format(result * 0.09290304)} m²
      `;
    }

    return `
      <strong>Result</strong><br>
      <b>Area: ${format(result)} m²</b><br>
      Area: ${format(result * 10.7639104)} sq ft
    `;
  }

  // 6. VOLUME CALCULATOR
  function volume(form) {
    const length = requiredPositive(form, "length", "length");
    const width = requiredPositive(form, "width", "width");
    const height = requiredPositive(form, "height", "height");
    const unit = form.elements.unit.value;

    const result = length * width * height;

    if (unit === "ft") {
      return `
        <strong>Result</strong><br>
        <b>Volume: ${format(result)} cubic feet</b><br>
        Volume: ${format(result * 0.0283168466)} m³
      `;
    }

    return `
      <strong>Result</strong><br>
      <b>Volume: ${format(result)} m³</b><br>
      Volume: ${format(result * 35.3146667)} cubic feet
    `;
  }

  const calculators = {
    tile,
    paint,
    concrete,
    brick,
    area,
    volume
  };

  // Make every calculator button work.
  document.querySelectorAll("form[data-calculator]").forEach(form => {
    form.addEventListener("submit", event => {
      event.preventDefault();

      const result = $(".result", form);
      const calculator = calculators[form.dataset.calculator];

      try {
        if (!calculator) throw new Error("Calculator not found.");

        result.innerHTML = calculator(form);
        result.classList.add("show");
        result.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } catch (error) {
        result.innerHTML = `<strong>Error:</strong> ${error.message}`;
        result.classList.add("show");
      }
    });
  });

  // Calculator search.
  const search = $("#calculatorSearch");
  const cards = [...document.querySelectorAll(".card")];
  const searchCount = $("#searchCount");

  if (search) {
    search.addEventListener("input", () => {
      const query = search.value.trim().toLowerCase();
      let visible = 0;

      cards.forEach(card => {
        const searchableText =
          `${card.dataset.search || ""} ${card.textContent}`.toLowerCase();

        const match = query === "" || searchableText.includes(query);

        card.hidden = !match;
        if (match) visible++;
      });

      searchCount.textContent =
        query ? `${visible} calculator${visible === 1 ? "" : "s"} found` : "";
    });
  }
})();
