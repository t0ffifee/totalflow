function convertUnixTimeToHHMM(unixTime) {
  const date = new Date(unixTime * 1000); // Convert Unix time to milliseconds

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return hours + ':' + minutes;
}

// Example usage
// const unixTime = 1621450800; // Replace with your Unix timestamp
// const timeString = convertUnixTimeToHHMM(unixTime);
// console.log(timeString); // Output: "13:40"