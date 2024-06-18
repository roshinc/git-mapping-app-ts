import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import { generateCrosswalk } from "./generators/crosswalk-map-generator.js";
import { generateWorkspaceToImportMap } from "./generators/workspace-to-local-import-map-generator.js";
import { generateGitLocalToRemoteMap } from "./generators/git-local-to-remote-map-generator.js";
import logger from "./utils/logger.js";


const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory


// Explicitly load the .env file
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const GIT_BASE_DIR = process.env.GIT_BASE_DIR;
const WORKSPACE_BASE_DIR = process.env.WORKSPACE_BASE_DIR;

// Check for the existence of the required environment variables
if (!GIT_BASE_DIR || !WORKSPACE_BASE_DIR) {
  logger.error("Please provide the GIT_BASE_DIR and WORKSPACE_BASE_DIR in the .env file");
  process.exit(1);
}


// Create the output directory if it doesn't exist
const OUTPUT_DIR = path.join(__dirname, "out");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

const WORKSPACE_MAP_FILE = path.join(OUTPUT_DIR, "workspaceMap.json");
const GIT_MAP_FILE = path.join(OUTPUT_DIR, "gitMap.json");
const CROSSWALK_MAP_FILE = path.join(OUTPUT_DIR, "crosswalk.json");

/**
 * Save JSON data to a file.
 * 
 * @param {fs.PathOrFileDescriptor} filePath - The file path where the data will be saved.
 * @param {Map<string, string[]>} data - The data to save.
 */
const saveJSONToFile = (filePath: fs.PathOrFileDescriptor, data: Map<string, string[]>) => {
  // Convert the Map to an object
  const obj = Object.fromEntries(data);
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), "utf-8");
};


// Main execution
try {
  const workspaceMap = generateWorkspaceToImportMap(WORKSPACE_BASE_DIR);
  const gitMap: Map<string, string[]> = generateGitLocalToRemoteMap(GIT_BASE_DIR);

  saveJSONToFile(WORKSPACE_MAP_FILE, workspaceMap);
  saveJSONToFile(GIT_MAP_FILE, gitMap);

  generateCrosswalk(gitMap, workspaceMap, CROSSWALK_MAP_FILE);

  logger.info(`Workspace Mapping saved to ${WORKSPACE_MAP_FILE}`);
  logger.info(`Git Repo Mapping saved to ${GIT_MAP_FILE}`);

} catch (error) {
  if (error instanceof Error) {
    logger.error(`Error during execution: ${error.message}`);
  } else {
    logger.error("An unexpected error occurred", error);
  }
}







