import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
import { faker } from "@faker-js/faker";
import { mkdir } from "../src";
import * as path from "path";

describe(`fs-utils`, () => {
    describe(`mkdir`, () => {
        it(`should create the folder when missing`, async () => {
            jest.setTimeout(120000);
            // Arrange
            const
                sandbox = await Sandbox.create(),
                folder = faker.random.alphaNumeric(10),
                fullPath = sandbox.fullPathFor(folder);
            // Act
            await mkdir(fullPath);
            // Assert
            expect(await sandbox.folderExists(folder))
                .toBeTrue();
        });
        it(`should create the full folder structure when missing`, async () => {
            // Arrange
            const
                sandbox = await Sandbox.create(),
                folder = faker.random.alphaNumeric(10),
                sub = faker.random.alphaNumeric(10),
                fullPath = sandbox.fullPathFor(folder, sub);
            // Act
            await mkdir(path.join(fullPath));
            // Assert
            expect(fullPath)
                .toBeFolder();
        });
        it(`should do nothing if the folder already exists`, async () => {
            // Arrange
            const
                sandbox = await Sandbox.create(),
                folder = faker.random.alphaNumeric(10),
                sub = faker.random.alphaNumeric(10),
                fullPath = sandbox.fullPathFor(folder, sub);
            // Act
            await mkdir(fullPath);
            expect(fullPath)
                .toBeFolder();
            await expect(mkdir(fullPath))
                .resolves.not.toThrow();
            // Assert
        });
    });
});
