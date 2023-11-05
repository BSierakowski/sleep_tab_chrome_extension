document.getElementById('sleepForm').addEventListener('submit', function (e) {
  // This is what runs when you click "sleep tab" in the extension popup.

  e.preventDefault();
  const datetime = document.getElementById('datetime').value;
  const wakeupTime = new Date(datetime).getTime();
  const now = new Date().getTime();

  if (wakeupTime > now) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      chrome.runtime.sendMessage({
        // scheduleTabSleep is the action that background.js listens for
        action: 'scheduleTabSleep',
        wakeupTime: wakeupTime,
        tabId: tab.id,
        tabUrl: tab.url,
        tabTitle: tab.title
      }, response => {
        console.log(response.result);
        loadSleptTabs();
      });
    });
  } else {
    alert('Please enter a future time.');
  }
});

function loadSleptTabs() {
  // iterates through our collection of slept tabs and displays them in the popup
  chrome.storage.local.get('sleptTabs', function (data) {
    const sleptTabsList = document.getElementById('sleptTabsList');
    sleptTabsList.innerHTML = '';

    const sleptTabs = data.sleptTabs || [];
    sleptTabs.forEach((tabInfo, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
                ${tabInfo.tabTitle} (${tabInfo.tabUrl}) - Wake up at: ${new Date(tabInfo.wakeupTime).toLocaleString()} 
                <button data-index="${index}" class="unsleepBtn">Unsleep Now</button>
                <button data-index="${index}" class="deleteBtn">Delete</button>
            `;
      sleptTabsList.appendChild(li);
    });

    document.querySelectorAll('.unsleepBtn').forEach(button => {
      button.addEventListener('click', function (e) {
        const index = e.target.dataset.index;
        unsleepTabNow(index);
      });
    });

    document.querySelectorAll('.deleteBtn').forEach(button => {
      button.addEventListener('click', function (e) {
        const index = e.target.dataset.index;
        deleteSleptTab(index);
      });
    });
  });
}

function deleteSleptTab(index) {
  chrome.storage.local.get('sleptTabs', function (data) {
    let sleptTabs = data.sleptTabs || [];
    const removedTab = sleptTabs.splice(index, 1)[0];

    chrome.alarms.clear(`tab_${removedTab.tabId}`);
    chrome.storage.local.set({ sleptTabs }, function () {
      loadSleptTabs();
    });
  });
}


function unsleepTabNow(index) {
  chrome.storage.local.get('sleptTabs', function (data) {
    let sleptTabs = data.sleptTabs || [];
    const unsleepTab = sleptTabs.splice(index, 1)[0];

    chrome.tabs.create({ url: unsleepTab.tabUrl });
    chrome.storage.local.set({ sleptTabs }, function () {
      loadSleptTabs();
    });
  });
}

// Load the slept tabs when the popup is opened
loadSleptTabs();
