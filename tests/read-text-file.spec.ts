import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
import { faker } from "@faker-js/faker";
import { readTextFile, readTextFileSync } from "../src";

describe(`fs-utils`, () => {
    describe(`readTextFile`, () => {
        describe(`when the file exists`, () => {
            it(`should return the text file contents`, async () => {
                // Arrange
                const
                    sandbox = await Sandbox.create(),
                    expected = faker.random.words(10),
                    filename = faker.random.alphaNumeric(10);
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
                    fname = faker.random.alphaNumeric(10),
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
                    expected = faker.random.words(10),
                    filename = faker.random.alphaNumeric(10);
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
                    fname = faker.random.alphaNumeric(10),
                    fpath = sandbox.fullPathFor(fname);
                // Act
                expect(
                    () => readTextFileSync(fpath)
                ).toThrow(/ENOENT/);
                // Assert
            });
        });
    });
});
