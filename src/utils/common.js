export function  formatNumber(num) {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B"; // Billion
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M"; // Million
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K"; // Thousand
  return num.toString();
}

export function  getStartDate(daysBack = 500){
  const date = new Date();
  date.setDate(date.getDate() - daysBack);
  return date.toISOString().split("T")[0];
}