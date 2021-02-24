# yafs

literally: "Yet Another FileSystem library"

_there are numerous other abstractions... but I keep coming back to writing
these functions..._

## What is it?

A (small) collection of common promise-based functions 
I keep having to write around the `fs` module:

- ls
  - list contents of folders, with options like recursion and regex-matching
- folderExists
  - tests if a folder exists by path
- fileExists
  - tests if a file exists by path
- exists
  - tests if the path exists (file or folder or other)
- rm
  - deletes a file or folder (recursive)
- rmdir
  - deletes a folder only (will error if the folder isn't empty)
- readFile
- readTextFile
  - because I keep having to specify the options and I often want text files, not buffers
- writeFile
- writeTextFile
  - ensures target folders exist before writing
  - simpler interface for text file writing
  
## Examples
```javascript
// ls
const immediates = await ls("/path/to/folder");
// ls can take an options parameter
// - all entities on options are optional
const tree = await ls("/path/to/folder", {
  recurse: true,
  fullPaths: true, // provide the full path, including /path/to/folder
  entities: 3,     // typescript enum: 1 = files, 2 = folders, 3 = all
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
