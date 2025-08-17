let activeTabId = null;
let activeSince = null;
let timeSpentData = [];

async function getSavedData() {
  const result = await chrome.storage.local.get('timeSpentData');
  timeSpentData = result.timeSpentData || [];
}

function saveTimeSpent() {
  chrome.storage.local.set({ timeSpentData });
}

function addTime(url, time) {
  const entry = timeSpentData.find(e => e.url === url);
  if (entry) {
    entry.timeSpent += time;
  } else {
    timeSpentData.push({ url, timeSpent: time });
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

getSavedData().then(() => {

  chrome.tabs.onActivated.addListener(async info => {
    if (activeTabId !== null && activeSince) {
      if (await isTabVisible(activeTabId)) {
        const time = Date.now() - activeSince;
        const url = (await chrome.tabs.get(activeTabId)).url;
        addTime(url, time);
        saveTimeSpent();
      }
    }
    activeTabId = info.tabId;
    activeSince = Date.now();
  });

  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (tabId === activeTabId && changeInfo.url) {
      if (await isTabVisible(tabId)) {
        const time = Date.now() - activeSince;
        addTime(changeInfo.url, time);
        saveTimeSpent();
      }
      activeSince = Date.now();
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];

      if (!tab || !tab?.url.startsWith('http')) return;
      
      if (tab?.id) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['scripts/injectCategory.js']
        });

        chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ['styles/injectCategory.css']
        });
      }
    });
  });

  chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
    if (tabId === activeTabId && activeSince) {
      if (await isTabVisible(tabId)) {
        const time = Date.now() - activeSince;
        try {
          const tab = await chrome.tabs.get(tabId);
          addTime(tab.url, time);
        } catch (e) {
          // Tab gone, ignore
        }
        saveTimeSpent();
      }
      activeTabId = null;
      activeSince = null;
    }
  });

  chrome.windows.onFocusChanged.addListener(async () => {
    if (activeTabId !== null && activeSince) {
      if (await isTabVisible(activeTabId)) {
        activeSince = Date.now();
      } else {
        const time = Date.now() - activeSince;
        const url = (await chrome.tabs.get(activeTabId)).url;
        addTime(url, time);
        saveTimeSpent();
      }
    }
  });

});