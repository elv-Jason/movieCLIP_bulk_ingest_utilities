const { exec } = require('child_process');

function extractTitle(stderr) {
  const titleRegex = /title\s+:\s(.+?)\n/;
  const match = stderr.match(titleRegex);
  return match ? match[1] : null;
}

function getTitleFromVideo(filePath) {
  return new Promise((resolve, reject) => {
    exec(`ffmpeg -i "${filePath}"`, (error, stdout, stderr) => {
      if (error) {
        const title = extractTitle(stderr);
        if (title) {
          resolve(title);
        } else {
          reject('Title not found');
        }
      } else {
        reject('Command failed');
      }
    });
  });
}

module.exports = { getTitleFromVideo };