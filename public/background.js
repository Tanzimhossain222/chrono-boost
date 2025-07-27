// Background service worker for Pomodoro Timer
let pomodoroInterval = null;

// Create alarm for timer updates
chrome.alarms.create('pomodoroTick', { periodInMinutes: 1/60 }); // Every second

// Listen for alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'pomodoroTick') {
    // Get current timer state from storage
    chrome.storage.local.get(['pomodoroState'], (result) => {
      if (result.pomodoroState) {
        const state = JSON.parse(result.pomodoroState);
        const timer = state.state?.timer;
        
        if (timer && timer.isRunning) {
          updateTimer(timer);
        }
      }
    });
  }
});

function updateTimer(timer) {
  let { minutes, seconds, mode, completedPomodoros } = timer;
  
  if (seconds > 0) {
    seconds--;
  } else if (minutes > 0) {
    minutes--;
    seconds = 59;
  } else {
    // Timer completed
    handleTimerComplete(mode, completedPomodoros);
    return;
  }
  
  // Update storage
  chrome.storage.local.get(['pomodoroState'], (result) => {
    if (result.pomodoroState) {
      const state = JSON.parse(result.pomodoroState);
      if (state.state?.timer) {
        state.state.timer.minutes = minutes;
        state.state.timer.seconds = seconds;
        chrome.storage.local.set({ pomodoroState: JSON.stringify(state) });
      }
    }
  });
  
  // Update badge with remaining time
  const badgeText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  chrome.action.setBadgeText({ text: badgeText });
  chrome.action.setBadgeBackgroundColor({ color: mode === 'pomodoro' ? '#ef4444' : '#10b981' });
}

function handleTimerComplete(mode, completedPomodoros) {
  // Send notification
  const title = mode === 'pomodoro' ? '🍅 Pomodoro Complete!' : '✅ Break Time Over!';
  const message = mode === 'pomodoro' 
    ? 'Great work! Time for a break.' 
    : 'Break time is over. Ready for your next pomodoro?';
    
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/pomodoro-48.png',
    title: title,
    message: message,
    priority: 2
  });
  
  // Play notification sound
  chrome.storage.local.get(['pomodoroState'], (result) => {
    if (result.pomodoroState) {
      const state = JSON.parse(result.pomodoroState);
      if (state.state?.settings?.sounds) {
        // Sound will be handled by the popup
      }
    }
  });
  
  // Update badge
  chrome.action.setBadgeText({ text: '✓' });
  chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
  
  // Clear badge after 3 seconds
  setTimeout(() => {
    chrome.action.setBadgeText({ text: '' });
  }, 3000);
}

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Pomodoro Timer Pro installed');
  chrome.action.setBadgeText({ text: '' });
});

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  chrome.action.openPopup();
});

// Context menu for quick actions
chrome.contextMenus.create({
  id: 'startPomodoro',
  title: 'Start Pomodoro',
  contexts: ['action']
});

chrome.contextMenus.create({
  id: 'startBreak',
  title: 'Start Break',
  contexts: ['action']
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === 'startPomodoro' || info.menuItemId === 'startBreak') {
    chrome.action.openPopup();
  }
});