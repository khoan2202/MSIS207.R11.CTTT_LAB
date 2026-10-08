const themeButton = document.querySelector("#theme-btn");
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
    themeButton.setAttribute("aria-pressed", "true");
    themeButton.textContent = "☀️";
}

themeButton.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-theme");
    themeButton.setAttribute(
        "aria-pressed",
        String(isDark)
    );
    themeButton.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem(
        "theme",
        isDark ? "dark" : "light"
    );
});