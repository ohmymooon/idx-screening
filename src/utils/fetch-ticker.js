import fs from "fs";

export function fetchTicker(isTest=false){
  let path="./data/ticker.csv"
  if(isTest){
    path = `${path}.test`;
  }
  const tickerFile = fs.readFileSync(path, "utf8");
  const tickers = tickerFile.split(", ");
  return tickers;
}