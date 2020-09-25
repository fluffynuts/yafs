import "expect-even-more-jest";
import { rename } from "../src/yafs";
import { Sandbox } from "filesystem-sandbox";
import * as faker from "faker";
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
            fileName = faker.random.alphaNumeric(10),
            fullPath = sandbox.fullPathFor(fileName),
            newName = faker.random.alphaNumeric(10),
            fullNewPath = sandbox.fullPathFor(newName),
            data = faker.random.words(3);
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
            original = faker.random.alphaNumeric(10),
            fullPath = sandbox.fullPathFor(original),
            newName = faker.random.alphaNumeric(10),
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
            original = faker.random.alphaNumeric(10),
            fullPath = sandbox.fullPathFor(original),
            newName = faker.random.alphaNumeric(10),
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
            original = faker.random.alphaNumeric(10),
            fullPath = sandbox.fullPathFor(original),
            newName = faker.random.alphaNumeric(10),
            newFullPath = sandbox.fullPathFor(newName);
        await sandbox.writeFile(original, faker.random.words());
        await sandbox.writeFile(newName, faker.random.words());
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
            original = faker.random.alphaNumeric(10),
            fullPath = sandbox.fullPathFor(original),
            newName = faker.random.alphaNumeric(10),
            data = faker.random.words(3),
            newFullPath = sandbox.fullPathFor(newName);
        await sandbox.writeFile(original, data);
        await sandbox.writeFile(newName, faker.random.words());
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
            original = faker.random.alphaNumeric(10),
            fullPath = sandbox.fullPathFor(original),
            newName = faker.random.alphaNumeric(10),
            data = faker.random.words(3),
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
            original = faker.random.alphaNumeric(10),
            originalFilename = faker.random.alphaNumeric(10),
            originalFile = path.join(original, originalFilename),
            originalData = faker.random.words(3),
            targetFolder = faker.random.alphaNumeric(10),
            targetFile = path.join(targetFolder, faker.random.alphaNumeric(10)),
            fileAfterUpdate = sandbox.fullPathFor(path.join(targetFolder, originalFilename)),
            originalFullPath = sandbox.fullPathFor(original),
            targetFullPath = sandbox.fullPathFor(targetFolder);
        await sandbox.writeFile(originalFile, originalData);
        await sandbox.writeFile(targetFile, faker.random.words());

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

    afterEach(async () => {
        await Sandbox.destroyAll();
    });
});
