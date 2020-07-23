# yafs

literally: "Yet Another FileSystem library"

_there are numerous other abstractions... but I keep coming back to writing
these functions..._

## What is it?

A (small) collection of common promise-based functions 
I keep having to write around the `fs` module:

- ls
  - list contents of folders, with options like recursion and regex-matching
- readFile
- readTextFile
  - because I keep having to specify the options and I often want text files, not buffers
- writeFile
- writeTextFile
  - ensures target folders exist before writing
  - simpler interface for text file writing
- folderExists
  - because I need to use fs.stat() and respond appropriately
- fileExists
  - as above
- exists
  - as above, but doesn't care what the path is if it exists
