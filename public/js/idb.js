let db;
const request = indexedDB.open("budgetTracker", 1);
request.onupgradeneeded = event => {
    const db = event.target.result;
    db.createObjectStore("newBudget", { autoIncrement: true });
};
request.onsuccess = event => {
    db = event.target.result;
    if (navigator.onLine) {
        renderBudget();
    }
};
request.onerror = event => {
    console.log(event.target.errorCode);
};
function renderBudget() {
    const transaction = db.transaction(["newBudget"], "readwrite");
    const store = transaction.objectStore("newBudget");
    const getAll = store.getAll();
    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            }).then(response => response.json()).then(() => {
                const transaction = db.transaction(["newBudget"], "readwrite");
                const store = transaction.objectStore("newBudget");
                store.clear();
            });
        }
    };
}
function saveRecord(record) {
    const transaction = db.transaction(["newBudget"], "readwrite");
    const store = transaction.objectStore("newBudget");
    store.add(record);
}
function clearRecords() {
    const transaction = db.transaction(["newBudget"], "readwrite");
    const store = transaction.objectStore("newBudget");
    store.clear();
}
window.addEventListener("online", renderBudget);
