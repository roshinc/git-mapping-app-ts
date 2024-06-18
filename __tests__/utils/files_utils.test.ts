import fs from "fs";
import path from "path";

import { findDirectories } from "../../src/utils/files_utils";

const createDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

describe("findDirectories", () => {
  const rootDir = path.join(__dirname, "test-root");

  beforeAll(() => {
    createDir(rootDir);
  });

  beforeEach(() => {
    // Clear previous test directories and files
    fs.rmSync(rootDir, { recursive: true, force: true });
    createDir(rootDir);
  });

  afterAll(() => {
    // Cleanup test directories and files
    fs.rmSync(rootDir, { recursive: true, force: true });
  });

  it("should return directories containing the subpath", () => {
    const subPath = "subpath";
    const dir1 = path.join(rootDir, "dir1");
    const dir2 = path.join(rootDir, "dir2");
    const subDir1 = path.join(dir1, subPath);

    createDir(dir1);
    createDir(dir2);
    createDir(subDir1);

    const result = findDirectories(rootDir, subPath);

    expect(result).toEqual([dir1]);
  });

  it("should return directories containing the subpath in nested directories", () => {
    const subPath = "subpath";
    const dir1 = path.join(rootDir, "dir1");
    const subDir1 = path.join(dir1, "subdir1");
    const subDir1SubPath = path.join(subDir1, subPath);

    const dir2 = path.join(rootDir, "dir2");
    const subDir3 = path.join(dir2, "subdir3");
    const subDir3SubPath = path.join(subDir3, subPath);

    createDir(subDir1);
    createDir(subDir1SubPath);
    createDir(subDir3);
    createDir(subDir3SubPath);

    const result = findDirectories(rootDir, subPath);

    expect(result).toEqual([subDir1, subDir3]);
  });
});