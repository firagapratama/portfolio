import { $ } from "./constants.js";

const THEME_KEY = "fp_qa_portfolio_theme";

export function initTheme() {
  const toggleBtn = $("themeToggle");
  const savedTheme = localStorage.getItem(THEME_KEY) || "dark";

  applyTheme(savedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const currentTheme = document.body.classList.contains("light") ? "light" : "dark";
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      localStorage.setItem(THEME_KEY, nextTheme);
    });
  }
}

export function applyTheme(theme) {
  const toggleBtn = $("themeToggle");
  if (theme === "light") {
    document.body.classList.add("light");
    if (toggleBtn) {
      toggleBtn.setAttribute("title", "Switch to Dark Mode");
      toggleBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      `;
    }
  } else {
    document.body.classList.remove("light");
    if (toggleBtn) {
      toggleBtn.setAttribute("title", "Switch to Light Mode");
      toggleBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      `;
    }
  }
}

