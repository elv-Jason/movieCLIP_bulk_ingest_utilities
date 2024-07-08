const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { runUtility } = require('@eluvio/elv-utils-js');
const MasterCreate = require('@eluvio/elv-utils-js/MasterCreate.js');
const MezCreate = require('@eluvio/elv-utils-js/MezCreate.js');
const { getTitleFromVideo } = require('./TitleExtract.js');

const config = JSON.parse(fs.readFileSync('./config/config.json', 'utf8'));
let masterObjectId = '';
let mezObjectId = '';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const runCommand = async (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      resolve(stdout);
    });
  });
};

const CreateMediaObject = async ({
  title,
  masterLibId,
  mezLibId,
  files,
  masterType,
  mezType,
  abrProfilePath,
  configUrl,
  additionalEnvVars = {}
}) => {
  if (!Array.isArray(files)) {
    throw new Error('Files must be an array');
  }

  const masterObject = await runUtility(
    MasterCreate,
    [
      '--title', title,
      '--files', ...files,
      '--libraryId', masterLibId,
      '--type', masterType,
      '--configUrl', configUrl
    ],
    { env: additionalEnvVars }
  );

  masterObjectId = masterObject.data.object_id;

  const mezObject = await runUtility(
    MezCreate,
    [
      '--libraryId', mezLibId,
      '--type', mezType,
      '--title', title,
      '--masterHash', masterObject.data.version_hash,
      '--abrProfile', abrProfilePath,
      '--configUrl', configUrl,
      '--metadata', config.outputJsonPath, 
      '--wait'
    ],
    { env: additionalEnvVars }
  );

  mezObjectId = mezObject.data.object_id;

  console.log(masterObjectId, "MASTER Object ID");
  console.log(mezObjectId, 'MEZZ Object ID');
  return mezObject;
};

const getFilesInDirectory = (directoryPath) => {
  try {
    const files = fs.readdirSync(directoryPath);
    return files.map(file => path.resolve(directoryPath, file));
  } catch (error) {
    console.error("Error reading directory:", error);
    return [];
  }
};

const processFiles = async (files) => {
  for (let filePath of files) {
    try {
      const fileName = await getTitleFromVideo(filePath).catch(() => path.basename(filePath, path.extname(filePath)));
      if (fileName !== ".DS_Store") {
        console.log(`${fileName} in progress`);

        config.videoPath = filePath;
        fs.writeFileSync('./config/config.json', JSON.stringify(config, null, 2), 'utf8');
        
        await runCommand(`node MetaCreate.js`);
        
        const mediaObject = await CreateMediaObject({
          title: fileName,
          masterLibId: config.masterLibId,
          mezLibId: config.mezLibId,
          files: [filePath],
          masterType: config.masterType,
          mezType: config.mezType,
          abrProfilePath: config.abrProfilePath,
          configUrl: config.configUrl,
        });

        console.log('Waiting to give Master Permission');
        await delay(7000);

        try {
          await runCommand(`node ObjectAddGroupPerm.js --objectId ${masterObjectId} --groupAddress ${config.contentAdminsAddress} --permission ${config.permissionType}`);
          console.log('Successfully granted permission for the Master object');
        } catch (error) {
          console.error('Error granting access for the Master Object:', error);
        }

        console.log('Waiting to give Mezzanine Permission');
        await delay(7000);

        try {
          await runCommand(`node ObjectAddGroupPerm.js --objectId ${mezObjectId} --groupAddress ${config.contentAdminsAddress} --permission ${config.permissionType}`);
          console.log('Successfully granted permission for the Mezz object');
        } catch (error) {
          console.error('Error granting access for the Mezz Object:', error);
        }

        console.log('Mezzanine object created successfully:', mediaObject);
      }
    } catch (error) {
      console.error('Error processing file:', error);
    }
  }
};

(async () => {
  const filePathArray = getFilesInDirectory(config.videoDirPath);
  console.log(filePathArray);

  await processFiles(filePathArray);
})();
