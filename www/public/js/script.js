const items = {
    "Checklist-Item-1": { "type": "item", "name": "Step 1", "content": "Sample text for step 1" },
    "Checklist-Item-2": { "type": "item", "name": "Step 2", "content": "Sample text for step 2" },
    "Checklist-Item-3": { "type": "item", "name": "Step 3", "content": "Sample text for step 3" },
    "Nested-Checklist-Item-3": { "type": "nested", "parent": "Checklist-Item-3", "name": "Step 3.1", "content": "Sample text for step 3.1" }
};

class Item {
    constructor(properties) { Object.assign(this, properties, { id: 0 }); }
}

class NestedItem extends Item {
    constructor(properties) { super(properties); this.parent = properties.parent; }
}

function createItem(type, properties) {
    const constructors = { "item": Item, "nested": NestedItem };
    return new constructors[type](properties);
}

function createRender(item) {
    const step = this.document.createElement("div");
    step.className = "step";
    step.setAttribute("data-name", item.name);
    step.setAttribute("data-type", item.type);
    step.setAttribute("data-id", item.id);

    const content = this.document.createElement("div");
    const checkbox = createCheckbox(item.id);
    const text = this.document.createElement("p");
    text.setAttribute("data-state", "incomplete");
    text.innerHTML = item.content;

    content.appendChild(checkbox);
    content.appendChild(text);

    const parent = item.parent ? this.document.querySelector(`[data-name="${items[item.parent].name}"]`) : step;
    content.className = item.parent ? "nested-content" : "content";
    parent.appendChild(content);
    return parent;
}

function createCheckbox(id) {
    const checkbox = this.document.createElement("div");
    checkbox.className = "checkbox";
    checkbox.setAttribute("data-id", id);
    checkbox.setAttribute("data-state", "unchecked");
    checkbox.addEventListener("click", () => updateCheckboxState(checkbox));
    return checkbox;
}

function updateStates(item, mainState) {
    const stateMappings = { "unchecked": ["checked", "complete"], "checked": ["not-applicable", "strike-through"], "not-applicable": ["unchecked", "incomplete"] };
    const [newState, newTextState] = stateMappings[mainState];

    item.setAttribute("data-state", newState);
    item.parentElement.querySelector("p").setAttribute("data-state", newTextState);

    // item.parentElement.parentElement.querySelectorAll(".nested-content").forEach(element => {
    //     const checkbox = element.querySelector(".checkbox");
    //     const text = element.querySelector("p");
    //     checkbox.setAttribute("data-state", newState);
    //     text.setAttribute("data-state", newTextState);
    // });
}

function updateCheckboxState(item) {
    updateStates(item, item.getAttribute("data-state"));
    updateProgressBar(calculateProgress());
}

function getProgress() {
    return parseInt(this.document.querySelector(".progress-bar").getAttribute("data-value"));
}

function updateProgressBar(value) {
    if (value < 0 || value > 100) return;
    if (getProgress() === value) return;
    const container = this.document.querySelector(".progress-container");
    const progress = container.querySelector(".progress-bar");
    const text = container.querySelector(".progress-text");
    progress.style.width = text.innerHTML = `${value}%`;
    progress.setAttribute("data-value", value);

    if (getProgress() === 100) {
        setTimeout(() => {
            // Show print to pdf button
        }, 1000);
    }
}

function calculateProgress() {
    const checkboxes = Array.from(this.document.querySelectorAll(".step .checkbox[data-state]"));
    const checked = checkboxes.filter(checkbox => checkbox.getAttribute("data-state") === "checked").length;
    const unchecked = checkboxes.filter(checkbox => checkbox.getAttribute("data-state") === "unchecked").length;
    if (checked === 0 && unchecked === 0) return 100;
    return Math.round((checked / (checked + unchecked)) * 100);
}

(function() {
    for (const key in items) {
        const item = createItem(items[key].type, items[key]);
        const render = createRender(item);
        const container = this.document.getElementById("steps");
        container.appendChild(render);
    }

    this.document.getElementById("print").addEventListener("click", () => {
        this.window.print();
    });
})();
