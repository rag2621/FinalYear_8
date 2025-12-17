// Get the necessary elements
const subMenu = document.getElementById("subMenu");
const darkBtn = document.getElementById("dark-btn");

// Toggle the settings menu open and close
function settingsMenuToggle() {
    subMenu.classList.toggle("open-menu");
}

// Dark theme toggle functionality
darkBtn.onclick = function () {
    const isDark = document.body.classList.toggle("dark-theme");
    darkBtn.classList.toggle("dark-btn-on", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
};

// Apply saved theme on page load
window.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const isDark = savedTheme === "dark";

    document.body.classList.toggle("dark-theme", isDark);
    darkBtn.classList.toggle("dark-btn-on", isDark);
    localStorage.setItem("theme", savedTheme);
});
