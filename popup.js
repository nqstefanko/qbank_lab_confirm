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

    if (event.key === "Enter") {
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