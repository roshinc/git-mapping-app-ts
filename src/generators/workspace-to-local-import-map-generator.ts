import fs from "fs";
import path from "path";

import logger from "../utils/logger.js";
import { findDirectories } from "../utils/files_utils.js";
import { getPathFromFile } from "../utils/hex_utils.js";

import { WorkspaceMap } from "../utils/types.js";

/**
 * Generate a mapping of workspace directories to their imported project paths.
 * 
 * @param {string} rootDir - The root directory to search for workspace directories.
 * @returns {Map<string, string[]>} A map of workspace directories to their imported project paths.
 */
export const generateWorkspaceToImportMap = (rootDir: string): WorkspaceMap => {
    const workspaceToImportMap = new Map<string, string[]>();

    // Find all workspace directories
    const workspaceDirs = findDirectories(rootDir, ".metadata");

    for (const workspaceDir of workspaceDirs) {
        try {
            const importPaths = processWorkspaceDirectory(workspaceDir);
            if (importPaths && importPaths.length > 0) {
                if (!workspaceToImportMap.has(workspaceDir)) {
                    workspaceToImportMap.set(workspaceDir, []);
                }
                // The get can't return undefined because we just set it
                workspaceToImportMap.get(workspaceDir)!.push(...importPaths);
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error(`Error getting import path for ${workspaceDir}: ${error.message}`);
            } else {
                console.error(`An unexpected error occurred for ${workspaceDir}`);
            }
        }
    }

    return workspaceToImportMap;
};

/**
 * Given a workspace directory, process the directory to extract the imported project paths.
 * 
 * @param {string} workspaceDir - The workspace directory to process.
 * @returns {string[]} An array of imported project paths for the workspace directory.
 * @throws {Error} If the workspace directory is invalid.
 */
const processWorkspaceDirectory = (workspaceDir: string): string[] => {
    // Check if the workspace directory has projects
    const pluginsPath = path.join(
        workspaceDir,
        ".metadata",
        ".plugins",
        "org.eclipse.core.resources",
        ".projects"
    );
    if (
        fs.existsSync(pluginsPath) &&
        fs.statSync(pluginsPath).isDirectory()
    ) {
        return fs
            .readdirSync(pluginsPath, { withFileTypes: true })
            .filter((projectDir) => {
                // if the project is hidden, ignore it
                if (projectDir.name.startsWith(".")) {
                    return false;
                }
                // if the project has a .location file, include it
                const locationFilePath = createLocationFilePath(pluginsPath, projectDir.name);
                return fs.existsSync(locationFilePath);
            })
            .map((projectDir) => {
                const locationFilePath = createLocationFilePath(pluginsPath, projectDir.name);
                // Extract the import path from the .location file
                const extractedImportPath = getPathFromFile(locationFilePath);
                // Trim the extracted import path, if it exists
                return extractedImportPath ? extractedImportPath.trim() : null;
            })
            // Filter out any null values
            .filter((project): project is string => project !== null);
    }

    // Throw an error if the workspace directory is not valid
    logger.error(`Invalid workspace directory: ${workspaceDir}`);
    throw new Error("Invalid workspace directory");
};

/**
 * Build the location file path for a project directory.
 * 
 * @param pluginsPath the path to the plugins directory
 * @param projectDir  the project directory
 * @returns the location file path
 */
const createLocationFilePath = (pluginsPath: string, projectDir: string): string => {
    return path.join(
        pluginsPath,
        projectDir,
        ".location"
    );
};
