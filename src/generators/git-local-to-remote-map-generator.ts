import { execSync } from "child_process";

import logger from "../utils/logger.js";
import { findDirectories } from "../utils/files_utils.js";


/**
 * Generate a mapping of local git repositories to their remote URLs.
 * 
 * @param {string} rootDir - The root directory to search for git repositories.
 * @returns {Map<string, Array<string>>} A mapping of local git repositories to their remote URLs.
 */
export const generateGitLocalToRemoteMap = (rootDir: string): Map<string, Array<string>> => {
    const gitLocalToRemoteMap = new Map<string, Array<string>>();

    // Find all git directories
    const gitDirs = findDirectories(rootDir, ".git");

    // Loop through all git directories and process them
    for (const gitDir of gitDirs) {
        try {
            const remoteUrl = getGitRemoteUrl(gitDir);
            if (remoteUrl) {
                if (!gitLocalToRemoteMap.has(remoteUrl)) {
                    gitLocalToRemoteMap.set(remoteUrl, []);
                }
                // The get can't return undefined because we just set it
                gitLocalToRemoteMap.get(remoteUrl)!.push(gitDir);
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error(`Error getting remote for ${gitDir}: ${error.message}`);
            } else {
                // Handle the case where the error is not an Error object
                console.error(`An unexpected error occurred for ${gitDir}`, error);
            }
        }
    }

    return gitLocalToRemoteMap;
};

/**
 * Get the remote URL of a git repository.
 * 
 * @param {string} repoPath - The path to the git repository.
 * @returns {string} The remote URL of the git repository.
 * @throws {Error} If no remote URL is found.
 */
const getGitRemoteUrl = (repoPath: string): string => {
    const stdout = execSync(`git -C "${repoPath}" remote -v`);
    const lines = stdout.toString().trim().split("\n");
    if (lines.length > 0) {
        const parts = lines[0].split("\t");
        if (parts.length >= 2) {
            return parts[1].trim().split(" ")[0];
        }
    }
    // No remote found, throw an error
    logger.error(`No remote found for ${repoPath}`);
    throw new Error("No remote found");
};