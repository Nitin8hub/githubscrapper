let request = require("request");
let cheerio = require("cheerio");
let fs = require("fs");
const { format } = require("path");
const { default: jsPDF } = require("jspdf");
let $;
let data = {};

request("https://github.com/topics", getTopicPage);

function getTopicPage(err, res, body) {
  if (!err) {
    $ = cheerio.load(body);
    let allTopicsAnchors = $(
      ".no-underline.d-flex.flex-column.flex-justify-center"
    );
    let allTopicsName = $(
      ".f3.lh-condensed.text-center.Link--primary.mb-0.mt-1"
    );

    for (let i = 0; i < allTopicsAnchors.length; i++) {
        fs.mkdirSync($(allTopicsName[i]).text().trim());
        getAllProjects(
        "https://github.com/" + $(allTopicsAnchors[i]).attr("href"),
        $(allTopicsName[i]).text().trim()
      );
    }
  }
}
function getAllProjects(url, name) {
  request(url, function (err, res, body) {
    $ = cheerio.load(body);
    let allProjects = $(
      " .f3.color-text-secondary.text-normal.lh-condensed a.text-bold"
    );

    if (allProjects.length > 8) {
      allProjects = allProjects.slice(0, 8);
    }
    for (let i = 0; i < allProjects.length; i++) {
      let projecturl = "https://github.com/" + $(allProjects[i]).attr("href");
      let projectName = $(allProjects[i]).text().trim();
      console.log(projectName);
      console.log(projecturl);

      if (!data[name]) {
        data[name] = [{ projectName, projecturl }];
      } else {
        data[name].push({ projectName, projecturl });
      }
      getIssues(projecturl, projectName, name);
    }
  });
}
function getIssues(url, projectName, topicName) {
  request(url + "/issues", function (err, res, body) {
    $ = cheerio.load(body);

    let allIssues = $(
      ".Link--primary.v-align-middle.no-underline.h4.js-navigation-open.markdown-title"
    );

    for (let i = 0; i < allIssues.length; i++) {
      let IssueTitle = $(allIssues[i]).text().trim();
      let IssueUrl = "https://github.com" + $(allIssues[i]).attr("href");

      let indx = data[topicName].findIndex(function (e) {
        return e.projectName == projectName;
      });

      if (!data[topicName][indx].issues) {
        data[topicName][indx].issues = [{ IssueTitle, IssueUrl }];
      } else {
        data[topicName][indx].issues.push({ IssueTitle, IssueUrl });
      }

    }
    pdfgen();
  });
}
function pdfgen(){

    for(x in data){
        let tarr = data[x];
        for(y in tarr){
          let pName = tarr[y].projectName;
          if(fs.existsSync(`${x}/${pName}.pdf`))
          fs.unlinkSync(`${x}/${pName}.pdf`);
          const doc = new jsPDF();  
          for(z in tarr[y].issues){
              doc.text(tarr[y].issues[z].IssueTitle,10,10+15 *z);
              doc.text(tarr[y].issues[z].IssueUrl,10,15+15 *z)
            }
            doc.save(`${x}/${pName}.pdf`);
        }
        
    }
}
