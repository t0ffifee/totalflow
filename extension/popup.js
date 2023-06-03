// improve this 
import { getLocalStorageItem, setLocalStorageItem } from './localStorageUtils.js';

const dbName = 'totalflowDB';
const objectStoreName = 'flows';

var db; // database object --> will maybe become database store object
var startTime;
var timerIntervalID;

document.getElementById('mainButton').addEventListener('click', router);
document.addEventListener('DOMContentLoaded', function () {

  // setupDatabase();
  // Call the setupDatabase() function
  setupDatabase()
    .then(function () {
      // Perform your desired operations after setupDatabase() is finished
      // Example: Query data, update records, etc.
      calculateTotalFocusTime();
      loadExtension();
      setupNavbar();

      new Chart("myChart", {
        type: "bar",
        data: {
          labels: xValues,
          datasets: [{
            backgroundColor: barColors,
            data: yValues
          }]
        }
      });
    })
    .catch(function (error) {
      // Handle any errors that occur during setupDatabase()
      console.log("Error setting up the database: " + error);
    });
});

function setupDatabase() {
  return new Promise(function (resolve, reject) {
    const DBOpenRequest = indexedDB.open(dbName);

    DBOpenRequest.onerror = (event) => {
      console.log('oops');
      reject(event.target.error);
      // need to add a lot of error handling
    };

    DBOpenRequest.onsuccess = (event) => {
      console.log('we opened the database');
      db = event.target.result;
      resolve(db);
    };

    DBOpenRequest.onupgradeneeded = (event) => {
      db = event.target.result;

      const objectStore = db.createObjectStore("flows", { keyPath: 'initiatedAt' });

      objectStore.createIndex('durationIndex', 'duration', { unique: false });
    };

  });

}

// deze niet meer nodig denk ik??
function openDatabase() {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open('FlowDatabase', 1);

    openRequest.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('flows')) {
        db.createObjectStore('flows', { keyPath: 'initiatedAt' });
      }
    };

    openRequest.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };

    openRequest.onerror = (event) => {
      reject(event.target.error);
    };
  });
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

// function calculateTotalFocusTime() {
//   const transaction = db.transaction(['flows'], 'readonly');
//   const objectStore = transaction.objectStore('flows');
//   const durationIndex = objectStore.index('durationIndex');

//   const sumRequest = durationIndex.openCursor();

//   let sum = 0;

//   sumRequest.onsuccess = (event) => {
//     const cursor = event.target.result;
//     if (cursor) {
//       sum += cursor.value.duration;
//       cursor.continue();
//     } else {
//       console.log('cursor sum:', sum);
//     }
//   };

//   sumRequest.onerror = (event) => {
//     console.error('Error calculating sum:', event.target.error);
//   };

//   console.log('end of function sum:', sum);
//   return sum;
// }

function calculateTotalFocusTime() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['flows'], 'readonly');
    const objectStore = transaction.objectStore('flows');
    const durationIndex = objectStore.index('durationIndex');

    const sumRequest = durationIndex.openCursor();

    let sum = 0;

    sumRequest.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        sum += cursor.value.duration;
        cursor.continue();
      } else {
        console.log('Total duration sum:', sum);
        resolve({ sum: sum, message: 'Total duration sum logged' });
      }
    };

    sumRequest.onerror = (event) => {
      console.error('Error calculating sum:', event.target.error);
      reject(event.target.error);
    };
  });
}

function router() {
  console.log("clicked on main button");
  var running = localStorage.getItem('running');
  if (running == 'true') {
    console.log('stopping the timer');
    initHomePage();
    saveTime();
    calculateTotalFocusTime();
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
      refreshEverything();
    });
  }

  buttonSetup(homeLink, 'homeContent');
  buttonSetup(statsLink, 'statsContent');
  buttonSetup(settingsLink, 'settingsContent');

}

function msToTime(duration) {
  var minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;

  return hours + ":" + minutes
}

// dit kan eigenlijk wel beter, want dit is alleen nodig voor 'stats'
function refreshEverything() {
  calculateTotalFocusTime()
    .then((result) => {
      const totalSeconds = result.sum;

      document.getElementById('totalTime').innerHTML = "total time focused: " + msToTime(totalSeconds);

    })
    .catch((error) => {
      console.error(error);
    });
}

var xValues = ["Italy", "France", "Spain", "USA", "Argentina"];
var yValues = [55, 49, 44, 24, 15];
var barColors = ["red", "green", "blue", "orange", "brown"];

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

