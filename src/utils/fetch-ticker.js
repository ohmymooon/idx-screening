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

export function generateResult(data, filename=''){
  // ensure directory exists
  const dir = "./out";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const now = new Date();
  const YYYY = now.getFullYear();
  const MM   = String(now.getMonth() + 1).padStart(2, '0'); // Month 0-11
  const DD   = String(now.getDate()).padStart(2, '0');
  const hh   = String(now.getHours()).padStart(2, '0');
  const mm   = String(now.getMinutes()).padStart(2, '0');
  const ss   = String(now.getSeconds()).padStart(2, '0');

  const timestamp = `${YYYY}${MM}${DD}-${hh}${mm}${ss}`;
  fs.writeFileSync(`${dir}/${timestamp}-${filename}.json`, JSON.stringify(data, null, 2));
}