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

    const containerDiv = document.createElement("div");

    const shadow = containerDiv.attachShadow({ mode: "open" });
    shadow.innerHTML = `
    <style>
        #contains-all{
            direction: rtl !important;
            position: fixed !important;
            top: 60px !important;
            right: 60px !important;
            z-index: 1000000000 !important;
            color: black !important;
            background-color: white !important;
            padding: 10px !important;
            box-shadow: 0 0 3px gray !important;
        }

        #contains-all::selection {
            background-color: #6ada3b !important;
            color: black !important;
        }

        #reminder{
            display: flex !important;
            flex-direction: column !important;
            padding: 10px 15px 5px !important;
            border: 1px solid #6ada3b !important;
            border-radius: 10px !important;
            font-family: "Noto Sans Hebrew", "Roboto", sans-serif !important;
        }
         
        h1 {
            margin: 0 0 10px !important;
            font-size: 20px !important;
            font-weight: 700 !important;
            color: #6ada3b !important;
        }

        button {
            font-size: 15px !important;
            margin: 5px 0 !important;
            background-color: white !important;
            border: 1px solid  #6ada3b !important;
            color:  #6ada3b !important;
            padding: 4px 12px !important;
            border-radius: 5px !important;
            cursor: pointer !important;
            transition: all .3s !important; 
            align-self: flex-end;
        }
        
        button:hover {
            background-color: #6ada3b !important;
            border: 1px solid white !important;
            color: white !important;
            box-shadow: 0 0 5px gray !important;
        }
    </style>`;
    const containsReminderDiv = document.createElement("div");
    containsReminderDiv.id = "contains-all";

    const divForStyling = document.createElement("div");
    divForStyling.id = "reminder";

    const h1 = document.createElement("h1");
    h1.innerText = `תזכורת : בסוף חודש נתוני "מבחן המציאות" נמחקים.`;

    const exitButton = document.createElement("button");
    exitButton.innerText = "יציאה";

    divForStyling.append(h1, exitButton);
    containsReminderDiv.append(divForStyling);
    shadow.append(containsReminderDiv);
    document.body.append(containerDiv);

    exitButton.addEventListener('click', () => {
        containerDiv.remove();
    });
}