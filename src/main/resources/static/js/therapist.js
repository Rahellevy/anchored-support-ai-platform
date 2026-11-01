
const patients = [
    { name: "Jordan Avery", initials: "JA", lastChat: "Today, 9:12 AM", chats: 4, flag: "high", unreviewed: 3, lastReviewed: "Oct 1" },
    { name: "Sam Rivera", initials: "SR", lastChat: "Yesterday, 8:40 PM", chats: 2, flag: "medium", unreviewed: 2, lastReviewed: "Sep 30" },
    { name: "Priya Nair", initials: "PN", lastChat: "Mon, 7:05 PM", chats: 3, flag: "none", unreviewed: 0, lastReviewed: "Today" },
    { name: "Marcus Lee", initials: "ML", lastChat: "6 days ago", chats: 1, flag: "none", unreviewed: 0, lastReviewed: "Oct 2" },
    { name: "Elena Torres", initials: "ET", lastChat: "No AI activity", chats: 0, flag: "none", unreviewed: 0, lastReviewed: "—" },
];

const rows = document.getElementById("rows");
const search = document.getElementById("search");


function make(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
}

function plural(count, word) {
    return count + " " + word + (count === 1 ? "" : "s");
}

function flagBadge(flag) {
    if (flag === "high") return make("span", "badge high", "1 High");
    if (flag === "medium") return make("span", "badge medium", "1 Medium");
    return make("span", "badge none", "None");
}

function statusBadge(patient) {
    if (patient.unreviewed > 0) return make("span", "badge unreviewed", patient.unreviewed + " unreviewed");
    if (patient.chats === 0) return make("span", "badge none", "Nothing to review");
    return make("span", "badge reviewed", "Reviewed");
}

function makeRow(patient) {
    const row = document.createElement("tr");

    const nameCell = make("td");
    const box = make("div", "patient");
    const avatar = make("span", "avatar", patient.initials);
    avatar.setAttribute("aria-hidden", "true");
    const text = make("div");
    text.append(make("strong", "", patient.name), document.createElement("br"), make("span", "small", "Synthetic patient"));
    box.append(avatar, text);
    nameCell.append(box);

    const flagCell = make("td");
    flagCell.append(flagBadge(patient.flag));
    const statusCell = make("td");
    statusCell.append(statusBadge(patient));
    const buttonCell = make("td");
    buttonCell.append(make("button", "btn", "Open"));

    row.append(
        nameCell,
        make("td", "", patient.lastChat),
        make("td", "", plural(patient.chats, "conversation")),
        flagCell,
        statusCell,
        make("td", "", patient.lastReviewed),
        buttonCell
    );
    return row;
}

function showTable(list) {
    rows.replaceChildren();
    if (list.length === 0) {
        const row = document.createElement("tr");
        const cell = make("td", "empty", "No patients match your search.");
        cell.colSpan = 7;
        row.append(cell);
        rows.append(row);
        return;
    }
    list.forEach(patient => rows.append(makeRow(patient)));
}

function showCards() {
    const high = patients.filter(p => p.flag === "high").length;
    const medium = patients.filter(p => p.flag === "medium").length;
    const unreviewed = patients.reduce((sum, p) => sum + p.unreviewed, 0);
    const patientsWithUnreviewed = patients.filter(p => p.unreviewed > 0).length;
    const active = patients.filter(p => p.chats > 0).length;
    const totalChats = patients.reduce((sum, p) => sum + p.chats, 0);

    document.getElementById("flag-total").textContent = high + medium;
    document.getElementById("high-count").textContent = high + " High";
    document.getElementById("medium-count").textContent = medium + " Medium";
    document.getElementById("unreviewed-total").textContent = unreviewed;
    document.getElementById("unreviewed-note").textContent = "Across " + plural(patientsWithUnreviewed, "patient");
    document.getElementById("active-count").textContent = active;
    document.getElementById("patient-total").textContent = "of " + patients.length;
    document.getElementById("chat-total").textContent = totalChats + " conversations total";
}

search.addEventListener("input", () => {
    const term = search.value.trim().toLowerCase();
    showTable(patients.filter(p => p.name.toLowerCase().includes(term)));
});

showCards();
showTable(patients);
