import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
import * as faker from "faker";
import { readTextFile, writeTextFile } from "../dist";
import { copyFile, CopyFileOptions } from "../src";

describe(`copyFile`, () => {
    describe(`when source doesn't exist`, () => {
        it(`should throw`, async () => {
            // Arrange
            const
                sandbox = await Sandbox.create(),
                src = faker.random.alphaNumeric(12),
                target = faker.random.alphaNumeric(12),
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
                    src = faker.random.alphaNumeric(12),
                    target = faker.random.alphaNumeric(12),
                    targetPath = sandbox.fullPathFor(target),
                    expected = faker.random.words(32);
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

        describe(`when target exists`, () => {
            describe(`default behavior`, () => {
                it(`should throw`, async () => {
                    // Arrange
                    const
                        sandbox = await Sandbox.create(),
                        src = faker.random.alphaNumeric(12),
                        target = faker.random.alphaNumeric(12),
                        srcPath = sandbox.fullPathFor(src),
                        targetPath = sandbox.fullPathFor(target);
                    await writeTextFile(srcPath, faker.random.words());
                    await writeTextFile(targetPath, faker.random.words());
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
                        src = faker.random.alphaNumeric(12),
                        target = faker.random.alphaNumeric(12),
                        srcPath = sandbox.fullPathFor(src),
                        targetPath = sandbox.fullPathFor(target);
                    await writeTextFile(srcPath, faker.random.words());
                    await writeTextFile(targetPath, faker.random.words());
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
                        src = faker.random.alphaNumeric(12),
                        target = faker.random.alphaNumeric(12),
                        srcPath = sandbox.fullPathFor(src),
                        targetPath = sandbox.fullPathFor(target),
                        expected = faker.random.words(10),
                        unexpected = faker.random.words(10);
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
    });

    afterAll(async () => {
        await Sandbox.destroyAll();
    });
});
