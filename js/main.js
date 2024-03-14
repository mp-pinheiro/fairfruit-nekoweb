// navbar and links setup
function setupNav() {
    var menuLinks = document.querySelectorAll('#navList li a');
    var contents = document.querySelectorAll('.content');

    function setActiveLink(href) {
        menuLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === href);
        });
    }

    function animateContent(content, shouldShow) {
        if (shouldShow) {
            content.style.display = 'initial';
            content.style.visibility = 'visible';

            gsap.to(content, {
                opacity: 1,
                duration: 0.2,
                ease: 'power2.in'
            });

            gsap.fromTo(content, {
                scale: 1
            }, {
                scale: 1.1,
                duration: 0.2,
                ease: 'power2.in',
                yoyo: true,
                repeat: 1
            });

        } else {
            content.style.display = 'none';
            content.style.visibility = 'hidden';
            content.style.opacity = 0;
        }
    }

    function showContent(targetId) {
        contents.forEach(function (content) {
            animateContent(content, content.id === targetId);
        });
    }

    function initializeLinkListeners(links) {
        links.forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                setActiveLink(this.getAttribute('href'));
                showContent(targetId);
            });
        });
    }

    initializeLinkListeners(menuLinks);
    initializeLinkListeners(document.querySelectorAll('a[href*="#"]'));

    function getActiveLink() {
        const hash = window.location.hash;
        return hash ? document.querySelector(`a[href="${hash}"]`) : null;
    }
    const activeLink = getActiveLink();
    if (activeLink) {
        setActiveLink(activeLink.getAttribute('href'));
        showContent(activeLink.getAttribute('href').substring(1));
    } else {
        setActiveLink('#me');
        showContent('me');
    }
}

// dark mode setup and toggle
function setColorMode() {
    var theme = localStorage.getItem("theme") || "light";
    if (theme) {
        console.log("Setting theme to " + theme);
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

// setup listeners
document.addEventListener("DOMContentLoaded", function () {
    setupNav();
    setColorMode();
});
