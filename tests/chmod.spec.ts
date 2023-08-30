const mockFs = {
    chmod: jest.fn(),
    chmodSync: jest.fn()
};
jest.doMock("../src/fs", () => mockFs);
import "expect-even-more-jest";
import * as fs from "fs";
import {chmod, chmodSync} from "../src";
import {faker} from "@faker-js/faker";

describe(`chmod`, () => {
    type NoParamCallback = (err: NodeJS.ErrnoException | null) => void;
    beforeEach(() => {
        mockChmodSuccessful();
    });

    function mockChmodSuccessful() {
        mockFs.chmod.mockImplementation(
            (at: string, mode: string | number, callback: NoParamCallback) => {
                callback(null);
            });
    }

    function mockChmodError(err: string) {
        mockFs.chmod.mockImplementation(
            (at: string, mode: string | number, callback: NoParamCallback) => {
                callback(new Error(err));
            });
        mockFs.chmodSync.mockImplementation(
            (at: string, mode: string | number) => {
                throw new Error(err);
            });
    }

    describe(`async`, () => {
        it(`should attempt to set the mode`, async () => {
            // Arrange
            const
                file = faker.system.filePath(),
                mode = randomMode();
            // Act
            await chmod(file, mode);
            // Assert
            expect(mockFs.chmod)
                .toHaveBeenCalledOnceWith(
                    file,
                    mode,
                    jasmine.any(Function)
                );
            expect(mockFs.chmodSync)
                .not.toHaveBeenCalled();
        });

        it(`should surface the error`, async () => {
            // Arrange
            const
                expected = faker.word.words(),
                file = faker.system.filePath(),
                mode = randomMode();
            mockChmodError(expected);
            // Act
            await expect(() => chmod(file, mode))
                .rejects.toThrow(expected);
            // Assert
            expect(mockFs.chmod)
                .toHaveBeenCalledOnceWith(
                    file,
                    mode,
                    jasmine.any(Function)
                );
            expect(mockFs.chmodSync)
                .not.toHaveBeenCalled();
        });
    });

    describe(`sync`, () => {
        it(`should attempt to set the mode`, async () => {
            // Arrange
            const
                file = faker.system.filePath(),
                mode = randomMode();
            // Act
            chmodSync(file, mode);
            // Assert
            expect(mockFs.chmodSync)
                .toHaveBeenCalledOnceWith(
                    file,
                    mode
                );
            expect(mockFs.chmod)
                .not.toHaveBeenCalled();
        });

        it(`should surface the error`, async () => {
            // Arrange
            const
                expected = faker.word.words(),
                file = faker.system.filePath(),
                mode = randomMode();
            mockChmodError(expected);
            // Act
            expect(() => chmodSync(file, mode))
                .toThrow(expected);
            // Assert
            expect(mockFs.chmodSync)
                .toHaveBeenCalledOnceWith(
                    file,
                    mode
                );
            expect(mockFs.chmod)
                .not.toHaveBeenCalled();
        });
    });

    function randomMode(): string | number {
        const nums = [
            faker.number.int({
                min: 1,
                max: 7
            }),
            faker.number.int({
                min: 1,
                max: 7
            }),
            faker.number.int({
                min: 1,
                max: 7
            }),
        ]
        return faker.helpers.arrayElement([true, false])
            ? parseInt(nums.join(""), 10)
            : `${nums.join("")}`
    }
});
