document.getElementById('sleepForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const datetime = document.getElementById('datetime').value;
  const wakeupTime = new Date(datetime).getTime();
  const now = new Date().getTime();

  if (wakeupTime > now) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      chrome.runtime.sendMessage({
        action: 'scheduleTabSleep',
        wakeupTime: wakeupTime,
        tabId: tab.id
      }, response => {
        console.log(response.result);
      });
    });
  } else {
    alert('Please enter a future time.');
  }
});
