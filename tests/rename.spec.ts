import "expect-even-more-jest";
import { rename } from "../src";
import { Sandbox } from "filesystem-sandbox";
import { faker } from "@faker-js/faker";
import * as path from "path";

describe(`rename`, () => {
    it(`should be an exported function`, async () => {
        // Arrange
        // Act
        expect(rename)
            .toBeAsyncFunction();
        // Assert
    });

    it(`should rename the existing file`, async () => {
        // Arrange
        const
            sandbox = await Sandbox.create(),
            fileName = faker.string.alphanumeric(10),
            fullPath = sandbox.fullPathFor(fileName),
            newName = faker.string.alphanumeric(10),
            fullNewPath = sandbox.fullPathFor(newName),
            data = faker.word.sample(3);
        await sandbox.writeFile(fileName, data);
        expect(fullPath)
            .toBeFile();
        expect(fullNewPath)
            .not.toBeFile();
        // Act
        await rename(fullPath, fullNewPath);
        // Assert
        expect(fullPath)
            .not.toBeFile();
        expect(fullNewPath)
            .toBeFile();
        const newFileData = await sandbox.readTextFile(newName);
        expect(newFileData)
            .toEqual(data);
    });

    it(`should rename the existing folder`, async () => {
        // Arrange
        const
            sandbox = await Sandbox.create(),
            original = faker.string.alphanumeric(10),
            fullPath = sandbox.fullPathFor(original),
            newName = faker.string.alphanumeric(10),
            fullNewPath = sandbox.fullPathFor(newName);
        await sandbox.mkdir(original);
        expect(fullPath)
            .toBeFolder();
        expect(fullNewPath)
            .not.toBeFolder();
        // Act
        await rename(fullPath, fullNewPath);
        // Assert
        expect(fullPath)
            .not.toBeFolder();
        expect(fullNewPath)
            .toBeFolder();
    });

    it(`should immediately throw if the source does not exist`, async () => {
        // Arrange
        const
            sandbox = await Sandbox.create(),
            original = faker.string.alphanumeric(10),
            fullPath = sandbox.fullPathFor(original),
            newName = faker.string.alphanumeric(10),
            newFullPath = sandbox.fullPathFor(newName);
        // Act
        const start = Date.now();
        await expect(rename(fullPath, newFullPath))
            .rejects.toThrow();
        expect(Date.now() - start)
            .toBeLessThan(1000);
        // Assert
    });

    it(`should immediately throw if the target exists and not forced`, async () => {
        // Arrange
        const
            sandbox = await Sandbox.create(),
            original = faker.string.alphanumeric(10),
            fullPath = sandbox.fullPathFor(original),
            newName = faker.string.alphanumeric(10),
            newFullPath = sandbox.fullPathFor(newName);
        await sandbox.writeFile(original, faker.word.sample());
        await sandbox.writeFile(newName, faker.word.sample());
        // Act
        const start = Date.now();
        await expect(rename(fullPath, newFullPath))
            .rejects.toThrow();
        expect(Date.now() - start)
            .toBeLessThan(1000);
        // Assert
    });

    it(`should overwrite an existing file when force is true`, async () => {
        // Arrange
        const
            sandbox = await Sandbox.create(),
            original = faker.string.alphanumeric(10),
            fullPath = sandbox.fullPathFor(original),
            newName = faker.string.alphanumeric(10),
            data = faker.word.sample(3),
            newFullPath = sandbox.fullPathFor(newName);
        await sandbox.writeFile(original, data);
        await sandbox.writeFile(newName, faker.word.sample());
        // Act
        await rename(fullPath, newFullPath, true);
        // Assert
        expect(fullPath)
            .not.toBeFile();
        expect(newFullPath)
            .toBeFile();
        const newFileData = await sandbox.readTextFile(newName);
        expect(newFileData)
            .toEqual(data);
    });

    it(`should replace an existing folder with a file when force is true`, async () => {
        // Arrange
        const
            sandbox = await Sandbox.create(),
            original = faker.string.alphanumeric(10),
            fullPath = sandbox.fullPathFor(original),
            newName = faker.string.alphanumeric(10),
            data = faker.word.sample(3),
            newFullPath = sandbox.fullPathFor(newName);
        await sandbox.writeFile(original, data);
        await sandbox.mkdir(newName);
        // Act
        await rename(fullPath, newFullPath, true);
        // Assert
        expect(fullPath)
            .not.toBeFile();
        expect(newFullPath)
            .toBeFile();
        const newFileData = await sandbox.readTextFile(newName);
        expect(newFileData)
            .toEqual(data);
    });

    it(`should replace an existing folder with a folder when force is true`, async () => {
        // Arrange
        const
            sandbox = await Sandbox.create(),
            original = faker.string.alphanumeric(10),
            originalFilename = faker.string.alphanumeric(10),
            originalFile = path.join(original, originalFilename),
            originalData = faker.word.sample(3),
            targetFolder = faker.string.alphanumeric(10),
            targetFile = path.join(targetFolder, faker.string.alphanumeric(10)),
            fileAfterUpdate = sandbox.fullPathFor(path.join(targetFolder, originalFilename)),
            originalFullPath = sandbox.fullPathFor(original),
            targetFullPath = sandbox.fullPathFor(targetFolder);
        await sandbox.writeFile(originalFile, originalData);
        await sandbox.writeFile(targetFile, faker.word.sample());

        expect(sandbox.fullPathFor(originalFile))
            .toBeFile();
        expect(sandbox.fullPathFor(targetFile))
            .toBeFile();
        // Act
        await rename(originalFullPath, targetFullPath, true);
        // Assert
        expect(sandbox.fullPathFor(targetFile))
            .not.toBeFile();
        expect(fileAfterUpdate)
            .toBeFile();
        const contents = await sandbox.readTextFile(fileAfterUpdate);
        expect(contents)
            .toEqual(originalData);
    });

    it(`should do nothing when src and target are the same`, async () => {
        // Arrange
        const
            sandbox = await Sandbox.create(),
            fileName = faker.string.alphanumeric(10),
            data = faker.word.sample(3),
            fullPath = sandbox.fullPathFor(fileName);
        await sandbox.writeFile(fileName, data);
        // Act
        await rename(fileName, fileName);
        // Assert
        expect(fullPath)
            .toBeFile();
    });

    afterAll(async () => {
        await Sandbox.destroyAll();
    });
});
