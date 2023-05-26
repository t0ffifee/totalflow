chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason == "install") {
    //call a function to handle a first install

    // here I need
    console.log('installed');
  } else if (details.reason == "update") {
    //call a function to handle an update
    console.log('updated');
  }
});