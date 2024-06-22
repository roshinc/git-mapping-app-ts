import { promises as fs } from "fs";

import logger from "../utils/logger.js";
import { GitMap, WorkspaceMap, CrosswalkMap } from "../utils/types.js";


/**
 * Normalize a Git URL to its HTTPS equivalent.
 * 
 * @param {string} url - The Git URL to normalize.
 * @returns {string} The normalized Git URL.
 */
const normalizeGitUrl = (url: string): string => {
    // Convert SSH URL to HTTPS URL
    if (url.startsWith("git@")) {
        return url.replace(":", "/").replace("git@", "https://");
    }
    return url;
};

/**
 * Normalize a Workspace path.
 * 
 * @param {string} path - The Workspace path to normalize.
 * @returns {string} The normalized path.
 */
const normalizeLocalPath = (path: string): string => {
    return path.replace("URI//file:/", "").replace(/\\/g, "/");
};

/**
 * Generate a crosswalk JSON file mapping Git URLs to Eclipse workspaces.
 * @param {GitMap} gitUrls - An object mapping Git URLs to paths within the repositories.
 * @param {WorkspaceMap} eclipseWorkspaces - An object mapping Eclipse workspace paths to imported projects paths.
 * @param {string} outputPath - The path where the output JSON file will be saved.
 */
export const generateCrosswalk = async (
    gitUrls: GitMap,
    eclipseWorkspaces: WorkspaceMap,
    outputPath: string
): Promise<void> => {
    try {
        const crosswalk: CrosswalkMap = {};
        logger.info("Starting to generate the crosswalk.");

        gitUrls.forEach((gitLocalRepoPaths, gitRemoteUrl) => {
            const normalizedGitUrl = normalizeGitUrl(gitRemoteUrl);
            logger.debug(`Processing Git URL: ${normalizedGitUrl} with paths: ${gitLocalRepoPaths}`);

            eclipseWorkspaces.forEach((workspaceGitPaths, workspacePath) => {
                processWorkspacePaths(gitLocalRepoPaths, workspacePath, workspaceGitPaths, crosswalk, normalizedGitUrl);
            });
        });

        const crosswalkForOutput = Object.fromEntries(
            Object.entries(crosswalk).map(([key, value]) => [key, Array.from(value)])
        );

        await fs.writeFile(outputPath, JSON.stringify(crosswalkForOutput, null, 2), "utf-8");
        logger.info(`Crosswalk JSON has been generated and saved as ${outputPath}`);
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error generating crosswalk:: ${error.message}`);
        } else {
            logger.error("Error generating crosswalk:", error);
        }
    }
};

/**
 * Process workspace paths to update the crosswalk.
 * 
 * @param {string[]} localGitRepoPaths - The local Git repository paths.
 * @param {string} currentWorkspacePath - The current workspace path.
 * @param {string[]} gitPathsInWorkspace - The Git paths within the workspace.
 * @param {CrosswalkMap} gitUrlToWorkspaceMap - The map to update with Git URL to workspace path mappings.
 * @param {string} normalizedGitUrl - The normalized Git URL.
 */
const processWorkspacePaths = (
    localGitRepoPaths: string[],
    currentWorkspacePath: string,
    gitPathsInWorkspace: string[],
    gitUrlToWorkspaceMap: CrosswalkMap,
    normalizedGitUrl: string
) => {
    gitPathsInWorkspace.forEach(workspaceGitPath => {
        const normalizedGitInWSPath = normalizeLocalPath(workspaceGitPath);
        for (const gitPath of localGitRepoPaths) {
            if (areEqualCaseInsensitive(normalizedGitInWSPath, normalizeLocalPath(gitPath))) {
                if (!gitUrlToWorkspaceMap[normalizedGitUrl]) {
                    gitUrlToWorkspaceMap[normalizedGitUrl] = new Set<string>();
                }
                gitUrlToWorkspaceMap[normalizedGitUrl].add(currentWorkspacePath);
                logger.debug(`Mapped ${currentWorkspacePath} to ${normalizedGitUrl}`);
            }
        }
    });
};

/**
 * Compare two strings case-insensitively.
 * 
 * @param {string} str1 - The first string.
 * @param {string} str2 - The second string.
 * @returns {boolean} True if the strings are equal case-insensitively, otherwise false.
 */
const areEqualCaseInsensitive = (str1: string, str2: string): boolean => {
    return str1.toUpperCase() === str2.toUpperCase();
};
