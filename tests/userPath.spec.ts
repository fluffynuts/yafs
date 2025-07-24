import { platform } from "os";
import * as path from "path";
import { resolveHomePath } from "../src";

describe(`userPath`, () => {
    it(`should return the path to an item in the user's home folder`, async () => {
        // Arrange
        const
            home = platform() === "win32"
                ? process.env.USERPROFILE
                : process.env.HOME,
            relative = ".local/bin",
            expected = path.join(home as string, relative);
        // Act
        const result = resolveHomePath(relative);
        // Assert
        expect(result)
            .toEqual(expected);
    });
});
