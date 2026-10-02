export const time = (date: string) =>
  new Date(date).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
  });
export const dateTime = (date: string | null) =>
  date
    ? new Date(date).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    : "Not available";
