/* ════════════════════════════════════════════════════
   OpenAI Codex Cheatsheet — Interactive Logic
   ════════════════════════════════════════════════════ */

(function () {
  "use strict";

  // ── DOM refs ──
  const searchInput = document.getElementById("search");
  const themeToggle = document.getElementById("theme-toggle");
  const cards = Array.from(document.querySelectorAll(".card"));
  const sections = Array.from(document.querySelectorAll(".section"));
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const productPills = Array.from(document.querySelectorAll("[data-filter]"));
  const statusPills = Array.from(document.querySelectorAll("[data-filter-status]"));
  const resultsCount = document.querySelector(".results-count");

  let activeProduct = "all";
  let activeStatus = "all";

  // ═══════ Theme ═══════
  function getPreferredTheme() {
    return (
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    );
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }

  setTheme(getPreferredTheme());

  themeToggle?.addEventListener("click", function () {
    var current = document.documentElement.dataset.theme;
    setTheme(current === "dark" ? "light" : "dark");
  });

  // ═══════ Filtering ═══════
  function matchesProduct(card) {
    if (activeProduct === "all") return true;
    var tags = (card.dataset.tags || "").toLowerCase();
    return tags.includes(activeProduct);
  }

  function matchesStatus(card) {
    if (activeStatus === "all") return true;
    return (card.dataset.status || "") === activeStatus;
  }

  function matchesSearch(card, query) {
    if (!query) return true;
    return card.textContent.toLowerCase().includes(query);
  }

  function clearHighlights() {
    document.querySelectorAll("mark.highlight").forEach(function (mark) {
      var parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize();
      }
    });
  }

  function highlightText(node, query) {
    if (!query || node.nodeType !== Node.ELEMENT_NODE) return;
    // Skip code/pre/button elements
    if (["PRE", "CODE", "BUTTON", "SCRIPT"].includes(node.tagName)) return;

    var walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
    var textNodes = [];
    while (walker.nextNode()) {
      if (walker.currentNode.parentNode && !["PRE", "CODE", "BUTTON", "SCRIPT"].includes(walker.currentNode.parentNode.tagName)) {
        textNodes.push(walker.currentNode);
      }
    }

    textNodes.forEach(function (tn) {
      var idx = tn.textContent.toLowerCase().indexOf(query);
      if (idx === -1) return;
      var before = tn.textContent.slice(0, idx);
      var match = tn.textContent.slice(idx, idx + query.length);
      var after = tn.textContent.slice(idx + query.length);
      var frag = document.createDocumentFragment();
      if (before) frag.appendChild(document.createTextNode(before));
      var mark = document.createElement("mark");
      mark.className = "highlight";
      mark.textContent = match;
      frag.appendChild(mark);
      if (after) frag.appendChild(document.createTextNode(after));
      tn.parentNode.replaceChild(frag, tn);
    });
  }

  function render() {
    var query = (searchInput?.value || "").trim().toLowerCase();
    var visibleCount = 0;

    clearHighlights();

    cards.forEach(function (card) {
      var visible = matchesProduct(card) && matchesStatus(card) && matchesSearch(card, query);
      card.classList.toggle("hidden", !visible);
      if (visible) {
        visibleCount++;
        if (query) highlightText(card, query);
      }
    });

    // Show/hide sections with no visible cards
    sections.forEach(function (sec) {
      var visCards = sec.querySelectorAll(".card:not(.hidden)");
      sec.classList.toggle("hidden", visCards.length === 0);
    });

    // Update count
    if (resultsCount) {
      if (query || activeProduct !== "all" || activeStatus !== "all") {
        resultsCount.textContent = visibleCount + " result" + (visibleCount !== 1 ? "s" : "");
      } else {
        resultsCount.textContent = "";
      }
    }
  }

  // Product filter pills
  productPills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      activeProduct = pill.dataset.filter;
      productPills.forEach(function (p) { p.classList.toggle("active", p === pill); });
      render();
    });
  });

  // Status filter pills
  statusPills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      activeStatus = pill.dataset.filterStatus;
      statusPills.forEach(function (p) { p.classList.toggle("active", p === pill); });
      render();
    });
  });

  // Search
  searchInput?.addEventListener("input", render);

  // Keyboard shortcut: / to focus search
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput?.focus();
    }
    if (e.key === "Escape" && document.activeElement === searchInput) {
      searchInput.value = "";
      searchInput.blur();
      render();
    }
  });

  // ═══════ Copy buttons ═══════
  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.setAttribute("aria-live", "polite");
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy") || "";
      navigator.clipboard.writeText(text).then(function () {
        btn.classList.add("copied");
        var original = btn.textContent;
        btn.textContent = "✓ Copied";
        setTimeout(function () {
          btn.textContent = original;
          btn.classList.remove("copied");
        }, 1200);
      }).catch(function () {
        btn.textContent = "Failed";
        setTimeout(function () { btn.textContent = "Copy"; }, 1200);
      });
    });
  });

  // ═══════ Scroll-spy ═══════
  function updateScrollSpy() {
    var scrollY = window.scrollY + 100;
    var currentId = "";

    sections.forEach(function (sec) {
      if (sec.classList.contains("hidden")) return;
      if (sec.offsetTop <= scrollY) {
        currentId = sec.dataset.sectionId;
      }
    });

    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.dataset.section === currentId);
    });
  }

  var scrollTimer;
  window.addEventListener("scroll", function () {
    if (scrollTimer) cancelAnimationFrame(scrollTimer);
    scrollTimer = requestAnimationFrame(updateScrollSpy);
  }, { passive: true });

  // ═══════ Init ═══════
  render();
  updateScrollSpy();
})();
