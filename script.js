
let campusModule;

const $ = (id) => document.getElementById(id);

function callString(functionName, returnType, argumentTypes = [], args = []) {
    return campusModule.ccall(
        functionName,
        returnType,
        argumentTypes,
        args
    );
}

function getJSON(functionName, argumentTypes = [], args = []) {
    const result = callString(functionName, "string", argumentTypes, args);
    return JSON.parse(result);
}

function showRoute(result, elementId) {
    const element = $(elementId);

    if (!result.found) {
        element.innerHTML = "<p>No route available.</p>";
        return;
    }

    element.innerHTML = `
        <h3>Route Found!</h3>
        <p><strong>Route:</strong> ${result.route.join(" → ")}</p>
        <p><strong>Distance:</strong> ${result.distance} metres</p>
        <p><strong>Walking time:</strong> ${result.walkingTimeMinutes} minutes</p>
    `;
}

function fillDropdown(id, locations) {
    const select = $(id);
    select.innerHTML = "";

    locations.forEach(location => {
        const option = document.createElement("option");
        option.value = location;
        option.textContent = location;
        select.appendChild(option);
    });
}

function refreshHistory() {
    const history = getJSON("getRouteHistoryJson");
    const container = $("historyResult");

    if (history.length === 0) {
        container.textContent = "No routes calculated yet.";
        return;
    }

    container.innerHTML = history.map((item, index) => `
        <div class="history-item">
            <strong>${index + 1}. ${item.source} → ${item.destination}</strong>
            <p>${item.route.join(" → ")}</p>
            <p>${item.distance} metres</p>
        </div>
    `).join("");
}

createCampusModule().then(module => {
    campusModule = module;

    callString("initCampus", null);

    const locations = getJSON("getLocationsJson");

    ["source", "destination", "nearestSource",
     "roadSource", "roadDestination"].forEach(id => {
        fillDropdown(id, locations);
    });

    $("findRouteBtn").addEventListener("click", () => {
        const result = getJSON(
            "findShortestRouteJson",
            ["string", "string"],
            [$("source").value, $("destination").value]
        );

        showRoute(result, "routeResult");
    });

    $("nearestBtn").addEventListener("click", () => {
        const result = getJSON(
            "findNearestLocationJson",
            ["string"],
            [$("nearestSource").value]
        );

        showRoute(result, "nearestResult");
    });

    $("searchInput").addEventListener("input", event => {
        const matches = getJSON(
            "searchLocationsJson",
            ["string"],
            [event.target.value]
        );

        $("searchResults").textContent =
            matches.length ? matches.join(", ") : "No matching locations.";
    });

    $("blockBtn").addEventListener("click", () => {
        const result = callString(
            "setRoadBlocked",
            "number",
            ["string", "string", "number"],
            [$("roadSource").value, $("roadDestination").value, 1]
        );

        $("roadMessage").textContent =
            result ? "Road successfully blocked!" :
            "No direct road exists between these locations.";
    });

    $("unblockBtn").addEventListener("click", () => {
        const result = callString(
            "setRoadBlocked",
            "number",
            ["string", "string", "number"],
            [$("roadSource").value, $("roadDestination").value, 0]
        );

        $("roadMessage").textContent =
            result ? "Road successfully reopened!" :
            "No direct road exists between these locations.";
    });

    $("historyBtn").addEventListener("click", refreshHistory);

    $("clearHistoryBtn").addEventListener("click", () => {
        callString("clearRouteHistory", null);
        refreshHistory();
    });

    console.log("Campus C++ engine loaded successfully!");

}).catch(error => {
    console.error("Unable to load campus engine:", error);
    alert("Campus engine could not load. Check the browser console.");
});

