if (!window.isPopupDisplayed) {
    window.isPopupDisplayed = true;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
}

async function init() {
    document.body.style.overflow = "hidden";
    const fontLinkHtml = document.createElement("link");
    fontLinkHtml.rel = "stylesheet";
    fontLinkHtml.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew&family=Roboto&display=swap";
    document.head.appendChild(fontLinkHtml);

    const containerDiv = document.createElement("div");

    const overlayDiv = document.createElement("div");
    overlayDiv.id = "overlay";

    overlayDiv.addEventListener("click", (e) => {
        e.target.remove();
    })

    const calculatorDiv = document.createElement("div");
    calculatorDiv.id = "select-category";

    const shadow = containerDiv.attachShadow({ mode: "open" });
    shadow.innerHTML = `
    <style>
        #overlay {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            bottom: 0 !important;
            right: 0 !important;
            z-index: 999999999 !important;
            backdrop-filter: blur(3px) !important;
            background-color: rgba(128, 128, 128, 0.5) !important;
        }
        
        #select-category {
            direction: rtl !important;
            position: fixed !important;
            top: 60px !important;
            right: 60px !important;
            z-index: 1000000000 !important;
            color: black !important;
            background-color: white !important;
            padding: 10px !important;
            font-family: "Noto Sans Hebrew", "Roboto", sans-serif !important;
        }
        
        #select-category::selection {
            background-color: #6ada3b !important;
            color: black !important;
        }
        
        h2 {
            margin: 0 !important;
            font-size: 25px !important;
            font-weight: 700 !important;
            color: #6ada3b !important;
        }
        
        form {
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-around !important;
            align-items: flex-start !important;
            border: 1px solid #6ada3b !important;
            padding: 15px !important;
            border-radius: 10px !important;
        }
        
        form div {
            padding: 3px 0 !important;
        }

        form div:last-child{
            align-self: end !important;
        }

        form div:last-child button{
            margin: 0 4px !important;
        }

        form button {
            font-size: 15px !important;
            margin: 5px 0 !important;
            background-color: white !important;
            border: 1px solid  #6ada3b !important;
            color:  #6ada3b !important;
            padding: 4px 12px !important;
            border-radius: 5px !important;
            cursor: pointer !important;
            transition: all .3s !important; 
        }
        
        form button:hover {
            background-color: #6ada3b !important;
            border: 1px solid white !important;
            color: white !important;
            box-shadow: 0 0 5px gray !important;
        }
        
        input[type='text'] {
            background-color: white !important;
            width: 125px !important;
            font-size: 18px !important;
            padding: 0 !important;
            border-radius: 5px !important;
        }
        
        input:not(:placeholder-shown) {
            background-color: transparent !important;
        }
        
        input[type='radio'] {
            accent-color: black !important;
        }
        
        #cont-another-category {
            display: none;
        }
    </style>`;

    const categoryForm = document.createElement("form");
    categoryForm.innerHTML = '<h2>לאיזו קטגוריה משתייך האתר ?</h2>';

    const arrCategoryOptions = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "sendOptions" }, (res) => {
            resolve(res);
        });
    });

    const optionHtml = `       
            <input type="radio" name="category" required>
            <label></label>`;

    arrCategoryOptions.forEach((option) => {
        const containerDiv = document.createElement("div");
        containerDiv.innerHTML = optionHtml;
        const input = containerDiv.querySelector("input");
        input.id = option.label;
        input.value = option.hebrew;
        const label = containerDiv.querySelector("label");
        label.htmlFor = option.label;
        label.innerText = option.hebrew;
        categoryForm.append(containerDiv);
    });

    const submissionHtml = `
            <div id="cont-another-category">
                <label for="another-category">קטגוריה חדשה :</label>
                <input type="text" name="another-category" id="another-category" placeholder="">
            </div>
            <div>
                <button type="button">לא עכשיו</button>
                <button type="button">אישור</button>
            </div>`;
    categoryForm.innerHTML += submissionHtml;

    calculatorDiv.append(categoryForm);

    shadow.append(calculatorDiv, overlayDiv);
    document.body.append(containerDiv);

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

    const confirmCategoryButtons = Array.from(selectCategoryForm.querySelectorAll("button"));
    
    confirmCategoryButtons[0].addEventListener('click', () => {
        containerDiv.remove();
        document.body.style.overflow = "auto";
    });

    confirmCategoryButtons[1].addEventListener('click', async () => {
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

        await chrome.runtime.sendMessage({
            action: "categorySelected",
            category: selectedCategory
        });

        containerDiv.remove();
        document.body.style.overflow = "auto";
    });
}