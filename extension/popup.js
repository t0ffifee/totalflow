// TODO can we do in a better way? 
import { getLocalStorageItem, setLocalStorageItem } from './localStorageUtils.js';

const dbName = 'totalflowDB';
const objectStoreName = 'flows';

var db; // database object --> will maybe become database store object
var startTime;
var timerIntervalID;

document.getElementById('mainButton').addEventListener('click', router);
document.addEventListener('DOMContentLoaded', function () {
  setupDatabase();
  loadExtension();
  setupNavbar();
});

function setupDatabase() {
  const DBOpenRequest = indexedDB.open(dbName);

  DBOpenRequest.onerror = (event) => {
    console.log('oops');
    // need to add a lot of error handling
  };

  DBOpenRequest.onsuccess = (event) => {
    console.log('we opened the database');
    db = event.target.result;
  };

  DBOpenRequest.onupgradeneeded = (event) => {
    db = event.target.result;

    const objectStore = db.createObjectStore("flows", { keyPath: 'initiatedAt' });

    objectStore.createIndex('durationIndex', 'duration', { unique: false });
  };
}

function saveTime() {
  let now = Date.now();
  let elapsed = now - startTime;

  const flow = { initiatedAt: startTime, duration: elapsed };

  const transaction = db.transaction(['flows'], 'readwrite');
  const objectStore = transaction.objectStore('flows');
  const addRequest = objectStore.add(flow);

  addRequest.onsuccess = () => {
    console.log('Data added successfully');
  };

  addRequest.onerror = (event) => {
    console.error('Error adding data:', event.target.error);
  };

  transaction.oncomplete = () => {
    console.log('Transaction completed');
  };

  transaction.onerror = (event) => {
    console.error('Transaction error:', event.target.error);
  };
}

function router() {
  console.log("clicked on main button");
  var running = localStorage.getItem('running');
  if (running == 'true') {
    console.log('stopping the timer');
    initHomePage();
    saveTime();
  } else {
    console.log('starting the timer');
    initWorkPage();
  }
}

function loadExtension() {
  var running = localStorage.getItem('running');
  if (running == 'true') {
    initWorkPage();
  } else {
    initHomePage();
  }
}

function setupNavbar() {
  var homeLink = document.getElementById('homeLink');
  var statsLink = document.getElementById('statsLink');
  var settingsLink = document.getElementById('settingsLink');

  setLocalStorageItem('dailyFocusTimeGoal', 2);

  function clearClasses() {
    // clearing active class from active icon link
    let activeLink = document.getElementsByClassName('active')[0];
    activeLink.classList.remove('active');

    // clearing selected class from selected content
    let selectedContent = document.getElementsByClassName('selected')[0];
    selectedContent.classList.remove('selected');
  }

  function addSelected(id) {
    let content = document.getElementById(id);
    content.classList.add('selected');
  }

  function buttonSetup(linkElement, contentID) {
    linkElement.addEventListener('click', function (e) {
      e.preventDefault();
      clearClasses();
      linkElement.classList.add('active');
      addSelected(contentID);
    });
  }

  buttonSetup(homeLink, 'homeContent');
  buttonSetup(statsLink, 'statsContent');
  buttonSetup(settingsLink, 'settingsContent');
}

function initHomePage() {
  // UI
  // CHANGE HTML ELEMENTS
  var subText = document.getElementById('subText');
  subText.innerHTML = 'start the timer and get to work';

  var mainButton = document.getElementById('mainButton');
  mainButton.innerHTML = "start working"

  var stopwatch = document.getElementById('stopwatch');
  stopwatch.innerHTML = '';

  // LOGIC
  // UPDATING VARIABLES
  localStorage.setItem('running', false);
  localStorage.setItem('startTime', null);

  // STOPPING THE STOPWATCH UPDATES
  clearInterval(timerIntervalID);
}

function initWorkPage() {
  // UI
  // CHANGE HTML ELEMENTS
  var subText = document.getElementById('subText');
  subText.innerHTML = 'get to work';

  var mainButton = document.getElementById('mainButton');
  mainButton.innerHTML = 'stop working';

  // LOGIC
  // UPDATING VARIABLES
  localStorage.setItem('running', true);

  startTime = localStorage.getItem('startTime');
  if (startTime == 'null') {
    startTime = Date.now();
    localStorage.setItem('startTime', startTime);
  }

  timerIntervalID = setInterval(displayStopwatch, 50);
}

function displayStopwatch() {
  var now = Date.now();
  var elapsed = now - startTime;

  // array of time multiples [hours, min, sec, decimal]
  var d = [3600000, 60000, 1000, 10];
  var time = [];
  var i = 0;

  while (i < d.length) {
    var t = Math.floor(elapsed / d[i]);

    // remove parsed time for next iteration
    elapsed -= t * d[i];

    // add '0' prefix to m,s,d when needed
    t = (i > 0 && t < 10) ? '0' + t : t;
    time.push(t);
    i++;
  }

  document.getElementById('stopwatch').innerHTML = time[0] + ':' + time[1] + ':' + time[2];
}

