const getSavedData = () => {
  chrome.storage.local.get('timeSpentData')
    .then((result) => {
      timeSpentData = result.timeSpentData || [];
    })
};

let activeTabId = null;
let activeSince = null;
let timeSpentData = getSavedData();

function saveTimeSpent() {
  chrome.storage.local.set({ timeSpentData }, () => {
    console.log(timeSpentData);
  });
}

function addTime(url, time) {
  const entry = timeSpentData.find(e => e.url === url);
  if (entry) {
    entry.timeSpent += time;
  } else {
    timeSpentData.push({ url, timeSpent: time });
  }
}

chrome.tabs.onActivated.addListener(async info => {
  if (activeTabId !== null && activeSince) {
    const time = Date.now() - activeSince;
    const url = (await chrome.tabs.get(activeTabId)).url;
    addTime(url, time);
    saveTimeSpent();
  }
  activeTabId = info.tabId;
  activeSince = Date.now();
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.url) {
    const time = Date.now() - activeSince;
    addTime(changeInfo.url, time);
    saveTimeSpent();
    activeSince = Date.now();
  }
});

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  if (tabId === activeTabId && activeSince) {
    const time = Date.now() - activeSince;
    try {
      const tab = await chrome.tabs.get(tabId);
      addTime(tab.url, time);
    } catch (e) {
      // tab gone, ignore
    }
    saveTimeSpent();
    activeTabId = null;
    activeSince = null;
  }
});
