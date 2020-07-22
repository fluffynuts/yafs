import * as fs from "fs";
import { WriteFileOptions, StatsBase } from "fs";
import * as path from "path";

const textOptions = { encoding: "utf8" as BufferEncoding };

interface ReadFileOptions {
    encoding: string | null | undefined | BufferEncoding;
    flags?: string;
}

/**
 * Reads the file at the provided location
 * @param at
 * @param opts
 */
export function readFile(at: string, opts?: ReadFileOptions): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        if (opts) {
            fs.readFile(at, opts as any, (err, data) => {
                return err ? reject(err) : resolve(data);
            });
        } else {
            fs.readFile(at, (err, data) => {
                return err ? reject(err) : resolve(data);
            });
        }
    })
}

/**
 *
 * Reads the text file at the given location with the provided contents
 * - will create any required supporting folders
 * @param at
 */
export function readTextFile(at: string): Promise<string> {
    return new Promise((resolve, reject) => {
        fs.readFile(at, textOptions, (err: NodeJS.ErrnoException | null, data: string) => {
            return err
                ? reject(err)
                : resolve(data);
        })
    });
}

/**
 * Writes the file at the given location with the provided contents
 * - will create any required supporting folders
 * @param at
 * @param contents
 * @param options
 */
export async function writeFile(
    at: string,
    contents: Buffer,
    options?: WriteFileOptions
): Promise<void> {
    await mkdir(path.dirname(at));
    return new Promise((resolve, reject) => {
        // all of options is supposed to be optional, but the typings demand
        // a concrete options -- future proof by taking different routes
        if (!options) {
            fs.writeFile(at, contents, err => {
                return err ? reject(err) : resolve();
            });
        } else {
            fs.writeFile(at, contents, options, err => {
                return err ? reject(err) : resolve();
            });
        }
    });
}

/**
 * Writes the text file at the given location with the provided contents
 * - will create any required supporting folders
 * @param at
 * @param contents
 * @param options
 */
export function writeTextFile(
    at: string,
    contents: string,
    options?: WriteFileOptions
): Promise<void> {
    return writeFile(at, Buffer.from(contents), options);
}

/**
 * Creates the required folder if it doesn't exist, including any
 * supporting folders. Does not error if the folder already exists.
 * @param at
 */
export async function mkdir(at: string): Promise<void> {
    const
        parts = at.split(/[\\|\/]/);
    for (let i = 0; i < parts.length; i++) {
        const current = path.join(...parts.slice(0, i + 1));
        if (await folderExists(current)) {
            continue;
        }

        await mkdirWithFs(current);
    }
}

function mkdirWithFs(at: string): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.mkdir(at, err => err ? reject(err) : resolve());
    });
}

/**
 * Tests if the given path is a folder
 * @param at
 */
export async function folderExists(at: string): Promise<boolean> {
    const st = await stat(at);
    return !!st && st.isDirectory();
}

/**
 * Tests if the given path is a file
 * @param at
 */
export async function fileExists(at: string): Promise<boolean> {
    const st = await stat(at);
    return !!st && st.isFile();
}

/**
 * Tests if the given path exists at all (could be a folder, file, FIFO, whatever)
 * @param at
 */
export async function exists(at: string): Promise<boolean> {
    const st = await stat(at);
    return !!st;
}

/**
 * Provides a safe, promise-enclosed wrapper around fs.stat
 * - you either get back a stats object or null, never an error
 * @param at
 */
export function stat(at: string): Promise<StatsBase<any> | null> {
    return new Promise((resolve) => {
        try {
            fs.stat(at, (err, st) => {
                resolve(err
                    ? null
                    : st
                );
            });
        } catch (e) {
            resolve(null);
        }
    });
}
