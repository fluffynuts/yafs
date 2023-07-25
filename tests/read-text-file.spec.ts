import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
import { faker } from "@faker-js/faker";
import { readTextFile, readTextFileLines, readTextFileLinesSync, readTextFileSync } from "../src";

describe(`fs-utils`, () => {
    describe(`readTextFile`, () => {
        describe(`when the file exists`, () => {
            it(`should return the text file contents`, async () => {
                // Arrange
                const
                    sandbox = await Sandbox.create(),
                    expected = faker.word.sample(10),
                    filename = faker.string.alphanumeric(10);
                await sandbox.writeFile(filename, expected);
                const filePath = sandbox.fullPathFor(filename);
                // Act
                const result = await readTextFile(filePath);
                // Assert
                expect(result)
                    .toEqual(expected);
            });
        });

        describe(`when the file does not exist`, () => {
            it(`should throw, as per regular fs`, async () => {
                // Arrange
                const
                    sandbox = await Sandbox.create(),
                    fname = faker.string.alphanumeric(10),
                    fpath = sandbox.fullPathFor(fname);
                // Act
                await expect(
                    readTextFile(fpath)
                ).rejects.toThrow(/ENOENT/);
                // Assert
            });
        });
    });
    describe(`readTextFileSync`, () => {
        describe(`when the file exists`, () => {
            it(`should return the text file contents`, async () => {
                // Arrange
                const
                    sandbox = await Sandbox.create(),
                    expected = faker.word.sample(10),
                    filename = faker.string.alphanumeric(10);
                await sandbox.writeFile(filename, expected);
                const filePath = sandbox.fullPathFor(filename);
                // Act
                const result = readTextFileSync(filePath);
                // Assert
                expect(result)
                    .toEqual(expected);
            });
        });

        describe(`when the file does not exist`, () => {
            it(`should throw, as per regular fs`, async () => {
                // Arrange
                const
                    sandbox = await Sandbox.create(),
                    fname = faker.string.alphanumeric(10),
                    fpath = sandbox.fullPathFor(fname);
                // Act
                expect(
                    () => readTextFileSync(fpath)
                ).toThrow(/ENOENT/);
                // Assert
            });
        });
    });

    describe(`reading text files line for line`, () => {
        describe(`readTextFileLines`, () => {
            it(`should return all the lines from the file`, async () => {
                // Arrange
                const
                    sandbox = await Sandbox.create(),
                    data = `line 1
line 2
`,
                    filename = faker.string.alphanumeric(10),
                    fullPath = await sandbox.writeFile(
                        filename,
                        data
                    );
                // Act
                const result = await readTextFileLines(fullPath);
                // Assert
                expect(result)
                    .toEqual([
                        "line 1",
                        "line 2",
                        ""
                    ]);
            });
        });
        describe(`readTextFileLinesSync`, () => {
            it(`should return all the lines from the file`, async () => {
                // Arrange
                const
                    sandbox = await Sandbox.create(),
                    data = `line 1
line 2
`,
                    filename = faker.string.alphanumeric(10),
                    fullPath = await sandbox.writeFile(
                        filename,
                        data
                    );
                // Act
                const result = readTextFileLinesSync(fullPath);
                // Assert
                expect(result)
                    .toEqual([
                        "line 1",
                        "line 2",
                        ""
                    ]);
            });
        });
    });
});
