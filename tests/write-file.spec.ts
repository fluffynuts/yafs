import "expect-even-more-jest";
import { faker } from "@faker-js/faker";
import { Sandbox } from "filesystem-sandbox";
import { readFile, readTextFile, writeFile, writeTextFile } from "../src";
import * as path from "path";

describe(`fs-utils`, () => {
    describe(`writeFile`, () => {
        it(`should create supporting paths when required`, async () => {
            // Arrange
            const
                sandbox = await Sandbox.create(),
                dir = faker.random.alphaNumeric(10),
                filename = faker.random.alphaNumeric(10),
                fullPath = sandbox.fullPathFor(dir, filename),
                buffer = Buffer.from(faker.random.words(10));
            // Act
            await writeFile(fullPath, buffer);
            const result = await readFile(fullPath);
            // Assert
            expect(result)
                .toBeInstanceOf(Buffer);
            expect(result.toString())
                .toEqual(buffer.toString());
        });
    });

    describe(`writeTextFile`, () => {
        describe(`when can write the file`, () => {
            it(`should write out the new file`, async () => {
                // Arrange
                const
                    sandbox = await Sandbox.create(),
                    fname = faker.random.alphaNumeric(10),
                    expected = faker.random.words(10),
                    fpath = sandbox.fullPathFor(fname);
                // Act
                await writeTextFile(fpath, expected);
                const result = await readTextFile(fpath);
                // Assert
                expect(result)
                    .toEqual(expected);
            });
            it(`should overwrite out the existing file`, async () => {
                // Arrange
                const
                    sandbox = await Sandbox.create(),
                    fname = faker.random.alphaNumeric(10),
                    first = faker.random.words(10),
                    expected = faker.random.words(10),
                    fpath = sandbox.fullPathFor(fname);
                // Act
                await writeTextFile(fpath, first);
                await writeTextFile(fpath, expected);
                const result = await readTextFile(fpath);
                // Assert
                expect(result)
                    .toEqual(expected);
            });
        });
        describe(`when supporting path doesn't exist`, () => {
            it(`should create the supporting path`, async () => {
                // Arrange
                const
                    sandbox = await Sandbox.create(),
                    dir = faker.random.alphaNumeric(10),
                    expected = faker.random.words(10),
                    fullPath = sandbox.fullPathFor(path.join(dir, faker.random.alphaNumeric(10)));
                // Act
                await writeTextFile(fullPath, expected);
                const result = await readTextFile(fullPath);
                // Assert
                expect(result)
                    .toEqual(expected);
            });
        });
    });

    afterEach(async () => {
        await Sandbox.destroyAll();
    });
});
