if (!window.isPopupDisplayed) {
    window.isPopupDisplayed = true;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
}

function init() {
    const fontLinkHtml = document.createElement("link");
    fontLinkHtml.rel = "stylesheet";
    fontLinkHtml.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew&family=Roboto&display=swap";
    document.head.appendChild(fontLinkHtml);

    const overlayDiv = document.createElement("div");
    overlayDiv.id = "overlay";

    const calculatorDiv = document.createElement("div");
    calculatorDiv.id = "select-category";

    const categoryForm = document.createElement("form");
    categoryForm.innerHTML = '<h2>לאיזו קטגוריה משתייך האתר ?</h2>';

    const arrCategoryOptions = [
        {
            label: "work",
            hebrew: "עבודה"
        },
        {
            label: "studies",
            hebrew: "לימודים",
        },
        {
            label: "shopping",
            hebrew: "קניות"
        },
        {
            label: "news",
            hebrew: "חדשות",
        },
        {
            label: "another",
            hebrew: "אחר",
        }
    ];

    const optionHtml = `       
            <input type="radio" name="category" required>
            <label></label>`;

    arrCategoryOptions.forEach((option) => {
        const containerDiv = document.createElement("div");
        containerDiv.innerHTML = optionHtml;
        const input = containerDiv.querySelector("input");
        input.id = option.label;
        input.value = option.label.toUpperCase();
        const label = containerDiv.querySelector("label");
        label.htmlFor = option.label;
        label.innerText = option.hebrew;
        categoryForm.append(containerDiv);
    });

    const submissionHtml = `
            <div id="cont-another-category">
                <label for="another-category">קטגוריה חדשה :</label>
                <input type="text" name="another-category" id="another-category">
            </div>
            <button type="button">אישור</button>`;
    categoryForm.innerHTML += submissionHtml;

    calculatorDiv.append(categoryForm);

    document.body.append(calculatorDiv, overlayDiv);

    const another = calculatorDiv.querySelector("#another");
    const anotherCategory = calculatorDiv.querySelector("#cont-another-category");

    const categoriesRadio = calculatorDiv.querySelectorAll("input[name='category']");

    categoriesRadio.forEach(radio => radio.addEventListener('change', () => {
        if (another.checked) {
            anotherCategory.style.display = "inline-block";
        }
        else {
            anotherCategory.style.display = "none";
            anotherCategory.children[1].value = "";
        }
    }));

    const selectCategoryForm = calculatorDiv.querySelector("form");
    selectCategoryForm.addEventListener('submit', (e) => {
        e.preventDefault();
    })

    const confirmCategoryButton = selectCategoryForm.querySelector("button");
    confirmCategoryButton.addEventListener('click', () => {
        let selectedCategory = null;

        const checkedRadio = calculatorDiv.querySelector("input[name='category']:checked");
        if (checkedRadio) {
            if (checkedRadio.id === "another") {
                const anotherInput = calculatorDiv.querySelector("#another-category");
                selectedCategory = anotherInput.value.trim();
                if (!selectedCategory) {
                    alert("לא נבחרה קטגוריה !");
                    return;
                }
            } else {
                selectedCategory = checkedRadio.value;
            }
        }
        else {
            alert("לא נבחרה קטגוריה !");
            return;
        }

        [calculatorDiv, overlayDiv].forEach(div => div.remove());
    });
}