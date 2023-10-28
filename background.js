chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scheduleTabSleep') {
    scheduleTabSleep(request);
    sendResponse({ result: 'Tab scheduled successfully' });
  }
});

function scheduleTabSleep(tabInfo) {
  const { wakeupTime, tabId, tabUrl, tabTitle } = tabInfo;

  chrome.storage.local.get('sleptTabs', function (data) {
    let sleptTabs = data.sleptTabs || [];
    sleptTabs.push({ wakeupTime, tabUrl, tabTitle });
    chrome.storage.local.set({ sleptTabs });
  });

  // Closing the tab
  chrome.tabs.remove(tabId);

  // Setting the alarm to check every minute for tabs to reopen
  chrome.alarms.create('checkTabs', { periodInMinutes: 1 });
}

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'checkTabs') {
    checkTabs();
  }
});

function checkTabs() {
  chrome.storage.local.get('sleptTabs', function (data) {
    let sleptTabs = data.sleptTabs || [];
    const now = new Date().getTime();

    sleptTabs = sleptTabs.filter(tabInfo => {
      if (tabInfo.wakeupTime <= now) {
        chrome.tabs.create({ url: tabInfo.tabUrl });
        return false; // Remove tab from the list
      }
      return true; // Keep tab in the list
    });

    chrome.storage.local.set({ sleptTabs });
  });
}
