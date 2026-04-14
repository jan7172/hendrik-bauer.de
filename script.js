/* ============================================================
   THEME — reads browser preference, persists user override
   ============================================================ */
const html = document.documentElement;
const toggleBtn = document.getElementById("themeToggle");

function getInitialTheme() {
  const stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  html.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

function toggleTheme() {
  const current = html.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
}

applyTheme(getInitialTheme());

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  if (!localStorage.getItem("theme")) applyTheme(e.matches ? "dark" : "light");
});

toggleBtn.addEventListener("click", toggleTheme);

/* ============================================================
   NAV — scrolled state
   ============================================================ */
const nav = document.getElementById("nav");

function handleScroll() {
  nav.classList.toggle("scrolled", window.scrollY > 10);
}

window.addEventListener("scroll", handleScroll, { passive: true });
handleScroll();

/* ============================================================
   SMOOTH SCROLL — offset for fixed nav
   ============================================================ */
const NAV_HEIGHT = 60;

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT,
      behavior: "smooth",
    });
  });
});

/* ============================================================
   INTERSECTION OBSERVER — fade-in on scroll
   ============================================================ */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
);

document.querySelectorAll(
  ".card, .benefit, .contact-item, .offer-card, .quote-card, .mini-stats, .feature-list, .section-header"
).forEach((el, i) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(24px)";
  el.style.transition = `opacity 0.55s ${i * 0.06}s ease, transform 0.55s ${i * 0.06}s ease`;
  observer.observe(el);
});

document.head.insertAdjacentHTML("beforeend", `
  <style>.visible { opacity: 1 !important; transform: translateY(0) !important; }</style>
`);

/* ============================================================
   PHONE REVEAL — Cloudflare Turnstile
   Beide Buttons (revealBtn + callRevealBtn) teilen sich
   ein einziges Turnstile-Widget und einen einzigen Fetch.
   ============================================================ */
const WORKER_URL = "https://phone-reveal.jan691425.workers.dev";

const revealBtn    = document.getElementById("revealBtn");
const phoneDisplay = document.getElementById("phoneDisplay");
const tsWrapper    = document.getElementById("turnstileWrapper");
const tsWidget     = document.getElementById("turnstileWidget");

let widgetRendered = false;

/* Nur auf Seiten mit dem Phone-Widget initialisieren */
if (revealBtn && tsWrapper && tsWidget && phoneDisplay) {

  function showTurnstile() {
    revealBtn.style.display = "none";
    tsWrapper.style.display = "block";
    tsWrapper.scrollIntoView({ behavior: "smooth", block: "center" });

    if (!widgetRendered) {
      widgetRendered = true;
      turnstile.render(tsWidget, {
        sitekey: "0x4AAAAAAC1TDpWNQbR8roof",
        theme: html.getAttribute("data-theme") === "dark" ? "dark" : "light",
        callback: onTurnstileSuccess,
        "error-callback": onTurnstileError,
      });
    }
  }

  revealBtn.addEventListener("click", showTurnstile);

  const callRevealBtn = document.getElementById("callRevealBtn");
  if (callRevealBtn) callRevealBtn.addEventListener("click", showTurnstile);

}

async function onTurnstileSuccess(token) {
  tsWrapper.innerHTML = `
    <p style="font-size:0.82rem;color:var(--text-secondary);margin-top:0.5rem;">
      Wird geprüft…
    </p>`;

  try {
    const res = await fetch(WORKER_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },  
      body:    JSON.stringify({ token }),
    });

    const data = await res.json();

    if (data.success && data.phone) {
      tsWrapper.style.display = "none";

      /* Nummer links anzeigen */
      phoneDisplay.innerHTML = `
        <a href="tel:${data.phone}" class="contact-link">${formatPhone(data.phone)}</a>`;

      /* "Jetzt anrufen" Button rechts freischalten */
      const callBtnWrapper = document.getElementById("callBtnWrapper");
      if (callBtnWrapper) callBtnWrapper.innerHTML = `
        <a href="tel:${data.phone}" class="btn btn-primary btn-full">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.33A2 2 0 0 1 3.6 1.23h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z"/>
          </svg>
          Jetzt anrufen
        </a>`;

    } else {
      showError();
    }
  } catch {
    showError();
  }
}

function onTurnstileError() { showError(); }




function showError() {
  tsWrapper.innerHTML = `
    <p style="font-size:0.82rem;color:var(--text-secondary);margin-top:0.5rem;">
      Fehler – bitte Seite neu laden.
    </p>`;
}

function formatPhone(raw) {
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("49") && d.length === 12) {
    return `+49 ${d.slice(2, 5)} ${d.slice(5)}`;
  }
  return raw;
}