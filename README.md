# envcli

*Populate `.env` file from javascript variables*

### Why Would You Use This?

Imagine cloning a large repository with many `process.env.[var]` definitions, and it is difficult to go through all the files to find these variables, especially if they are not properly documented. This cli solves that problem, by finding them for you and allowing you to set their values synchronously in the command line.

### Installation

`$ npm install -g @ca1c/envcli`

### Usage

`$ envcli create [file or directory]`

Creates `.env` file for single javascript file or directory of javascript files:
 - `[filename]` is the javascript file you would like to get the env vars from

 *This will recursively search through all subdirectories and find all javascript files in subdirectories
