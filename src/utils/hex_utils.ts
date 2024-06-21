import fs from "fs";


const hexStartIndex = 0x11; // Hex index 11

/**
 * Parses the .location file content to extract the import path.
 *
 * @param filePath - The path to the file.
 * @returns The extracted path from the file.
 * @throws {Error} - If the index is out of range or the path length exceeds the file size.
 */
export const getPathFromFile = (filePath:string):string => {
  const data = fs.readFileSync(filePath);

  if (hexStartIndex >= data.length) {
    console.error("Index out of range");
    throw new Error("Index out of range");
  }

  const length = data[hexStartIndex];
  const pathEndIndex = hexStartIndex + 1 + length; // +1 to move to the start of the path
  if (pathEndIndex > data.length) {
    throw new Error("Path length exceeds file size");
  }

  const pathBuffer = Buffer.from(
    data.subarray(hexStartIndex + 1, pathEndIndex)
  );
  return pathBuffer.toString("utf8");
};
