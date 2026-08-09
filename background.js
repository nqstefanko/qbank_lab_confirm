importScripts("lab_bank.js");


// ========================================
// Main lab lookup function
// ========================================

async function handleLabLookup(tabId, selectedText) {

    const labName = selectedText.trim().toLowerCase();

    console.log("Highlighted:", labName);

    // Inject tooltip CSS
    await chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: ["tooltip.css"]
    });

    // Inject tooltip JS
    await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["tooltip.js"]
    });


    // LAB NOT FOUND
    if (!LAB_BANK[labName]) {

        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: (name) => {
                showLabTooltip(name, "No lab range found");
            },
            args: [selectedText.trim()]
        });

        return;
    }


    // LAB FOUND
    const lab = LAB_BANK[labName];

    console.log("Normal range:", lab.normal);

    await chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: (name, normal) => {
            showLabTooltip(name, normal);
        },
        args: [
            selectedText.trim(),
            lab.normal
        ]
    });
}


// ========================================
// Alt + L
// ========================================

chrome.commands.onCommand.addListener(async (command) => {

    if (command !== "check-lab") {
        return;
    }

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

    // Run the shared lookup function
    await handleLabLookup(tab.id, selectedText);
});

// ========================================
// Popup button
// ========================================

chrome.runtime.onMessage.addListener((message) => {

    if (message.type !== "lookup-lab") {
        return;
    }

    handleLabLookup(
        message.tabId,
        message.selectedText
    );
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    // Highlighted lab → webpage tooltip
    if (message.type === "lookup-lab") {
        handleLabLookup(
            message.tabId,
            message.selectedText
        );
        return;
    }

    // Manually entered lab → return result to popup
    if (message.type === "manual-lookup") {

        const labName = message.labName.trim().toLowerCase();
        const lab = LAB_BANK[labName];

        if (lab) {
            sendResponse({
                found: true,
                normal: lab.normal
            });
        } else {
            sendResponse({
                found: false,
                normal: "No lab range found"
            });
        }

        return;
    }
});