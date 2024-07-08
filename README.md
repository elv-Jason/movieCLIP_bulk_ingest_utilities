# movieCLIP_bulk_ingest_utilities

A utilities package that can replace [elv-utils-js/utilities](https://github.com/eluv-io/elv-utils-js/) and allows bulk ingestion of MP4 Vidoes.

This package specifically targets the ingestion of the [moveCLIP dataset](https://sail.usc.edu/~mica/MovieCLIP//).

## Directory Layout (files essential for the bulk ingestion process)

     .
     ├── BulkIngest.js
     ├── MetaCreate.js
     ├── TitleExtract.js
     ├── config
     │   ├── config.json
     └── data
         ├── content_data.json

## Installation

```
git clone https://github.com/eluv-io/elv-utils-js
cd elv-utils-js
npm install

cd utilities
git clone https://github.com/elv-Jason/movieCLIP_bulk_ingest_utilities.git

export FABRIC_CONFIG_URL = "Config_URL"
export PRIVATE_KEY = Private Key
```

## Configuration Setup (/config/config.json)

```
{
  "masterLibId": "Library ID for the master object",
  "mezLibId": "Library ID for the mezzanine object",
  "masterType": "Type for the master object",
  "mezType": "Type for the mezzanine object",
  
  "videoDirPath": "/path/to/video_directory",         # Path to the directory that contains all the videos
  "videoPath": "",                                    # Should be left empty
  "outputJsonPath": "./data/",
  "abrProfilePath": "/path/to/abr_profile",
  
  "contentAdminsAddress": "Address of the group to grant permissions",
  "permissionType": "Type of permission to grant",
  
  "configUrl": "URL for the configuration"
}
```

## Usage

#### BulkIngest.js

* Extracts the original title of the content by calling TitleExtract.js
* Extracts the essential ffmpeg metada by calling MetaCreate.js
* Creates master object and grants access to the permission group
* Creates mezzaine object and grants access to the permission group
#### MetaCreate.js
#### TitleExtract.js
