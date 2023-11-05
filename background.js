chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // This is what lets the background script listen to the "sleep tab" request. The background script is always running,
  // so it can listen for this request and schedule the tab to sleep. It also has access to storgae.local, which is
  // where we store the list of slept tabs, and alarms, which is the job that runs to wake up the tab.
  if (request.action === 'scheduleTabSleep') {
    scheduleTabSleep(request);
    sendResponse({ result: 'Tab scheduled successfully' });
  }
});

function scheduleTabSleep(tabInfo) {
  const { wakeupTime, tabId, tabUrl, tabTitle } = tabInfo;

  // Push this tab and wakeup time into the collection of all slept IDs
  chrome.storage.local.get('sleptTabs', function (data) {
    let sleptTabs = data.sleptTabs || [];
    sleptTabs.push({ wakeupTime, tabUrl, tabTitle });
    chrome.storage.local.set({ sleptTabs });
  });

  // Create the "alarm", which is the job that runs to wake up the tab
  chrome.alarms.create('checkTabs', { periodInMinutes: 1 });

  // In the future we can try this notification:
  // chrome.notifications.create('', {type: "basic", iconUrl: "images/icon128.png", title: "Title", message: "Message"});
  // It says it works in the console, but, no notification appears. I think this would be a lot cleaner than the tab
  // creation method below, but... it doesn't work, so we'll stick with what we got.

  // Close the tab
  chrome.tabs.remove(tabId);

  // Open a new tab as "notification" that the tab has been slept
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

