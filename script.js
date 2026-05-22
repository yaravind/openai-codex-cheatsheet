const searchInput = document.getElementById("search");
const filterInputs = Array.from(document.querySelectorAll('.filters input[type="checkbox"]'));
const cards = Array.from(document.querySelectorAll(".card"));
const themeToggle = document.getElementById("theme-toggle");

function activeFilters() {
  return filterInputs.filter((x) => x.checked).map((x) => x.value);
}

function shouldShowByFilter(card, filters) {
  if (filters.length === 0) {
    return false;
  }
  const tags = (card.dataset.tags || "").split(/\s+/);
  return filters.some((filter) => tags.includes(filter));
}

function shouldShowBySearch(card, query) {
  if (!query) {
    return true;
  }
  return card.textContent.toLowerCase().includes(query);
}

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const filters = activeFilters();

  cards.forEach((card) => {
    const visible = shouldShowByFilter(card, filters) && shouldShowBySearch(card, query);
    card.classList.toggle("hidden", !visible);
  });
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("theme", theme);
}

themeToggle?.addEventListener("click", () => {
  const current = document.documentElement.dataset.theme || "dark";
  setTheme(current === "dark" ? "light" : "dark");
});

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark" || savedTheme === "light") {
  setTheme(savedTheme);
} else {
  setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}

searchInput?.addEventListener("input", render);
filterInputs.forEach((input) => input.addEventListener("change", render));

document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const text = btn.getAttribute("data-copy") || "";
    try {
      await navigator.clipboard.writeText(text);
      btn.classList.add("copied");
      const original = btn.textContent;
      btn.textContent = "Copied";
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove("copied");
      }, 1000);
    } catch {
      btn.textContent = "Copy failed";
      setTimeout(() => {
        btn.textContent = "Copy";
      }, 1000);
    }
  });
});

render();
