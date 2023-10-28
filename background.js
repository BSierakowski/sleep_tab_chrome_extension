function scheduleTabSleep(wakeupTime, tabId) {
  const alarmInfo = {
    when: wakeupTime
  };

  chrome.alarms.create(`tab_${tabId}`, alarmInfo);
  chrome.tabs.remove(tabId);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scheduleTabSleep') {
    scheduleTabSleep(request.wakeupTime, request.tabId);
    sendResponse({ result: 'Tab scheduled successfully' });
  }
});

chrome.alarms.onAlarm.addListener(alarm => {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'images/icon128.png',
    title: 'Tab Wake Up!',
    message: 'It\'s time to reopen the tab you slept.'
  });
});
