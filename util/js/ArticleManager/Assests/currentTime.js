function getCurrentDateTime() {
  const now = new Date();
  const dateOptions = { day: "2-digit", month: "2-digit", year: "numeric" };
  const formattedDate = now.toLocaleDateString("en-GB", dateOptions);
  const timeOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  const formattedTime = now.toLocaleTimeString("en-US", timeOptions);

  return { date: formattedDate, time: formattedTime };
}
export default getCurrentDateTime;
