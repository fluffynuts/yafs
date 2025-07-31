import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
import { readJson } from "../src";
import { faker } from "@faker-js/faker";

describe(`readJson`, () => {
    describe(`when no options provided (ie, default behavior)`, () => {
        describe(`when file does not exist`, () => {
            it(`should return undefined`, async () => {
                // Arrange
                const
                    sandbox = await Sandbox.create(),
                    fileName = sandbox.fullPathFor("cow.json");
                // Act
                const result = await readJson<Cow>(fileName);
                // Assert
                expect(result)
                    .toBeUndefined();
            });
        });

        describe(`when file is invalid json`, () => {
            it(`should return null`, async () => {
                // Arrange
                const
                    sandbox = await Sandbox.create(),
                    fileName = await sandbox.writeFile(
                        "cow.json",
                        `
this is definitely not json
`
                    )
                // Act
                const result = await readJson<Cow>(fileName);
                // Assert
                expect(result)
                    .toBeNull();
            });
        });

        describe(`when file is valid json`, () => {
            it(`should return the parsed object`, async () => {
                // Arrange
                const
                    sandbox = await Sandbox.create(),
                    expected: Cow = {
                        name: faker.person.firstName(),
                        ageInMonths: faker.number.int({ min: 8, max: 32 })
                    },
                    fileName = await sandbox.writeFile(
                        "cow.json",
                        JSON.stringify(expected, null, 2)
                    )
                // Act
                const result = await readJson<Cow>(fileName);
                // Assert
                expect(result)
                    .toEqual(expected);
            });
        });
    });

    describe(`when options provided`, () => {
        it(`should throw for missing file on demand`, async () => {
            // Arrange
            const
                sandbox = await Sandbox.create(),
                fileName = sandbox.fullPathFor("cow.json");
            // Act
            const result1 = await readJson<Cow>(fileName, { throw: false });
            await expect(readJson<Cow>(fileName, { throw: true }))
                .rejects.toThrow(/file not found/);
            // Assert
            expect(result1)
                .toBeUndefined();
        });

        it(`should throw for invalid json on demand`, async () => {
            // Arrange
            const
                sandbox = await Sandbox.create(),
                fileName = await sandbox.writeFile(
                    "cow.json",
                    `
this is most definitely not json either
`
                );

            // Act
            const result1 = await readJson<Cow>(fileName, { throw: false });
            await expect(readJson<Cow>(fileName, { throw: true }))
                .rejects.toThrow(/invalid json/);
            // Assert
            expect(result1)
                .toBeNull();
        });
    });

    interface Cow {
        name: string;
        ageInMonths: number;
    }

    afterAll(async () => {
        await Sandbox.destroyAll();
    });
});
