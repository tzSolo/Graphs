import { getDateInString, DEFUALT_CATEGORIES } from './key.js';


let arrTimeSpent = [];
let activeTabData = {};
let domainsWithCategories = [];
let lastView;
let lastReminder;

const saveCategoryOptions = () => {
    chrome.runtime.onInstalled.addListener((details) => {
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

        if (details.reason === "install") {
            chrome.storage.local.set({ arrCategoryOptions });
        }
    });
}

saveCategoryOptions();

const isLastToday = (lastDate) => {
    const now = new Date();
    const lastTimeDate = new Date(lastDate);

    return lastTimeDate.getDate() === now.getDate() &&
        lastTimeDate.getMonth() === now.getMonth() &&
        lastTimeDate.getFullYear() === now.getFullYear();
}

const isEndOfMonth = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const afterTomorrow = new Date(now);
    afterTomorrow.setDate(now.getDate() + 2);

    return tomorrow.getDate() === 1 ||
        (tomorrow.getDay() === 6 && afterTomorrow.getDate() === 1);
}

const onEndOfMonth = async (tabId, url) => {
    if (!isLastToday(lastView) && isEndOfMonth() && !isLastToday(lastReminder)) {
        lastReminder = new Date().toISOString();
        chrome.storage.local.set({ lastReminder });
        await displayReminder(tabId, url);
    }
}

async function getSavedData() {
    const lastMonthKey = getDateInString("previous");
    await chrome.storage.local.remove(lastMonthKey);

    const key = getDateInString();
    const result = await chrome.storage.local.get(key);
    arrTimeSpent = result[key] || [];

    const resultCatgories = await chrome.storage.local.get("domainsWithCategories");
    domainsWithCategories = resultCatgories.domainsWithCategories || [];

    const resultLastView = await chrome.storage.local.get("lastView");
    lastView = resultLastView.lastView || new Date("01/02/2000");

    const resultLastReminder = await chrome.storage.local.get("lastReminder");
    lastReminder = resultLastReminder.lastReminder || new Date("01/02/2000");
}

function saveTimeSpent() {
    const key = getDateInString();

    chrome.storage.local.set({ [key]: arrTimeSpent });
    chrome.storage.local.set({ domainsWithCategories });
}

function addTime(tabData) {
    const { domain, start } = tabData;
    const timeSpent = Date.now() - start;
    if (domain && domain !== "newtab") {
        const entry = arrTimeSpent.find(e => e.domain === domain);
        if (entry) {
            entry.timeSpent += timeSpent;
        }
        else {
            arrTimeSpent.push({ domain, timeSpent, category: "לא ידוע" });
        }
    }
    saveTimeSpent();
}

const getDomain = (url) => {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    }
    catch (e) {
        return null;
    }
}

async function saveNewData(tabId, url = null) {
    if (!url) {
        try {
            const tab = await chrome.tabs.get(tabId);
            url = tab.url;
        }
        catch (e) { }
    }

    const domain = getDomain(url);
    const defualt = DEFUALT_CATEGORIES.find(e => e.domain.test(url));
    if (defualt === undefined) {
        const entry = domainsWithCategories.find(e => e.domain === domain);
        if (entry === undefined || entry.category === "לא ידוע" || entry.category === null) {
            await displayCategorySelect(tabId, url);
        }
        else {
            saveWithoutRepeat(domain, entry.category);
        }
    }
    else {
        saveWithoutRepeat(domain, defualt.category);
    }

    activeTabData = { tabId, domain, start: Date.now() };

    onEndOfMonth(tabId, url);
}

function saveWithoutRepeat(domain, category) {
    const item = arrTimeSpent.find(i => i.domain === domain);
    if (item !== undefined) {
        item.category = category;
    }
    else {
        arrTimeSpent.push({ domain, timeSpent: 0, category });
    }
}

async function displayCategorySelect(tabId, url) {
    if (!url.startsWith("http")) return;

    try {
        await chrome.scripting.executeScript({
            target: { tabId },
            files: ['scripts/injectCategory.js']
        });
    } catch (e) {
    }
}

async function displayReminder(tabId, url) {
    if (!url.startsWith("http")) return;

    try {
        await chrome.scripting.executeScript({
            target: { tabId },
            files: ['scripts/injectReminder.js']
        });
    } catch (e) {
    }
}

async function isTabVisible(tabId) {
    try {
        const tab = await chrome.tabs.get(tabId);
        const window = await chrome.windows.get(tab.windowId);
        return tab.active && window.focused;
    } catch (e) {
        return false;
    }
}

function saveCategoriesData(domain, category) {
    domainsWithCategories.push({ domain, category });
    chrome.storage.local.set({ domainsWithCategories });

    chrome.storage.local.get("arrCategoryOptions", (result) => {
        const arrCategoryOptions = result.arrCategoryOptions || [];
        const entry = arrCategoryOptions.find(e => e.hebrew === category);
        if (entry === undefined) {
            arrCategoryOptions.splice(arrCategoryOptions.length - 1, 0, { label: category, hebrew: category });
            if (arrCategoryOptions.length === 16) {
                arrCategoryOptions.pop();
            }

            chrome.storage.local.set({ arrCategoryOptions });
        }
    });
}

getSavedData().then(() => {

    chrome.tabs.onActivated.addListener(async info => {
        await saveNewData(info.tabId);
    });

    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
        if (changeInfo.url && await isTabVisible(tabId)) {
            const currentDomain = getDomain(changeInfo.url);
            if (currentDomain !== activeTabData.domain) {
                addTime(activeTabData);
                saveNewData(tabId, changeInfo.url);
            }
        }
    });

    chrome.tabs.onRemoved.addListener(async (tabId) => {
        if (activeTabData.tabId === tabId) { addTime(activeTabData); }
    });

    chrome.windows.onFocusChanged.addListener(async (windowId) => {
        if (windowId === chrome.windows.WINDOW_ID_NONE) return;
        chrome.tabs.query({ active: true, windowId }, (tabs) => {
            if (activeTabData.domain !== getDomain(tabs[0].url)) {
                addTime(activeTabData);
                saveNewData(tabs[0].id, tabs[0].url);
            }
        });
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "categorySelected") {
            const { domain } = activeTabData;
            const { category } = message;
            saveWithoutRepeat(domain, category);
            saveCategoriesData(domain, category);
        }
        if (message.action === "sendData") {
            saveTimeSpent();
        }
        if (message.action === "sendOptions") {
            const result = chrome.storage.local.get("arrCategoryOptions", (result) => {
                const arrCategoryOptions = result.arrCategoryOptions || [];
                sendResponse(arrCategoryOptions);
            });
            return true;
        }
    });
});