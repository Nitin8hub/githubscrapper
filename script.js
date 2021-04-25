let request = require("request");
let fs = require("fs");
let cheerio = require("cheerio");
let loadedhtml;
let maxW = 0;
let name = "";
function responseHandler(err, res, body) {
  if (!err) {
    loadedhtml = cheerio.load(body);
    let allRows = loadedhtml(".table.bowler>tbody>tr");

    for (let i = 0; i < allRows.length; i++) {
      let allcolumns = loadedhtml(allRows[i]).find("td");
     

      let currname = loadedhtml(allcolumns[0]).text().trim();
      let currW = loadedhtml(allcolumns[4]).text();
      console.log(currname,currW);
    //   if (maxW <= currW) {
    //     maxW = currW;
    //     name = currname;
    //   }
     }
    
  }
}
request(
  "https://www.espncricinfo.com/ser0ies/england-tour-of-india-2020-21-1243364/india-vs-england-1st-t20i-1243388/full-scorecard",
  responseHandler
);
