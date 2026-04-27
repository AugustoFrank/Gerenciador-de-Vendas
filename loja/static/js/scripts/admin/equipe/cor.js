
function toggleColorPopover() {
    const popover = document.getElementById('colorPopover');
    if (!popover) return;
    popover.classList.toggle('open');
}

function selectColorValue(hexColor) {
    const previewInside = document.getElementById('currentView');
    if (!previewInside) return;
    
    previewInside.style.backgroundColor = hexColor;
    
}

window.addEventListener('click', (e) => {
    const popover = document.getElementById('colorPopover');
    const trigger = document.getElementById('pickerTrigger');
    
    if (popover && popover.classList.contains('open') && 
        !popover.contains(e.target) && !trigger.contains(e.target)) {
        popover.classList.remove('open');
    }
});

window.toggleColorPopover = toggleColorPopover;
window.selectColorValue = selectColorValue;