import { init } from "./graph.js";

init();

Array.from(document.querySelectorAll("button")).forEach(btn => {
    btn.addEventListener("click", (e) => {
        init(e.target.id);
    });
});