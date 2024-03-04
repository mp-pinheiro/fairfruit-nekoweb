const snowfall = document.getElementById('snowfall');

for (let i = 0; i < 30; i++) {
    const snowflake = document.createElement('div');
    snowflake.className = `snowflake ${['small', 'medium', 'large'][Math.floor(Math.random() * 3)]}`;
    snowflake.style.top = `${-Math.random() * 100}%`;
    snowflake.style.left = `${Math.random() * 100}%`;
    snowflake.style.animationDuration = `${Math.random() * 5 + 5}s`;
    snowflake.style.animationDelay = `${Math.random() * -5}s`;
    snowflake.style.opacity = Math.random();
    snowflake.style.opacity = Math.max(0.5, snowflake.style.opacity);
    snowflake.style.width = snowflake.style.height = `${Math.random() * 10 + 5}px`;
    snowfall.appendChild(snowflake);
}