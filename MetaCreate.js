const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const config = JSON.parse(fs.readFileSync('./config/config.json', 'utf8'));
const videoPath = config.videoPath;
const outputJsonPath = config.outputJsonPath;

exec(`ffmpeg -i "${videoPath}" -f null -`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing FFmpeg: ${error.message}`);
    return;
  }

  const output = stderr;
  const metadata = parseFFmpegOutput(output, videoPath);
  const jsonStructure = createJSONStructure(metadata);

  fs.writeFileSync(outputJsonPath, JSON.stringify(jsonStructure, null, 2), 'utf8');
  console.log(`JSON file has been created at: ${outputJsonPath}`);
});

function parseFFmpegOutput(output, videoPath) {
  const metadata = {};
  const titleMatch = output.match(/title\s*:\s*(.*)/);
  const durationMatch = output.match(/Duration:\s*(\d{2}:\d{2}:\d{2}\.\d{2})/);
  const castMatch = output.match(/Cast\s*:\s*(.*)/);
  const directorMatch = output.match(/Director\s*:\s*(.*)/);
  const producersMatch = output.match(/Producers\s*:\s*(.*)/);
  const screenwritersMatch = output.match(/Screenwriters\s*:\s*(.*)/);
  const copyrightMatch = output.match(/: CREDITS:\n\s*:\s*([^:\n]*)/);
  const clipDescriptionMatch = output.match(/CLIP DESCRIPTION:\s*([\s\S]*?)(?=\n\s*:)/);
  const filmDescriptionMatch = output.match(/FILM DESCRIPTION:\s*([\s\S]*?)(?=\n\s*:|$)/);

  if (titleMatch) metadata.title = titleMatch[1].trim();
  if (durationMatch) metadata.duration = durationMatch[1].trim();
  if (copyrightMatch) metadata.copyright = copyrightMatch[1].trim();

  if (castMatch) metadata.cast = castMatch[1].trim().split(', ');
  if (directorMatch) metadata.director = directorMatch[1].trim().split(', ');
  if (producersMatch) metadata.producers = producersMatch[1].trim().split(', ');
  if (screenwritersMatch) metadata.screenwriters = screenwritersMatch[1].trim().split(', ');

  const extractedTitleMatch = metadata.title.match(/^(.+?) \(\d+\/\d+\) Movie CLIP - (.+?) \((\d{4})\) HD/);
  if (extractedTitleMatch) metadata.extractedTitle = extractedTitleMatch[1] + ' ' + extractedTitleMatch[3];
  if (extractedTitleMatch) metadata.date = extractedTitleMatch[3];
  if (extractedTitleMatch) metadata.query = extractedTitleMatch[2];

  if (clipDescriptionMatch) metadata.clipdescription = clipDescriptionMatch[1].replace(/(^:|\s+:\s*$)/g, '').trim().replace(/\n\s*:\s*/g, ' ').trim();
  if (filmDescriptionMatch) metadata.filmdescription = filmDescriptionMatch[1].replace(/(^:|\s+:\s*$)/g, '').trim().replace(/\n\s*:\s*/g, ' ').trim();

  metadata.id = path.basename(videoPath, '.mp4');

  return metadata;
}

function createJSONStructure(metadata) {
  const talent = {};

  if (metadata.cast) {
    talent.actor = metadata.cast.map((name, index) => ({
      name: name,
      talent_type: "Actor"
    }));
  }

  if (metadata.director) {
    talent.director = metadata.director.map((name, index) => ({
      name: name,
      talent_type: "Director"
    }));
  }

  if (metadata.producers) {
    talent.producer = metadata.producers.map((name, index) => ({
      name: name,
      talent_type: "Producer"
    }));
  }

  if (metadata.screenwriters) {
    talent.screenplay = metadata.screenwriters.map((name, index) => ({
      name: name,
      talent_type: "Screenwriter"
    }));
  }

  return {
    "public": {
      "asset_metadata": {
        "display_title": metadata.extractedTitle || "",
        "movieClips ID": metadata.id || "",
        "info": {
          "copyright": metadata.copyright,
          "runtime": metadata.duration || "",
          "synopsis": metadata.clipdescription || "",
          "talent": talent,
          "release_year": metadata.date ? metadata.date.substring(0, 4) : ""
        },
        "title": metadata.title || "",
        "query": metadata.query,
        "film description": metadata.filmdescription
      },
      "name": metadata.title
    }
  };
}
