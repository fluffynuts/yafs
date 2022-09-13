import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
import { faker } from "@faker-js/faker";
import { rm, rmdir } from "../src/yafs";
import * as path from "path";

describe(`rm`, () => {
    it(`should not error if the given path doesn't exist`, async () => {
        // Arrange
        const
            sandbox = await Sandbox.create(),
            fileName = faker.random.alphaNumeric(10),
            fullPath = sandbox.fullPathFor(fileName);
        // Act
        await expect(rm(fullPath))
            .resolves.not.toThrow();
        // Assert
    });

    it(`should delete the single file at the given path`, async () => {
        // Arrange
        const
            sandbox = await Sandbox.create(),
            fileName = faker.random.alphaNumeric(10),
            fullPath = sandbox.fullPathFor(fileName),
            contents = faker.random.words(3);
        await sandbox.writeFile(fileName, contents);
        expect(fullPath)
            .toBeFile();
        // Act
        await rm(fullPath);
        // Assert
        expect(fullPath)
            .not.toBeFile();
    });

    it(`should delete the empty folder at the given paeth`, async () => {
        // Arrange
        const
            sandbox = await Sandbox.create(),
            folderName = faker.random.alphaNumeric(10),
            fullPath = sandbox.fullPathFor(folderName);
        await sandbox.mkdir(folderName);
        expect(fullPath)
            .toBeFolder();
        // Act
        await rm(fullPath);
        // Assert
        expect(fullPath)
            .not.toBeFolder();
    });

    it(`should delete the folder containing one file and one folder`, async () => {
        // Arrange
        const
            sandbox = await Sandbox.create(),
            folder = faker.random.alphaNumeric(10),
            file1 = faker.random.alphaNumeric(10),
            file2 = faker.random.alphaNumeric(10);
        await sandbox.mkdir(folder);
        await sandbox.writeFile(path.join(folder, file1), faker.random.words(3));
        await sandbox.writeFile(path.join(folder, file2), faker.random.words(3));
        expect(sandbox.path)
            .toBeFolder();
        // Act
        await rm(sandbox.path);
        // Assert
        expect(sandbox.path)
            .not.toBeFolder();
    });

    it(`should delete the deep folder with files`, async () => {
        // Arrange
        const
            sandbox = await Sandbox.create(),
            folder1 = faker.random.alphaNumeric(10),
            folder2 = faker.random.alphaNumeric(10),
            folder3 = faker.random.alphaNumeric(10),
            file1 = faker.random.alphaNumeric(10),
            file2 = faker.random.alphaNumeric(10),
            file1Path = path.join(folder1, folder2, folder3, file1),
            file2Path = path.join(folder1, folder2, file2),
            file1FullPath = sandbox.fullPathFor(file1Path),
            file2FullPath = sandbox.fullPathFor(file2Path),
            folder1Path = sandbox.fullPathFor(folder1);
        await sandbox.mkdir(path.join(folder1, folder2, folder3));
        await sandbox.writeFile(file1Path, faker.random.words(3));
        await sandbox.writeFile(file2Path, faker.random.words(3));
        expect(file1FullPath)
            .toBeFile();
        expect(file2FullPath)
            .toBeFile()
        // Act
        await rm(folder1Path);
        // Assert
        expect(folder1Path)
            .not.toBeFolder();
    });

    it(`rmdir should not error on ENOENT`, async () => {
        // Arrange
        const
            sandbox = await Sandbox.create(),
            folderName = faker.random.alphaNumeric(10),
            folderPath = sandbox.fullPathFor(folderName);
        // Act
        await expect(rmdir(folderPath))
            .resolves.not.toThrow();
        // Assert
    });
});
