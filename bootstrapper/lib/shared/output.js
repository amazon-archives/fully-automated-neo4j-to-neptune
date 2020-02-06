const fs = require("fs");

class Output {
  FileName = "stack-output.json";
  constructor(fileName) {
    if (fileName) this.FileName = fileName;
  }
  load() {
    return JSON.parse(fs.readFileSync(this.FileName));
  }
  write(contents) {
    fs.writeFile(this.FileName, JSON.stringify(contents), err => {
      if (err) {
        console.log(err);
        return;
      }
    });
  }
}

module.exports = { Output };
