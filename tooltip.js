function showLabTooltip(labName, normalRange) {

    // Remove old tooltip
    const oldTooltip = document.getElementById("lab-value-tooltip");
    if (oldTooltip) {
        oldTooltip.remove();
    }

    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
        return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Create tooltip
    const tooltip = document.createElement("div");
    tooltip.id = "lab-value-tooltip";

    tooltip.innerHTML = `
        <div class="lab-tooltip-name">${labName}</div>
        <div class="lab-tooltip-range">${normalRange}</div>
    `;

    tooltip.style.left = `${window.scrollX + rect.left}px`;
    tooltip.style.top = `${window.scrollY + rect.bottom + 8}px`;

    document.body.appendChild(tooltip);


    // Function to close tooltip
    const closeTooltip = () => {
        tooltip.remove();
        document.removeEventListener("keydown", handleKeydown);
        document.removeEventListener("mousedown", handleClick);
    };


    // ESC closes tooltip
    const handleKeydown = (event) => {
        if (event.key === "Escape") {
            closeTooltip();
        }
    };


    // Clicking anywhere closes tooltip
    const handleClick = () => {
        closeTooltip();
    };


    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("mousedown", handleClick);


    // Auto-close after 6 seconds
    setTimeout(closeTooltip, 6000);
}