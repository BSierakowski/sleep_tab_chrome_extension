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

  chrome.tabs.remove(tabId);
  chrome.alarms.create('checkTabs', { periodInMinutes: 1 });

  // Open a new tab with a message
  chrome.tabs.create({
    url: 'data:text/html,<html><body><h1>Your tab has been slept!</h1><p>It will wake up at: ' +
      new Date(wakeupTime).toLocaleString() +
      '</p><p>This tab will close shortly.</p></body></html>'
  }, function (tab) {
    // Close the message tab after 3 seconds
    setTimeout(() => {
      chrome.tabs.remove(tab.id);
    }, 3000);
  });
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
        chrome.tabs.create({
          url: 'data:text/html,<html><body><h1>Your slept tab is waking up!</h1><p>Redirecting to the original content...</p></body></html>'
        }, function (tab) {
          setTimeout(() => {
            chrome.tabs.update(tab.id, { url: tabInfo.tabUrl });
          }, 3000);
        });
        return false;
      }
      return true;
    });

    chrome.storage.local.set({ sleptTabs });
  });
}

