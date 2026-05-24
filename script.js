const shareBtn = document.getElementById("share-btn");
const themeToggle = document.getElementById("theme-toggle");
const historyList = document.getElementById("history-list");
const generateBtn = document.getElementById("generate-btn");
const paletteContainer = document.querySelector(".palette-container");

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();

    generatePalette();
  }
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const icon = themeToggle.querySelector("i");

  if (document.body.classList.contains("dark")) {
    icon.classList.replace("fa-moon", "fa-sun");
  } else {
    icon.classList.replace("fa-sun", "fa-moon");
  }
});

generateBtn.addEventListener("click", generatePalette);

paletteContainer.addEventListener("click", function (e) {
  if (e.target.classList.contains("copy-btn")) {
    const hexValue = e.target.previousElementSibling.textContent;

    navigator.clipboard
      .writeText(hexValue)
      .then(() => showCopySuccess(e.target))
      .catch((err) => console.log(err));
  } else if (e.target.classList.contains("color")) {
    const hexValue =
      e.target.nextElementSibling.querySelector(".hex-value").textContent;
    navigator.clipboard
      .writeText(hexValue)
      .then(() =>
        showCopySuccess(e.target.nextElementSibling.querySelector(".copy-btn")),
      )
      .catch((err) => console.log(err));
  }
});

function showCopySuccess(element) {
  element.classList.remove("far", "fa-copy");
  element.classList.add("fas", "fa-check");

  element.style.color = "#48bb78";

  setTimeout(() => {
    element.classList.remove("fas", "fa-check");
    element.classList.add("far", "fa-copy");
    element.style.color = "";
  }, 1500);
}

function generatePalette() {
  const colors = [];

  for (let i = 0; i < 5; i++) {
    colors.push(generateRandomColor());
  }

  savePaletteToHistory(colors);

  updatePaletteDisplay(colors);

  updateURL(colors);
}

function generateRandomColor() {
  const letters = "0123456789ABCDEF";

  let color = "#";

  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function updatePaletteDisplay(colors) {
  const colorBoxes = document.querySelectorAll(".color-box");

  colorBoxes.forEach((box, index) => {
    const color = colors[index];
    const colorDiv = box.querySelector(".color");
    const hexValue = box.querySelector(".hex-value");

    colorDiv.style.backgroundColor = color;
    hexValue.textContent = color;
  });
}

function savePaletteToHistory(colors) {
  const historyItem = document.createElement("div");

  historyItem.classList.add("history-item");

  // salvar cores no dataset
  historyItem.dataset.colors = JSON.stringify(colors);

  colors.forEach((color) => {
    const colorDiv = document.createElement("div");

    colorDiv.classList.add("history-color");

    colorDiv.style.backgroundColor = color;

    historyItem.appendChild(colorDiv);
  });

  // clique para restaurar paleta
  historyItem.addEventListener("click", () => {
    historyItem.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(0.97)" },
        { transform: "scale(1)" },
      ],
      {
        duration: 200,
      },
    );
    const savedColors = JSON.parse(historyItem.dataset.colors);

    updatePaletteDisplay(savedColors);

    updateURL(savedColors);
  });

  historyList.prepend(historyItem);

  // máximo de 5 históricos
  if (historyList.children.length > 5) {
    historyList.removeChild(historyList.lastChild);
  }
}

shareBtn.addEventListener("click", sharePalette);

async function sharePalette() {
  const currentURL = window.location.href;

  try {
    // mobile / navegador moderno
    if (navigator.share) {
      await navigator.share({
        title: "Color Palette Generator",
        text: "Check out this color palette!",
        url: currentURL,
      });
    } else {
      // fallback desktop
      await navigator.clipboard.writeText(currentURL);

      shareBtn.innerHTML = `
        <i class="fas fa-check"></i>
        Link Copied
      `;

      setTimeout(() => {
        shareBtn.innerHTML = `
          <i class="fas fa-share-alt"></i>
          Share Palette
        `;
      }, 2000);
    }
  } catch (error) {
    console.log(error);
  }
}

function updateURL(colors) {
  const colorString = colors.map((color) => color.replace("#", "")).join("-");

  const newURL = `${window.location.pathname}?colors=${colorString}`;

  window.history.replaceState({}, "", newURL);
}

function loadPaletteFromURL() {
  const params = new URLSearchParams(window.location.search);

  const colorsParam = params.get("colors");

  if (!colorsParam) return;

  const colors = colorsParam.split("-").map((color) => `#${color}`);

  updatePaletteDisplay(colors);
}

loadPaletteFromURL();

// generatePalette();
