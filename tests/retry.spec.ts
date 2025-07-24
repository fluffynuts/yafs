import "expect-even-more-jest";
import { retry } from "../src";

describe(`retry`, () => {
    const { spyOn } = jest;
    it(`should retry the async action when it fails`, async () => {
        // Arrange
        let attempts = 0;
        spyOn(console, "error").mockReturnThis();
        // Act

        await retry(() => {
                if (attempts++ > 0) {
                    return Promise.resolve();
                }
                return Promise.reject();
            },
            1,
            10
        );
        // Assert
        expect(attempts)
            .toEqual(2);
    });
});
