import fs from "fs";
import path from "path";


/**
 * Finds all directories that contain a specific subpath.
 * 
 * @param rootDir the root directory to search
 * @param subPath the subpath to search for
 * @returns an array of directories that contain the subpath
 */
export const findDirectories = (
  rootDir: string,
  subPath: string
): string[] => {
  const directories: string[] = [];
  const files = fs.readdirSync(rootDir, { withFileTypes: true });

  for (const file of files) {
    const filePath = path.join(rootDir, file.name);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
        if(fs.existsSync(path.join(filePath, subPath))) {
            directories.push(filePath);
        } else {
            const subDirectories = findDirectories(filePath, subPath);
            directories.push(...subDirectories);
        }
    }
  }

  return directories;
};