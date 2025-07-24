import "expect-even-more-jest"
import { Sandbox } from "filesystem-sandbox";
import { faker } from "@faker-js/faker";
import { randomSentence } from "./random";
import { CopyFileOptions, cp, readTextFile } from "../src";


describe(`cp`, () => {
    it(`should copy the single file`, async () => {
        // Arrange
        const
            sandbox = await Sandbox.create(),
            fileName = faker.system.fileName(),
            src = await sandbox.writeFile(fileName, randomSentence()),
            target = sandbox.fullPathFor(faker.system.fileName());
        expect(target)
            .not.toBeFile();
        // Act
        await cp(src, target);
        // Assert
        expect(target)
            .toBeFile();
    });

    it(`should not recurse by default`, async () => {
        // Arrange
        const
            sandbox = await Sandbox.create(),
            folderName = faker.string.alphanumeric(10),
            src = await sandbox.mkdir(folderName),
            target = sandbox.fullPathFor(faker.string.alphanumeric(10));
        expect(target)
            .not.toBeFolder();
        // Act
        await cp(src, target);
        // Assert
        expect(target)
            .toBeFolder();
    });

    it(`should recurse on demand`, async () => {
        // Arrange
        const
            sandbox = await Sandbox.create(),
            folderName = faker.string.alphanumeric(10),
            fileName = faker.system.fileName(),
            src = await sandbox.mkdir(folderName),
            srcFile = await sandbox.writeFile(`${folderName}/${fileName}`, randomSentence()),
            target = sandbox.fullPathFor(faker.string.alphanumeric(10)),
            targetFile = sandbox.fullPathFor(`${target}/${fileName}`);
        expect(target)
            .not.toBeFolder();
        expect(targetFile)
            .not.toBeFile();
        // Act
        await cp(src, target, { recurse: true });
        // Assert
        expect(target)
            .toBeFolder();
        expect(targetFile)
            .toBeFile();
    });

    it(`should not overwrite by default`, async () => {
        // Arrange
        const
            sandbox = await Sandbox.create(),
            srcFolder = faker.string.alphanumeric(10),
            fileName = faker.system.fileName(),
            src = await sandbox.mkdir(srcFolder),
            srcFile = await sandbox.writeFile(`${srcFolder}/${fileName}`, randomSentence()),
            targetFolder = faker.string.alphanumeric(10),
            dst = await sandbox.mkdir(targetFolder),
            targetFile = await sandbox.writeFile(`${targetFolder}/${fileName}`, randomSentence());

        // Act
        await expect(cp(src, dst, { recurse: true }))
            .toBeRejected();
        // Assert
    });

    it(`should overwrite on demand`, async () => {
        // Arrange
        const
            sandbox = await Sandbox.create(),
            srcFolder = faker.string.alphanumeric(10),
            fileName = faker.system.fileName(),
            src = await sandbox.mkdir(srcFolder),
            sourceContents = randomSentence(),
            srcFile = await sandbox.writeFile(`${srcFolder}/${fileName}`, sourceContents),
            targetFolder = faker.string.alphanumeric(10),
            dst = await sandbox.mkdir(targetFolder),
            targetContents = randomSentence(),
            targetFile = await sandbox.writeFile(`${targetFolder}/${fileName}`, targetContents);

        // Act
        await expect(cp(src, dst, { recurse: true, onExisting: CopyFileOptions.overwriteExisting }))
            .toBeResolved();
        // Assert
        const contents = await readTextFile(targetFile);
        expect(contents)
            .toEqual(sourceContents);
    });
});
