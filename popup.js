document.getElementById("checkLab").addEventListener("click", async () => {

    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    // Get highlighted text
    const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection().toString()
    });

    const selectedText = results[0].result;

    // Send selection to background.js
    chrome.runtime.sendMessage({
        type: "lookup-lab",
        tabId: tab.id,
        selectedText: selectedText
    });

    window.close();
});

// ========================================
// Manual lab search
// ========================================

document.getElementById("searchLab").addEventListener("click", async () => {

    const input = document.getElementById("labInput");
    const result = document.getElementById("manualResult");

    const labName = input.value.trim();

    if (!labName) {
        result.textContent = "Enter a lab name.";
        return;
    }

    const response = await chrome.runtime.sendMessage({
        type: "manual-lookup",
        labName: labName
    });

    result.innerHTML = response.normal;
    result.style.display = "block";
});

document.getElementById("labInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter" && selectedIndex === -1) {
        document.getElementById("searchLab").click();
    }
});

document.getElementById("labInput").addEventListener("input", (event) => {

    if (event.target.value.trim() === "") {
        const result = document.getElementById("manualResult");

        result.innerHTML = "";
        result.style.display = "none";
    }
});


// ========================================
// Lab autocomplete
// ========================================

const labInput = document.getElementById("labInput");
const suggestions = document.getElementById("labSuggestions");

labInput.addEventListener("input", async () => {
    const query = labInput.value.trim();

    suggestions.innerHTML = "";
    selectedIndex = -1;


    if (!query) return;

    const response = await chrome.runtime.sendMessage({
        type: "lab-suggestions",
        query
    });

    // Ignore outdated responses if the user typed again
    if (labInput.value.trim() !== query) return;

    response.matches.forEach(name => {
        const item = document.createElement("div");
        item.className = "suggestion";
        item.textContent = name;

        item.addEventListener("click", () => {
            labInput.value = name;
            suggestions.innerHTML = "";
            document.getElementById("searchLab").click();
        });

        suggestions.appendChild(item);
    });
});


let selectedIndex = -1;

labInput.addEventListener("keydown", (event) => {
    const items = [...suggestions.querySelectorAll(".suggestion")];

    if (!items.length) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();

        selectedIndex = event.key === "ArrowDown"
            ? (selectedIndex + 1) % items.length
            : (selectedIndex - 1 + items.length) % items.length;

        items.forEach((item, i) => {
            item.classList.toggle("selected", i === selectedIndex);
        });
    }

    if (event.key === "Enter" && selectedIndex >= 0) {
        event.preventDefault();
        event.stopImmediatePropagation();

        items[selectedIndex].click();
    }
});