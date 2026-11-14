(async () => {
    const { pdfLabResult } = await chrome.storage.session.get("pdfLabResult");

    if (!pdfLabResult) return;

    document.getElementById("labName").textContent = pdfLabResult.name;
    document.getElementById("normal").innerHTML = pdfLabResult.normal;
})();