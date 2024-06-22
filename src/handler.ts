import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn, SpawnOptions } from "child_process";
import inquirer from "inquirer";
import dotenv from "dotenv";
import logger from "./utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load the .env file
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const jsonFilePath = path.join(__dirname, "out", "crosswalk.json");
const ECLIPSE_PATH = process.env.ECLIPSE_PATH;
const CUSTOM_PROTOCOL = process.env.CUSTOM_PROTOCOL;

// Check for the existence of the required environment variables
if (!ECLIPSE_PATH || !CUSTOM_PROTOCOL) {
    logger.error("Please provide the ECLIPSE_PATH and CUSTOM_PROTOCOL in the .env file");
    process.exit(1);
}

// Type assertion to ensure ECLIPSE_PATH is treated as a string
const eclipsePath: string = ECLIPSE_PATH;

const openEclipse = async (workspace: string): Promise<void> => {
    const command = eclipsePath;
    const args = ["-data", workspace];
    const options: SpawnOptions = { detached: true, stdio: "ignore" };
    const child = spawn(command, args, options);
    child.unref();
};

const handleGitUrl = async (gitUrl: string): Promise<void> => {
    try {
        const data = await fs.readFile(jsonFilePath, "utf8");
        const gitWorkspaces: Record<string, string[]> = JSON.parse(data);
        const workspaces = gitWorkspaces[gitUrl];

        if (!workspaces) {
            throw new Error("No workspace found for the given git URL: " + gitUrl);
        }

        if (workspaces.length === 1) {
            await openEclipse(workspaces[0]);
        } else {
            const answers = await inquirer.prompt([
                {
                    type: "list",
                    name: "workspace",
                    message: "Multiple workspaces found. Choose one to open:",
                    choices: workspaces,
                },
            ]);
            await openEclipse(answers.workspace);
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error generating crosswalk:: ${error.message}`);
        }
        else {
            logger.error("Error generating crosswalk:", error);
        }
        throw error;
    }
};

const gitUrlWithProtocol = process.argv[2];

if (!gitUrlWithProtocol) {
    logger.error("Please provide a git URL as an argument");
    process.exit(1);
}

if (!gitUrlWithProtocol.startsWith(`${CUSTOM_PROTOCOL}:`)) {
    logger.error("Invalid protocol");
    logger.info(`Usage: ${CUSTOM_PROTOCOL}:<git-url>`);
    logger.info(`we got [${gitUrlWithProtocol}]`);
    process.exit(1);
}

const gitUrl = gitUrlWithProtocol.slice(CUSTOM_PROTOCOL.length + 1); // +1 to remove the colon
handleGitUrl(gitUrl);