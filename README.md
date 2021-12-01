# yafs

literally: "Yet Another FileSystem library"

_there are numerous other abstractions... but I keep coming back to writing
these functions..._

## What is it?

A (small) collection of common promise-based functions 
I keep having to write around the `fs` module:

- copyFile
  - copy a file, with an option to overwite if existing
- exists
  - tests if the path exists (file or folder or other)
- folderExists
  - tests if a folder exists by path
- fileExists
  - tests if a file exists by path
- ls
  - list contents of folders, with options like recursion and regex-matching
- mkdir
  - create a folder (won't error if it already exists)
- rm
  - deletes a file or folder (recursive)
- rmdir
  - deletes a folder only (will error if the folder isn't empty)
- readFile
- readTextFile
  - because I keep having to specify the options and I often want text files, not buffers
- rename
  - attempt to rename a file or folder, with retry
  - if `force` is specified, will remove the target if it already exists
- resolveHomePath
  - resolves a path relative to the user's home for the current platform
- stat
  - attempts to `stat` on a provided path, returns null if the path is not found (no errors)
- writeFile
- writeTextFile
  - ensures target folders exist before writing
  - simpler interface for text file writing
  
## Examples
```javascript
const {
  ls,
  FsEntities,
  fileExists,
  folderExists,
  rm,
  rmdir,
  readFile,
  readTextFile,
  writeFile,
  writeTextFile      
} = require("yafs");
// ls
const immediates = await ls("/path/to/folder");
// ls can take an options parameter
// - all entities on options are optional
const tree = await ls("/path/to/folder", {
  recurse: true,
  fullPaths: true, // provide the full path, including /path/to/folder
  entities: FsEntities.all, // enum: files = 1, folders = 2, all = 3
  match: /\.js$/   // regex to match files you're interested in (*.js here)
});

// existence
const haveConfig = await fileExists("config.yaml");
const haveConfigDir = await folderExists("config");

// delete things
await rm("/path/to/file"); // deletes the file
await rm("/path/to/folder"); // recursively deletes the folder
await rmdir("/path/to/folder"); // deletes the empty folder

// reading files
const buffer = await readFile("/path/to/binary");
const text = await readTextFile("/path/to/file.txt");

// writing files
await writeTextFile("/path/to/file.txt", "hello, world!\nthis is nice");
await writeFile("/path/to/binary", Buffer.from([20, 21, 42]));
```
