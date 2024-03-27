function setupNav() {
    var menuLinks = document.querySelectorAll('#navList li a');
    var contents = document.querySelectorAll('.content');

    function setActiveLink(dataTarget) {
        menuLinks.forEach(function (link) {
            const isActive = link.dataset.target === dataTarget;
            link.classList.toggle('active', isActive);
            if (isActive) {
                localStorage.setItem("activeLink", dataTarget);
            }
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

    function showContent(targetData) {
        contents.forEach(function (content) {
            const shouldShow = content.dataset.content === targetData;
            animateContent(content, shouldShow);
        });
    }

    function initializeLinkListeners(links) {
        links.forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const targetData = this.dataset.target;
                setActiveLink(targetData);
                showContent(targetData);
            });
        });
    }

    initializeLinkListeners(menuLinks);

    // set active initial link
    var activeLink = localStorage.getItem("activeLink");
    if (activeLink) {
        setActiveLink(activeLink);
        showContent(activeLink);
    } else {
        setActiveLink("me");
        showContent("me");
    }
}


// event listeners
document.addEventListener("DOMContentLoaded", function () {
    setupNav();
});
