import "expect-even-more-jest";
import {
    touch,
    stat,
    joinPath,
    fileName,
    folderName,
    baseName,
    dirName,
    touchSync
} from "../src";
import { Sandbox } from "filesystem-sandbox";
import { fakerEN as faker } from "@faker-js/faker";
import * as path from "path";
import { sleep } from "expect-even-more-jest";

describe(`utils`, () => {
    describe(`joinPath`, () => {
        it(`should join the strings`, async () => {
            // Arrange
            const
                part1 = faker.word.sample(),
                part2 = faker.word.sample(),
                expected = path.join(part1, part2);
            // Act
            const result = joinPath(part1, part2);
            // Assert
            expect(result)
                .toEqual(expected);
        });

        it(`should join arrays of strings as if they were flattened`, async () => {
            // Arrange
            const
                word1 = faker.word.sample(),
                word2 = faker.word.sample(),
                word3 = faker.word.sample(),
                word4 = faker.word.sample(),
                expected = path.join(word1, word2, word3, word4),
                part1 = [ word1, word2 ],
                part2 = [ word3, word4 ];
            // Act
            const result = joinPath(part1, part2);
            // Assert
            expect(result)
                .toEqual(expected);
        });

        it(`should join mixed args (string | string[])`, async () => {
            // Arrange
            const
                word1 = faker.word.sample(),
                word2 = faker.word.sample(),
                word3 = faker.word.sample(),
                word4 = faker.word.sample(),
                expected = path.join(word1, word2, word3, word4),
                middle = [ word2, word3 ];
            // Act
            const result = joinPath(word1, middle, word4);
            // Assert
            expect(result)
                .toEqual(expected);
        });
    });

    describe(`touch`, () => {
        it(`should create the empty file in an existing folder`, async () => {
            // Arrange
            const
                sandbox = await Sandbox.create(),
                expected = sandbox.fullPathFor(
                    faker.system.fileName()
                );
            expect(expected)
                .not.toBeFile();
            expect(expected)
                .not.toBeFolder();

            // Act
            await touch(expected);

            // Assert
            expect(expected)
                .not.toBeFolder();
            expect(expected)
                .toBeFile();
            const st = await stat(expected);
            expect(st)
                .toExist();
            expect(st!.size)
                .toEqual(0);
        });

        it(`should create required supporting folder structure`, async () => {
            // Arrange
            const
                sandbox = await Sandbox.create(),
                folder = joinPath(
                    faker.word.sample(),
                    faker.word.sample()
                ),
                relativePath = joinPath(
                    folder,
                    faker.system.fileName()
                ),
                expected = sandbox.fullPathFor(
                    relativePath
                );
            expect(expected)
                .not.toBeFile();
            expect(expected)
                .not.toBeFolder();

            // Act
            await touch(expected);

            // Assert
            expect(expected)
                .not.toBeFolder();
            expect(expected)
                .toBeFile();
            const st = await stat(expected);
            expect(st)
                .toExist();
            expect(st!.size)
                .toEqual(0);
        });

        it(`should not trash an existing file`, async () => {
            // Arrange
            const
                sandbox = await Sandbox.create(),
                expected = faker.word.words(),
                fullPath = await sandbox.writeFile(
                    faker.system.fileName(),
                    expected
                );
            expect(fullPath)
                .toBeFile();
            const stBefore = await stat(fullPath);
            await sleep(1000);
            // Act
            await touch(fullPath);
            // Assert
            expect(fullPath)
                .toHaveContents(expected);
            const stAfter = await stat(fullPath);
            expect(stBefore!.mtimeMs)
                .toBeLessThan(stAfter!.mtimeMs);
        });
    });

    describe(`touchSync`, () => {
        it(`should create the empty file in an existing folder`, async () => {
            // Arrange
            const
                sandbox = await Sandbox.create(),
                expected = sandbox.fullPathFor(
                    faker.system.fileName()
                );
            expect(expected)
                .not.toBeFile();
            expect(expected)
                .not.toBeFolder();

            // Act
            touchSync(expected);

            // Assert
            expect(expected)
                .not.toBeFolder();
            expect(expected)
                .toBeFile();
            const st = await stat(expected);
            expect(st)
                .toExist();
            expect(st!.size)
                .toEqual(0);
        });

        it(`should create required supporting folder structure`, async () => {
            // Arrange
            const
                sandbox = await Sandbox.create(),
                folder = joinPath(
                    faker.word.sample(),
                    faker.word.sample()
                ),
                relativePath = joinPath(
                    folder,
                    faker.system.fileName()
                ),
                expected = sandbox.fullPathFor(
                    relativePath
                );
            expect(expected)
                .not.toBeFile();
            expect(expected)
                .not.toBeFolder();

            // Act
            touchSync(expected);

            // Assert
            expect(expected)
                .not.toBeFolder();
            expect(expected)
                .toBeFile();
            const st = await stat(expected);
            expect(st)
                .toExist();
            expect(st!.size)
                .toEqual(0);
        });

        it(`should not trash an existing file`, async () => {
            // Arrange
            const
                sandbox = await Sandbox.create(),
                expected = faker.word.words(),
                fullPath = await sandbox.writeFile(
                    faker.system.fileName(),
                    expected
                );
            expect(fullPath)
                .toBeFile();
            const stBefore = await stat(fullPath);
            await sleep(1000);
            expect(stBefore!.ctimeMs)
                .toBeLessThanOrEqual(Date.now());
            expect(stBefore!.mtimeMs)
                .toBeLessThan(Date.now());
            await sleep(1000);
            // Act
            touchSync(fullPath);
            // Assert
            expect(fullPath)
                .toHaveContents(expected);
            const stAfter = await stat(fullPath);
            expect(stBefore!.mtimeMs)
                .toBeLessThan(stAfter!.mtimeMs);
            expect(stAfter!.mtimeMs)
                .toBeLessThan(Date.now());
        });
    });

    describe(`fileName`, () => {
        it(`should provide the file name from a path`, async () => {
            // Arrange
            const
                p = faker.system.filePath(),
                expected = path.basename(p);
            // Act
            const result = fileName(p);
            // Assert
            expect(result)
                .toEqual(expected);
        });

        it(`should have an alias: baseName`, async () => {
            // Arrange
            // Act
            expect(baseName)
                .toBe(fileName);
            // Assert
        });
    });

    describe(`folderName`, () => {
        it(`should provide the folder name from a path`, async () => {
            // Arrange
            const
                p = faker.system.filePath(),
                expected = path.dirname(p);
            // Act
            const result = folderName(p);
            // Assert
            expect(result)
                .toEqual(expected);
        });

        it(`should have an alias: dirName`, async () => {
            // Arrange
            // Act
            expect(dirName)
                .toBe(folderName);
            // Assert
        });
    });

    afterAll(async () => {
        await Sandbox.destroyAll();
    });
});
