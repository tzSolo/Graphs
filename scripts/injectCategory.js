window.onload = () => {
    const overlayDiv = document.createElement("div");
    overlayDiv.id = "overlay";

    const calculatorDiv = document.createElement("div");
    calculatorDiv.id = "select-category";

    calculatorDiv.innerHTML = `
    <h2>לאיזו קטגוריה משתייך האתר ?</h2>
        <form>
            <div>
                <input type="radio" name="category" id="work" value="Work">
                <label for="work">עבודה</label>
            </div>
            <div>
                <input type="radio" name="category" id="studies" value="Studies">
                <label for="studies">לימודים</label>
            </div>
            <div>
                <input type="radio" name="category" id="shopping" value="Shopping">
                <label for="shopping">קניות</label>
            </div>
            <div>
                <input type="radio" name="category" id="news" value="News">
                <label for="news">חדשות</label>
            </div>
            <div>
                <input type="radio" name="category" id="another" value="Another">
                <label for="another">אחר</label>
            </div>
            <div id="cont-another-category">
                <label for="another-category">קטגוריה חדשה :</label>
                <input type="text" name="another-category" id="another-category">
            </div>
            <button type="button">אישור</button>
        </form>
    </div>
`
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
        [calculatorDiv, overlayDiv].forEach(div => div.remove());
    });
}