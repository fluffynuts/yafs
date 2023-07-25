import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
import { faker } from "@faker-js/faker";
import {
    copyFile,
    CopyFileOptions,
    readTextFile,
    writeTextFile
} from "../src";
import * as path from "path";

describe(`copyFile`, () => {
    describe(`when source doesn't exist`, () => {
        it(`should throw`, async () => {
            // Arrange
            const
                sandbox = await Sandbox.create(),
                src = faker.string.alphanumeric(12),
                target = faker.string.alphanumeric(12),
                srcPath = sandbox.fullPathFor(src),
                targetPath = sandbox.fullPathFor(target);
            expect(srcPath)
                .not.toBeFile();
            // Act
            await expect(copyFile(srcPath, targetPath))
                .rejects.toThrow(/file not found/);
            // Assert
        });
    });
    describe(`when source exists`, () => {
        describe(`when target doesn't exist`, () => {
            it(`should copy the existing file`, async () => {
                // Arrange
                const
                    sandbox = await Sandbox.create(),
                    src = faker.string.alphanumeric(12),
                    target = faker.string.alphanumeric(12),
                    targetPath = sandbox.fullPathFor(target),
                    expected = faker.word.sample(32);
                await sandbox.writeFile(src, expected);
                expect(targetPath)
                    .not.toBeFile();
                // Act
                await copyFile(
                    sandbox.fullPathFor(src),
                    targetPath
                );
                // Assert
                expect(targetPath)
                    .toBeFile();
                const contents = await readTextFile(targetPath);
                expect(contents)
                    .toEqual(expected);
            });
        });

        describe(`when target _file_ exists`, () => {
            describe(`default behavior`, () => {
                it(`should throw`, async () => {
                    // Arrange
                    const
                        sandbox = await Sandbox.create(),
                        src = faker.string.alphanumeric(12),
                        target = faker.string.alphanumeric(12),
                        srcPath = sandbox.fullPathFor(src),
                        targetPath = sandbox.fullPathFor(target);
                    await writeTextFile(srcPath, faker.word.sample());
                    await writeTextFile(targetPath, faker.word.sample());
                    // Act
                    await expect(copyFile(srcPath, targetPath))
                        .rejects.toThrow(/target already exists/);
                    // Assert
                });
            });
            describe(`when explicitly instructed to error on existing`, () => {
                it(`should throw`, async () => {
                    // Arrange
                    const
                        sandbox = await Sandbox.create(),
                        src = faker.string.alphanumeric(12),
                        target = faker.string.alphanumeric(12),
                        srcPath = sandbox.fullPathFor(src),
                        targetPath = sandbox.fullPathFor(target);
                    await writeTextFile(srcPath, faker.word.sample());
                    await writeTextFile(targetPath, faker.word.sample());
                    // Act
                    await expect(copyFile(srcPath, targetPath, CopyFileOptions.errorOnExisting))
                        .rejects.toThrow(/target already exists/);
                    // Assert
                });
            });
            describe(`when explicitly instructed to overwrite`, () => {
                it(`should overwrite`, async () => {
                    // Arrange
                    const
                        sandbox = await Sandbox.create(),
                        src = faker.string.alphanumeric(12),
                        target = faker.string.alphanumeric(12),
                        srcPath = sandbox.fullPathFor(src),
                        targetPath = sandbox.fullPathFor(target),
                        expected = faker.word.sample(10),
                        unexpected = faker.word.sample(10);
                    await writeTextFile(srcPath, expected);
                    await writeTextFile(targetPath, unexpected);
                    // Act
                    await copyFile(srcPath, targetPath, CopyFileOptions.overwriteExisting);
                    // Assert
                    expect(targetPath)
                        .toBeFile();
                    expect(await readTextFile(targetPath))
                        .toEqual(expected);
                });
            });
        });

        describe(`when target _folder_ exists`, () => {
            describe(`when target _file_ within _folder_ does not exist`, () => {
                it(`should copy the file with the same name to the target folder`, async () => {
                    // Arrange
                    const
                        sandbox = await Sandbox.create(),
                        sourceName = faker.string.alphanumeric(10),
                        sourcePath = sandbox.fullPathFor(sourceName),
                        sourceData = faker.word.sample(3),
                        targetName = faker.string.alphanumeric(10),
                        targetPath = sandbox.fullPathFor(targetName),
                        targetFileName = path.join(targetPath, sourceName);
                    await sandbox.writeFile(sourcePath, sourceData);
                    await sandbox.mkdir(targetName)
                    // Act
                    await copyFile(sourcePath, targetPath);
                    // Assert
                    expect(targetFileName)
                        .toBeFile();
                });
            });
        });
    });

    afterAll(async () => {
        await Sandbox.destroyAll();
    });
});
