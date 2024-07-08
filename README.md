# movieCLIP_bulk_ingest_utilities

A utilities package that can be added to [elv-utils-js/utilities](https://github.com/eluv-io/elv-utils-js/) to allow bulk ingestion of MP4 videos within the same directory

This package specifically targets the ingestion of the [moveCLIP dataset](https://sail.usc.edu/~mica/MovieCLIP//)

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

export FABRIC_CONFIG_URL = "Configuration url"
export PRIVATE_KEY = Private key
```

## Configuration Setup (/config/config.json)

```
{
  "masterLibId": "Library ID for the master object",
  "mezLibId": "Library ID for the mezzanine object",
  "masterType": "Type for the master object",
  "mezType": "Type for the mezzanine object",
  
  "videoDirPath": "/path/to/video_directory",         
  "videoPath": "",                                    # Should be left empty
  "outputJsonPath": "./data/content_data.json",       # Fixed 
  "abrProfilePath": "/path/to/abr_profile",
  
  "contentAdminsAddress": "Address of the group to grant permissions",
  "permissionType": "Type of permission to grant",
  
  "configUrl": "URL for the configuration"
}
```

## Usage

#### TitleExtract.js
* Extracts the original title (e.g., Harry Potter and the Deathly Hallows: Part 2 (1/5) Movie CLIP - Ron and Hermione Kiss (2011) HD).


#### MetaCreate.js

* Extracts all the essential metadata of the video by calling ffmpeg -i and stores the information in data/content_data.json.


#### BulkIngest.js

* Extracts the original title of the content by calling TitleExtract.js.
* Extracts and saves the essential metadata by calling MetaCreate.js.
* Creates a master object and grants access to the permission group (7-second delay).
* Creates a mezzanine object and grants access to the permission group (7-second delay).

## Command

node BulkIngest.js

## Sample Ingested Mezzanine

<img width="1065" alt="Screenshot 2024-07-08 at 1 11 01 PM" src="https://github.com/elv-Jason/movieCLIP_bulk_ingest_utilities/assets/171614703/09b0f709-6de0-4527-9468-633399018082">



