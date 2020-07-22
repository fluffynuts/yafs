import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
import * as faker from "faker";
import { exists, fileExists, folderExists } from "../src";

describe(`fs-utils`, () => {
    describe(`existence tests`, () => {
        describe(`folderExists`, () => {
            it(`should return true when the folder exists`, async () => {
                // Arrange
                const
                    sandbox = await Sandbox.create(),
                    p = faker.random.alphaNumeric(10),
                    fullPath = sandbox.fullPathFor(p);
                await sandbox.mkdir(p);
                // Act
                const result = await folderExists(fullPath);
                // Assert
                expect(result)
                    .toBeTrue();
            });
            it(`should return false when the path does not exist`, async () => {
                // Arrange
                const
                    sandbox = await Sandbox.create(),
                    p = faker.random.alphaNumeric(10),
                    fullPath = sandbox.fullPathFor(p);
                // Act
                const result = await folderExists(fullPath);
                // Assert
                expect(result)
                    .toBeFalse();
            });
            it(`should return false when the path exists, but is a file`, async () => {
                // Arrange
                const
                    sandbox = await Sandbox.create(),
                    p = faker.random.alphaNumeric(10),
                    fullPath = sandbox.fullPathFor(p);
                await sandbox.writeFile(p, faker.random.words(10));
                // Act
                const result = await folderExists(fullPath);
                // Assert
                expect(result)
                    .toBeFalse();
            });
        });
        describe(`fileExists`, () => {
            it(`should return true when the file exists`, async () => {
                // Arrange
                const
                    sandbox = await Sandbox.create(),
                    p = faker.random.alphaNumeric(10),
                    fullPath = sandbox.fullPathFor(p);
                await sandbox.writeFile(p, faker.random.words(10));
                // Act
                const result = await fileExists(fullPath);
                // Assert
                expect(result)
                    .toBeTrue();
            });
            it(`should return false when the folder exists`, async () => {
                // Arrange
                const
                    sandbox = await Sandbox.create(),
                    p = faker.random.alphaNumeric(10),
                    fullPath = sandbox.fullPathFor(p);
                await sandbox.mkdir(p);
                // Act
                const result = await fileExists(fullPath);
                // Assert
                expect(result)
                    .toBeFalse();
            });
            it(`should return false when the path does not exist`, async () => {
                // Arrange
                const
                    sandbox = await Sandbox.create(),
                    p = faker.random.alphaNumeric(10),
                    fullPath = sandbox.fullPathFor(p);
                // Act
                const result = await fileExists(fullPath);
                // Assert
                expect(result)
                    .toBeFalse();
            });
        });
        describe(`exists`, () => {
            it(`should return false when the path doesn't exist`, async () => {
                // Arrange
                const
                    sandbox = await Sandbox.create(),
                    p = faker.random.alphaNumeric(10),
                    fullPath = sandbox.fullPathFor(p);
                // Act
                const result = await exists(fullPath);
                // Assert
                expect(result)
                    .toBeFalse();
            });
            it(`should return true when the path is a file`, async () => {
                // Arrange
                const
                    sandbox = await Sandbox.create(),
                    p = faker.random.alphaNumeric(10),
                    fullPath = sandbox.fullPathFor(p);
                await sandbox.writeFile(p, faker.random.words(10));
                // Act
                const result = await exists(fullPath);
                // Assert
                expect(result)
                    .toBeTrue();
            });
            it(`should return true when the path is a folder`, async () => {
                // Arrange
                const
                    sandbox = await Sandbox.create(),
                    p = faker.random.alphaNumeric(10),
                    fullPath = sandbox.fullPathFor(p);
                await sandbox.mkdir(p);
                // Act
                const result = await exists(fullPath);
                // Assert
                expect(result)
                    .toBeTrue();
            });
        });
    });
});
