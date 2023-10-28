document.getElementById('sleepForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const datetime = document.getElementById('datetime').value;
  const wakeupTime = new Date(datetime).getTime();
  const now = new Date().getTime();

  if (wakeupTime > now) {
    chrome.runtime.getBackgroundPage(backgroundPage => {
      backgroundPage.scheduleTabSleep(wakeupTime, chrome.tab.id);
    });
  } else {
    alert('Please enter a future time.');
  }
});
