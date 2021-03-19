import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
import * as faker from "faker";
import { FsEntities, ls } from "../src/yafs";
import * as path from "path";

describe(`ls`, () => {
    it(`should return all files and folders in the given folder by default`, async () => {
        // Arrange
        const
            sandbox = await Sandbox.create(),
            folder = faker.random.alphaNumeric(10),
            file = faker.random.alphaNumeric(10);
        await sandbox.mkdir(folder);
        await sandbox.writeFile(file, faker.random.words(10));
        // Act
        const result = await ls(sandbox.path);
        // Assert
        expect(result)
            .toBeEquivalentTo([
                file,
                folder
            ]);
    });

    it(`should return full paths on request`, async () => {
        // Arrange
        const
            sandbox = await Sandbox.create(),
            folder = faker.random.alphaNumeric(10),
            file = faker.random.alphaNumeric(10);
        await sandbox.mkdir(folder);
        await sandbox.writeFile(file, faker.random.words(10));
        // Act
        const result = await ls(sandbox.path, { fullPaths: true });
        // Assert
        expect(result)
            .toBeEquivalentTo([
                sandbox.fullPathFor(file),
                sandbox.fullPathFor(folder)
            ]);
    });

    it(`should recurse on request`, async () => {
        // Arrange
        const
            sandbox = await Sandbox.create(),
            folder = faker.random.alphaNumeric(10),
            file = faker.random.alphaNumeric(10),
            relPath = path.join(folder, file);
        await sandbox.mkdir(folder);
        await sandbox.writeFile(relPath, faker.random.words());
        // Act
        const result = await ls(sandbox.path, { recurse: true });
        // Assert
        expect(result)
            .toBeEquivalentTo([
                folder,
                relPath
            ]);
    });

    it(`should return files only on request`, async () => {
        // Arrange
        const
            sandbox = await Sandbox.create(),
            folder = faker.random.alphaNumeric(10),
            file = faker.random.alphaNumeric(10),
            relPath = path.join(folder, file);
        await sandbox.mkdir(folder);
        await sandbox.writeFile(relPath, faker.random.words());
        // Act
        const result = await ls(sandbox.path, { recurse: true, entities: FsEntities.files });
        // Assert
        expect(result)
            .toBeEquivalentTo([
                relPath
            ]);
    });

    it(`should filter on request`, async () => {
        // Arrange
        const
            sandbox = await Sandbox.create(),
            folder = "folder",
            file1 = "file1.json",
            file2 = "file2.js",
            otherFile = "file2.txt",
            rel1 = path.join(folder, file1),
            rel2 = path.join(folder, file2);
        await sandbox.writeFile(rel1, faker.random.words());
        await sandbox.writeFile(rel2, faker.random.words());
        await sandbox.writeFile(otherFile, faker.random.words());
        // Act
        const result = await ls(sandbox.path, {
            recurse: true,
            match: /file2\.js$/
        });
        // Assert
        expect(result)
            .toBeEquivalentTo([
                rel2
            ]);
    });

    it(`should filter on request (full paths)`, async () => {
        // Arrange
        const
            sandbox = await Sandbox.create(),
            folder = "folder",
            file1 = "file1.json",
            file2 = "file2.js",
            otherFile = "file2.txt",
            rel1 = path.join(folder, file1),
            rel2 = path.join(folder, file2),
            expected = sandbox.fullPathFor(rel2);
        await sandbox.writeFile(rel1, faker.random.words());
        await sandbox.writeFile(rel2, faker.random.words());
        await sandbox.writeFile(otherFile, faker.random.words());
        // Act
        const result = await ls(sandbox.path, {
            recurse: true,
            fullPaths: true,
            match: /file2\.js$/
        });
        // Assert
        expect(result)
            .toBeEquivalentTo([
                expected
            ]);
    });

    it(`should filter on request (full paths #2)`, async () => {
        // Arrange
        const
            sandbox = await Sandbox.create();
        await sandbox.mkdir("src/app");
        await sandbox.mkdir("__tests__");
        await sandbox.writeFile("src/index.js", "require('./app');");
        await sandbox.writeFile("src/app/index.js", "// TODO");
        await sandbox.writeFile("__tests__/index.spec.js", "// TODO");
        // Act
        const result = await ls(sandbox.path, {
            recurse: true,
            entities: FsEntities.files,
            fullPaths: false,
            match: /^((?!__tests__).)*$/
        });
        // Assert
        expect(result)
            .toBeEquivalentTo([
                path.join("src", "index.js"),
                path.join("src", "app", "index.js")
            ]);
    });
});
