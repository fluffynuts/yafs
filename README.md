# fs-utils

A (small) collection of common functions I keep having to write around the `fs` module:

- readTextFile
  - because I keep having to specify the options and I often want text files, not buffers
- folderExists
  - because I need to use fs.stat() and respond appropriately
- fileExists
  - as above
