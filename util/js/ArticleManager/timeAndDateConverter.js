const timeAndDateConverter = (datePart, timePart) => {
  try {
    const [day, month, year] = datePart.split("/").map(Number);
    const [hours, minutes, seconds] = timePart.split(":").map(Number);

    const dateObject = new Date(year, month - 1, day, hours, minutes, seconds);

    const options = {
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };

    const formattedDate = new Intl.DateTimeFormat("en-US", options).format(
      dateObject
    );

    return formattedDate;
  } catch (error) {
    return datePart + timePart;
  }
};
export default timeAndDateConverter;
