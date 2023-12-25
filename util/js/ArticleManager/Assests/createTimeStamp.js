const createTimestamp = (dateString, timeString) => {
  const [day, month, year] = dateString.split("/");
  const [hours, minutes, seconds] = timeString.split(":");
  const timestamp = new Date(
    `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
  );
  const timestampInSeconds = Math.floor(timestamp.getTime() / 1000);
  return timestampInSeconds;
};

export default createTimestamp;
