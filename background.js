function scheduleTabSleep(wakeupTime, tabId) {
  const alarmInfo = {
    when: wakeupTime
  };

  chrome.alarms.create(`tab_${tabId}`, alarmInfo);
  chrome.tabs.remove(tabId);
}

chrome.alarms.onAlarm.addListener(alarm => {
  const tabId = parseInt(alarm.name.split('_')[1]);

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'images/icon128.png',
    title: 'Tab Wake Up!',
    message: 'It\'s time to reopen the tab you slept.'
  });
});
