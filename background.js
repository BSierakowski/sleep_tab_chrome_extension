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
    sleptTabs.push({ wakeupTime, tabId, tabUrl, tabTitle });
    chrome.storage.local.set({ sleptTabs });
  });

  const alarmInfo = {
    when: wakeupTime
  };
  chrome.alarms.create(`tab_${tabId}`, alarmInfo);
  chrome.tabs.remove(tabId);
}
