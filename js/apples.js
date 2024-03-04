document.addEventListener('DOMContentLoaded', () => {
    const body = document.querySelector('body');
    const rows = Math.ceil(window.innerHeight / 50);
    const columns = Math.ceil(window.innerWidth / 50);

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            let apple = document.createElement('i');
            apple.className = 'fas fa-apple-alt';
            apple.style.position = 'absolute';
            apple.style.top = `${(i * 50)}px`;
            apple.style.left = `${(j * 50)}px`;
            apple.style.color = '#dcb967';
            apple.style.fontSize = '2em';
            apple.style.opacity = '0.1';
            apple.style.zIndex = '-1';
            body.appendChild(apple);
        }
    }
});