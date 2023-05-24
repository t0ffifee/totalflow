// Set data in local storage
export function setLocalStorageItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    console.log(`Data stored in local storage: ${key} - ${value}`);
  } catch (error) {
    console.error(`Error storing data in local storage: ${error}`);
  }
}

// Get data from local storage
export function getLocalStorageItem(key) {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      console.log(`Data retrieved from local storage: ${key} - ${item}`);
      return JSON.parse(item);
    }
    console.log(`No data found in local storage for key: ${key}`);
    return null;
  } catch (error) {
    console.error(`Error retrieving data from local storage: ${error}`);
    return null;
  }
}

// Remove data from local storage
export function removeLocalStorageItem(key) {
  try {
    localStorage.removeItem(key);
    console.log(`Data removed from local storage: ${key}`);
  } catch (error) {
    console.error(`Error removing data from local storage: ${error}`);
  }
}

// Clear all data from local storage
export function clearLocalStorage() {
  try {
    localStorage.clear();
    console.log('Local storage cleared.');
  } catch (error) {
    console.error(`Error clearing local storage: ${error}`);
  }
}

// // Example usage
// setLocalStorageItem('username', 'John Doe');

// const retrievedUsername = getLocalStorageItem('username');
// console.log('Retrieved username:', retrievedUsername);

// removeLocalStorageItem('username');

// clearLocalStorage();
