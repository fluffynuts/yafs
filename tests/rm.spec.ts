import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
import { faker } from "@faker-js/faker";
import { rm, rmdir, rmSync, rmdirSync } from "../src/yafs";
import * as path from "path";

describe(`rm`, () => {
    it(`should not error if the given path doesn't exist`, async () => {
        // Arrange
        const
            sandbox = await Sandbox.create(),
            fileName = faker.string.alphanumeric(10),
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
            fileName = faker.string.alphanumeric(10),
            fullPath = sandbox.fullPathFor(fileName),
            contents = faker.word.sample(3);
        await sandbox.writeFile(fileName, contents);
        expect(fullPath)
            .toBeFile();
        // Act
        await rm(fullPath);
        // Assert
        expect(fullPath)
            .not.toBeFile();
    });

    it(`should delete the empty folder at the given path`, async () => {
        // Arrange
        const
            sandbox = await Sandbox.create(),
            folderName = faker.string.alphanumeric(10),
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
            folder = faker.string.alphanumeric(10),
            file1 = faker.string.alphanumeric(10),
            file2 = faker.string.alphanumeric(10);
        await sandbox.mkdir(folder);
        await sandbox.writeFile(path.join(folder, file1), faker.word.sample(3));
        await sandbox.writeFile(path.join(folder, file2), faker.word.sample(3));
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
            folder1 = faker.string.alphanumeric(10),
            folder2 = faker.string.alphanumeric(10),
            folder3 = faker.string.alphanumeric(10),
            file1 = faker.string.alphanumeric(10),
            file2 = faker.string.alphanumeric(10),
            file1Path = path.join(folder1, folder2, folder3, file1),
            file2Path = path.join(folder1, folder2, file2),
            file1FullPath = sandbox.fullPathFor(file1Path),
            file2FullPath = sandbox.fullPathFor(file2Path),
            folder1Path = sandbox.fullPathFor(folder1);
        await sandbox.mkdir(path.join(folder1, folder2, folder3));
        await sandbox.writeFile(file1Path, faker.word.sample(3));
        await sandbox.writeFile(file2Path, faker.word.sample(3));
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
            folderName = faker.string.alphanumeric(10),
            folderPath = sandbox.fullPathFor(folderName);
        // Act
        await expect(rmdir(folderPath))
            .resolves.not.toThrow();
        // Assert
    });

    describe(`rmSync`, () => {
        it(`should not error if the given path doesn't exist`, async () => {
            // Arrange
            const
                sandbox = await Sandbox.create(),
                fileName = faker.string.alphanumeric(10),
                fullPath = sandbox.fullPathFor(fileName);
            // Act
            expect(() => rmSync(fullPath))
                .not.toThrow();
            // Assert
        });

        it(`should delete the single file at the given path`, async () => {
            // Arrange
            const
                sandbox = await Sandbox.create(),
                fileName = faker.string.alphanumeric(10),
                fullPath = sandbox.fullPathFor(fileName),
                contents = faker.word.sample(3);
            await sandbox.writeFile(fileName, contents);
            expect(fullPath)
                .toBeFile();
            // Act
            rmSync(fullPath);
            // Assert
            expect(fullPath)
                .not.toBeFile();
        });

        it(`should delete the empty folder at the given path`, async () => {
            // Arrange
            const
                sandbox = await Sandbox.create(),
                folderName = faker.string.alphanumeric(10),
                fullPath = sandbox.fullPathFor(folderName);
            await sandbox.mkdir(folderName);
            expect(fullPath)
                .toBeFolder();
            // Act
            rmSync(fullPath);
            // Assert
            expect(fullPath)
                .not.toBeFolder();
        });

        it(`should delete the folder containing one file and one folder`, async () => {
            // Arrange
            const
                sandbox = await Sandbox.create(),
                folder = faker.string.alphanumeric(10),
                file1 = faker.string.alphanumeric(10),
                file2 = faker.string.alphanumeric(10);
            await sandbox.mkdir(folder);
            await sandbox.writeFile(path.join(folder, file1), faker.word.sample(3));
            await sandbox.writeFile(path.join(folder, file2), faker.word.sample(3));
            expect(sandbox.path)
                .toBeFolder();
            // Act
            rmSync(sandbox.path);
            // Assert
            expect(sandbox.path)
                .not.toBeFolder();
        });

        it(`should delete the deep folder with files`, async () => {
            // Arrange
            const
                sandbox = await Sandbox.create(),
                folder1 = faker.string.alphanumeric(10),
                folder2 = faker.string.alphanumeric(10),
                folder3 = faker.string.alphanumeric(10),
                file1 = faker.string.alphanumeric(10),
                file2 = faker.string.alphanumeric(10),
                file1Path = path.join(folder1, folder2, folder3, file1),
                file2Path = path.join(folder1, folder2, file2),
                file1FullPath = sandbox.fullPathFor(file1Path),
                file2FullPath = sandbox.fullPathFor(file2Path),
                folder1Path = sandbox.fullPathFor(folder1);
            await sandbox.mkdir(path.join(folder1, folder2, folder3));
            await sandbox.writeFile(file1Path, faker.word.sample(3));
            await sandbox.writeFile(file2Path, faker.word.sample(3));
            expect(file1FullPath)
                .toBeFile();
            expect(file2FullPath)
                .toBeFile()
            // Act
            rmSync(folder1Path);
            // Assert
            expect(folder1Path)
                .not.toBeFolder();
        });

        it(`rmdir should not error on ENOENT`, async () => {
            // Arrange
            const
                sandbox = await Sandbox.create(),
                folderName = faker.string.alphanumeric(10),
                folderPath = sandbox.fullPathFor(folderName);
            // Act
            expect(() => rmdir(folderPath))
                .not.toThrow();
            // Assert
        });
    });
});

