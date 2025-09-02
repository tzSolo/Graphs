import { getDateInString, DEFUALT_CATEGORIES } from './key.js';

let arrTimeSpent = [];
let arrCategory = [];
let historyChart = null;

async function getSavedCategoriesData() {
    const arrCategoryOptions = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "sendOptions" }, (res) => {
            resolve(res);
        });
    });

    const arrCategories = arrCategoryOptions.map(item => item.hebrew);
    const arrdefualtCategories = DEFUALT_CATEGORIES.map(item => item.category);
    arrCategory = [...arrCategories, ...arrdefualtCategories, "לא ידוע"];
}

async function getSavedData(type) {
    await chrome.runtime.sendMessage({ action: "sendData" });

    const key = getDateInString();
    const result = await chrome.storage.local.get(key);
    const arrTimes = result[key] || [];
    arrTimeSpent = arrTimes.filter(item => item.timeSpent > 0);

    if (type === "category") {
        await getSavedCategoriesData();
    }

    chrome.storage.local.set({ "lastView": new Date().toISOString() });
}

function calculateSumAll() {
    const wholeTime = arrTimeSpent.reduce((sum, item) => sum += item.timeSpent, 0);
    return wholeTime;
}

function partsOfTime(mSeconds) {
    const seconds = String(Math.floor(mSeconds / 1000) % 60).padStart(2, "0");
    const minutes = String(Math.floor(mSeconds / 1000 / 60) % 60).padStart(2, "0");
    const houres = String(Math.floor(mSeconds / 1000 / 60 / 60)).padStart(2, "0");
    return { seconds, minutes, houres };
}

function drawChart(labels, percentages) {
    const ctx = document.getElementById("historyChart").getContext("2d");

    if (historyChart !== null) {
        historyChart.destroy();
    }

    historyChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: percentages,
                backgroundColor: [
                    "#e6194b", "#9a6324", "#ffe119", "#3cb44b", "#4363d8",
                    "#f58231", "#911eb4", "#46f0f0", "#f032e6", "#bcf60c",
                    "#fabebe", "#008080", "#e6beff", "#9a6324", "#fffac8",
                    "#800000", "#aaffc3", "#808000", "#ffd8b1", "#000075",
                    "#808080", "#e6194b", "#3cb44b", "#ffe119", "#4363d8",
                    "#f58231", "#911eb4", "#46f0f0", "#f032e6", "#bcf60c",
                    "#fabebe", "#008080", "#e6beff", "#9a6324", "#fffac8",
                    "#800000", "#aaffc3", "#808000", "#ffd8b1", "#000075",
                    "#808080", "#e6194b", "#3cb44b", "#ffe119", "#4363d8",
                    "#f58231", "#911eb4", "#46f0f0", "#f032e6", "#bcf60c"
                ],
                borderColor: 'black',
                borderWidth: 0.5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: false
                }
            }
        }
    })
}

export async function init(type = "category") {
    let labels = [];
    let percentages = [];

    await getSavedData(type);

    if (arrTimeSpent.length === 0) {
        const h3 = document.getElementById("no-data");
        h3.style.display = "inline-block";
        return;
    }
    const h3 = document.querySelector("h3");
    h3.style.display = "block";

    const wholeTime = calculateSumAll();
    const { seconds, minutes, houres } = partsOfTime(wholeTime);
    if (houres !== "00") {
        h3.innerText = `סה"כ שעות שימוש ${houres}:${minutes}`;
    }
    else {
        h3.innerText = `סה"כ דקות שימוש ${minutes}:${seconds}`;
    }
    const singlePrecent = Number(wholeTime / 100);

    if (type === "category") {
        const arrCategories = arrCategory.map(cat => {
            const total = arrTimeSpent
                .filter(item => item.category === cat)
                .reduce((sum, item) => sum + item.timeSpent, 0);

            return { category: cat, total };
        });

        const arrPercentages = arrCategories.map((item) => {
            const precent = Number((item.total / singlePrecent).toFixed(1));

            const { seconds, minutes, houres } = partsOfTime(item.total);
            const timeSpent = `${houres}:${minutes}:${seconds}`;
            return { ...item, precent, timeSpent };
        });
        const arrData = arrPercentages.filter(item => item.precent > 0);

        labels = arrData.map(item => `${item.precent}% \u200F- ${item.timeSpent} \u200F- ${item.category}`);
        percentages = arrData.map(item => item.precent);
    }
    else {
        arrTimeSpent.forEach(item => {
            labels.push(item.domain);
            percentages.push((item.timeSpent / singlePrecent).toFixed(1));
        });
    }
    drawChart(labels, percentages);
}