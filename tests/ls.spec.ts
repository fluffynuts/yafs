import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
import { faker } from "@faker-js/faker";
import { FsEntities, ls } from "../src";
import * as path from "path";

describe(`ls`, () => {
  it(`should return all files and folders in the given folder by default`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create(),
      folder = faker.string.alphanumeric(10),
      file = faker.string.alphanumeric(10);
    await sandbox.mkdir(folder);
    await sandbox.writeFile(file, faker.word.sample(10));
    // Act
    const result = await ls(sandbox.path);
    // Assert
    expect(result)
      .toBeEquivalentTo([
        file,
        folder
      ]);
  });

  it(`should return all files and folders in the special folder . by default`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create(),
      folder = faker.string.alphanumeric(10),
      file = faker.string.alphanumeric(10);
    await sandbox.mkdir(folder);
    await sandbox.writeFile(file, faker.word.sample(10));
    // Act
    const result = await sandbox.run(async () => await ls("."));
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
      folder = faker.string.alphanumeric(10),
      file = faker.string.alphanumeric(10);
    await sandbox.mkdir(folder);
    await sandbox.writeFile(file, faker.word.sample(10));
    // Act
    const result = await ls(sandbox.path, { fullPaths: true });
    // Assert
    expect(result)
      .toBeEquivalentTo([
        sandbox.fullPathFor(file),
        sandbox.fullPathFor(folder)
      ]);
  });

  it(`should return full paths on request (even when given relative path)`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create(),
      folder = faker.string.alphanumeric(10),
      file = faker.string.alphanumeric(10);
    await sandbox.mkdir(folder);
    await sandbox.writeFile(file, faker.word.sample(10));
    // Act
    const result = await sandbox.run(
      () => ls(
        ".",
        {
          fullPaths: true,
          recurse: true
        }
      )
    );
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
      folder = faker.string.alphanumeric(10),
      file = faker.string.alphanumeric(10),
      relPath = path.join(folder, file);
    await sandbox.mkdir(folder);
    await sandbox.writeFile(relPath, faker.word.sample());
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
      folder = faker.string.alphanumeric(10),
      file = faker.string.alphanumeric(10),
      relPath = path.join(folder, file);
    await sandbox.mkdir(folder);
    await sandbox.writeFile(relPath, faker.word.sample());
    // Act
    const result = await ls(
      sandbox.path,
      {
        recurse: true,
        entities: FsEntities.files
      }
    );
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
    await sandbox.writeFile(rel1, faker.word.sample());
    await sandbox.writeFile(rel2, faker.word.sample());
    await sandbox.writeFile(otherFile, faker.word.sample());
    // Act
    const result = await ls(sandbox.path, {
      recurse: true,
      match: /file2\.js$/,
      entities: FsEntities.files
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
    await sandbox.writeFile(rel1, faker.word.sample());
    await sandbox.writeFile(rel2, faker.word.sample());
    await sandbox.writeFile(otherFile, faker.word.sample());
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

  it(`should allow multiple filters`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create();
    await sandbox.mkdir("include1");
    await sandbox.mkdir("include2");
    await sandbox.mkdir("exclude1");
    await sandbox.mkdir("exclude2");
    await sandbox.writeFile("include1/file1", faker.word.sample())
    // Act
    const result = await sandbox.run(async () => {
      return await ls(
        ".",
        {
          match: [ /include/, /exclude/ ],
          recurse: true
        }
      )
    });
    // Assert
    expect(result)
      .toHaveLength(5);
  });

  it(`should return [] when the folder doesn't exist`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create(),
      folder = faker.string.alphanumeric(10),
      fullPath = sandbox.fullPathFor(folder);
    // Act
    const result = await ls(fullPath);
    // Assert
    expect(result)
      .toEqual([]);
  });

  it(`should filter against the relative path`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create();
    await sandbox.mkdir("foo.bar.quux.1.2.3");
    // Act
    const result = await sandbox.run(async () => {
      return await ls(".", { match: /^foo\.bar\.quux\.\d+\.\d+\.\d+$/ });
    });
    // Assert
    expect(result)
      .toHaveLength(1);
  });

  it(`should respect max-depth setting`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create();
    await sandbox.mkdir("foo/bar/quux");
    // Act
    const result = await sandbox.run(async () => {
      return await ls(
        ".",
        {
          recurse: true,
          maxDepth: 2
        }
      );
    });
    // Assert
    expect(result)
      .toContain("foo");
    expect(result)
      .toContain(path.join("foo", "bar"));
    expect(result)
      .not.toContain(path.join("foo", "bar", "quux"));
  });

  it(`should stop traversal if it hits an ignored folder`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create();
    await sandbox.mkdir("foo/node_modules/some-module/js");
    // Act
    const result = await sandbox.run(async () => {
      return await ls(
        ".",
        {
          recurse: true,
          doNotTraverse: /node_modules/
        }
      );
    });
    // Assert
    expect(result)
      .toContain("foo");
    expect(result)
      .toContain(path.join("foo", "node_modules")); // it's not mismatched - we just don't traverse it
    expect(result)
      .not.toContain(path.join("foo", "node_modules", "some-module"));
    expect(result)
      .not.toContain(path.join("foo", "node_modules", "some-module", "js"));
  });

  describe(`quick return via stopOnFirstMatch: true`, () => {
    describe(`listing files in a folder, no recursion`, () => {
      describe(`when no filters`, () => {
        it(`should stop on first match`, async () => {
          // Arrange
          const
            sandbox = await Sandbox.create(),
            a = await sandbox.writeFile("a.js", "console.log('a');"),
            b = await sandbox.writeFile("b.js", "console.log('b');"),
            c = await sandbox.writeFile("c.js", "console.log('c');");
          // Act
          const result = await ls(sandbox.path, {
            stopOnFirstMatch: true
          });
          // Assert
          expect(result)
            .toEqual([ "a.js" ]);
        });
      });
      describe(`when have filter`, () => {
        it(`should stop on first match`, async () => {
          // Arrange
          const
            sandbox = await Sandbox.create(),
            a = await sandbox.writeFile("a.js", "console.log('a');"),
            b = await sandbox.writeFile("b.js", "console.log('b');"),
            c = await sandbox.writeFile("c.js", "console.log('c');");
          // Act
          const result = await ls(sandbox.path, {
            stopOnFirstMatch: true,
            match: /b/
          });
          // Assert
          expect(result)
            .toEqual([ "b.js" ]);
        });
      });
    });
    describe(`listing files in a tree`, () => {
      describe(`when have no filter`, () => {
        describe(`when file entities selected`, () => {
          it(`should stop on the first file`, async () => {
            // Arrange
            const
              sandbox = await Sandbox.create(),
              z = await sandbox.writeFile("first/z.js", "console.log('z');"),
              a = await sandbox.writeFile("first/second/a.js", "console.log('a');"),
              expected = path.join("first", "z.js");
            // Act
            const result = await ls(sandbox.path, {
              entities: FsEntities.files,
              recurse: true,
              stopOnFirstMatch: true
            });
            // Assert
            expect(result)
              .toEqual([ expected ]);
          });
        });
        describe(`when folder entities selected`, () => {
          it(`should stop on the first folder`, async () => {
            // Arrange
            const
              sandbox = await Sandbox.create(),
              z = await sandbox.writeFile("first/z.js", "console.log('z');"),
              a = await sandbox.writeFile("first/second/a.js", "console.log('a');"),
              s = await sandbox.mkdir("second");
            // Act
            const result = await ls(sandbox.path, {
              entities: FsEntities.folders,
              recurse: true,
              stopOnFirstMatch: true
            });
            // Assert
            expect(result)
              .toEqual([ "first" ]);
          });
        });
      });
      describe(`when have a filter`, () => {
        describe(`when file entities selected`, () => {
          it(`should stop on the first matched file`, async () => {
            // Arrange
            const
              sandbox = await Sandbox.create(),
              z = await sandbox.writeFile("first/z.js", "console.log('z');"),
              a = await sandbox.writeFile("first/second/a.js", "console.log('a');"),
              expected = path.join("first", "second", "a.js");
            // Act
            const result = await ls(sandbox.path, {
              entities: FsEntities.files,
              recurse: true,
              stopOnFirstMatch: true,
              match: /a.js/
            });
            // Assert
            expect(result)
              .toEqual([ expected ]);
          });
        });
        describe(`when folder entities selected`, () => {
          it(`should stop on the first matched folder (1)`, async () => {
            // Arrange
            const
              sandbox = await Sandbox.create(),
              z = await sandbox.writeFile("first/z.js", "console.log('z');"),
              a = await sandbox.writeFile("first/second/a.js", "console.log('a');"),
              other = await sandbox.mkdir("first/other"),
              otherOther = await sandbox.mkdir("first/other/wat/other"),
              s = await sandbox.mkdir("second");
            // Act
            const result = await ls(sandbox.path, {
              entities: FsEntities.folders,
              recurse: true,
              stopOnFirstMatch: true,
              match: /second/
            });
            // Assert
            expect(result)
              .toEqual([ "second" ]);
          });
          it(`should stop on the first matched folder (2)`, async () => {
            // Arrange
            const
              sandbox = await Sandbox.create(),
              z = await sandbox.writeFile("first/z.js", "console.log('z');"),
              a = await sandbox.writeFile("first/second/a.js", "console.log('a');"),
              other = await sandbox.mkdir("first/other"),
              otherOther = await sandbox.mkdir("first/other/wat/other"),
              s = await sandbox.mkdir("second"),
              expected = path.join("first/other");
            // Act
            const result = await ls(sandbox.path, {
              entities: FsEntities.folders,
              recurse: true,
              stopOnFirstMatch: true,
              match: /other/
            });
            // Assert
            expect(result)
              .toEqual([ expected ]);
          });
        });
      });
    });
  });

  afterAll(async () => {
    await Sandbox.destroyAll();
  });
});

