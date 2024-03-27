
// dark mode setup and toggle
function setColorMode() {
    var theme = localStorage.getItem("theme") || "light";
    if (theme) {
        document.documentElement.setAttribute("data-theme", theme);
        var icon = document.getElementById("modeSwitch");
        if (theme === "dark") {
            icon.innerHTML = "<i class='fa-solid fa-sun'></i>";
        } else {
            icon.innerHTML = "<i class='fa-solid fa-moon'></i>";
        }
    }
}

function toggleMode() {
    var theme = localStorage.getItem("theme");
    if (theme && theme === "dark") {
        localStorage.setItem("theme", "light");
    } else {
        localStorage.setItem("theme", "dark");
    }
    setColorMode();
}

// event listeners
document.addEventListener("DOMContentLoaded", function () {
    setColorMode();
});