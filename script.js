let currentCrosshair = 'crosshair1';
let settings = {
    size: 3.5,
    color: '#ffffff',
    killEffect: false
};

function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`.tab[onclick="openTab('${tabName}')"]`).classList.add('active');
}

function selectCrosshair(crosshair) {
    currentCrosshair = crosshair;
    updateCrosshair();
}

function updateCrosshair() {
    const display = document.getElementById('crosshair-display');
    const size = document.getElementById('size').value;
    const color = document.getElementById('color').value;
    const killEffect = document.getElementById('killEffect').checked;

    display.innerHTML = `<img src="crosshairs/${currentCrosshair}.png" style="width: ${size * 10}px; filter: ${hexToFilter(color)};">`;

    fetch('http://crosshair_system/updateCrosshair', {
        method: 'POST',
        body: JSON.stringify({
            crosshair: currentCrosshair,
            size: parseFloat(size),
            color: hexToRgb(color),
            killEffectEnabled: killEffect
        })
    });
}

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b, a: 255 };
}

function hexToFilter(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `drop-shadow(0 0 5px rgba(${r}, ${g}, ${b}, 1))`;
}

document.getElementById('size').addEventListener('input', updateCrosshair);
document.getElementById('color').addEventListener('input', updateCrosshair);
document.getElementById('killEffect').addEventListener('change', updateCrosshair);

window.addEventListener('message', (event) => {
    const data = event.data;
    if (data.type === 'toggleMenu') {
        document.getElementById('crosshair-menu').classList.toggle('active', data.show);
    } else if (data.type === 'updateCrosshairDisplay') {
        currentCrosshair = data.crosshair;
        settings.size = data.size;
        settings.color = `rgb(${data.color.r}, ${data.color.g}, ${data.color.b})`;
        document.getElementById('size').value = data.size;
        document.getElementById('color').value = rgbToHex(data.color.r, data.color.g, data.color.b);
        updateCrosshair();
    } else if (data.type === 'showKillEffect') {
        const killText = document.getElementById('kill-text');
        killText.textContent = `Killed: ${data.victimName}`;
        const killEffect = document.getElementById('kill-effect');
        killEffect.classList.add('active');
        setTimeout(() => killEffect.classList.remove('active'), 2000);
    }
});

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Initialize
updateCrosshair();
