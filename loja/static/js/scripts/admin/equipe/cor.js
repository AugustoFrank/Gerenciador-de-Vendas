window.toggleColorPopover = function() {
    const popover = document.getElementById('colorPopover');
    if (popover) popover.classList.toggle('open');
};

window.selectColorValue = function(hexColor) {
    const previewInside = document.getElementById('currentView');
    if (previewInside) previewInside.style.backgroundColor = hexColor;
};

window.toggleColorPopoverEdit = function() {
    const popover = document.getElementById('colorPopoverEdit');
    if (popover) popover.classList.toggle('open');
};

window.selectEditColor = function(hexColor) {
    const previewInside = document.getElementById('currentViewEdit');
    if (previewInside) previewInside.style.backgroundColor = hexColor;
    
    const popover = document.getElementById('colorPopoverEdit');
    if (popover) popover.classList.remove('open');
};

// Fecha o popover de cor se clicar fora
window.addEventListener('click', (e) => {
    const popover = document.getElementById('colorPopover');
    const trigger = document.getElementById('pickerTrigger');
    if (popover && popover.classList.contains('open') && 
        !popover.contains(e.target) && trigger && !trigger.contains(e.target)) {
        popover.classList.remove('open');
    }
});