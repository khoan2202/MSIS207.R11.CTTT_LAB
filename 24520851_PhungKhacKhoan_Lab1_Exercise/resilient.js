const loadingState = document.querySelector("#loading-state");
const successState = document.querySelector("#success-state");
const emptyState = document.querySelector("#empty-state");
const errorState = document.querySelector("#error-state");

const dataList = document.querySelector("#data-list");

const errorRetry = document.querySelector("#error-retry");
const emptyRetry = document.querySelector("#empty-retry");

const projects = [
    {
        name: "Portfolio Website",
        technology: "HTML + CSS",
        description: "Responsive developer portfolio."
    },
    {
        name: "Task Manager",
        technology: "JavaScript",
        description: "Task management application."
    },
    {
        name: "Weather Dashboard",
        technology: "Web API",
        description: "Weather information dashboard."
    }
];

function hideAllStates() {
    loadingState.hidden = true;
    successState.hidden = true;
    emptyState.hidden = true;
    errorState.hidden = true;
}

function showLoading() {
    hideAllStates();
    loadingState.hidden = false;
}

function showSuccess(data) {
    hideAllStates();
    dataList.replaceChildren();
    data.forEach((project) => {
        const item = document.createElement("li");
        item.className = "data-card";

        const title = document.createElement("h3");
        title.textContent = project.name;

        const technology = document.createElement("span");
        technology.className = "badge";
        technology.textContent = project.technology;

        const description = document.createElement("p");
        description.textContent = project.description;

        item.append(title, technology, description);

        dataList.appendChild(item);
    });
    successState.hidden = false;
}

function showEmpty() {
    hideAllStates();
    emptyState.hidden = false;
}

function showError() {
    hideAllStates();
    errorState.hidden = false;
}

function loadData() {
    showLoading();
    window.setTimeout(() => {
        try {
            if (!projects.length) {
                showEmpty();
                return;
            }
            showSuccess(projects);
        } catch (error) {
            console.error(error);
            showError();
        }
    }, 1000);
}

errorRetry.addEventListener("click", loadData);
emptyRetry.addEventListener("click", loadData);

loadData();