import * as fs from "fs";
import { WriteFileOptions, Stats } from "fs";
import * as path from "path";
import * as os from "os";

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

export type TextWriteFileOptions = WriteFileOptions & {
    eol: string;
};

/**
 * Writes the text file at the given location with the provided contents
 * - will create any required supporting folders
 * @param at
 * @param contents
 * @param options
 */
export function writeTextFile(
    at: string,
    contents: string | string[],
    options?: TextWriteFileOptions
): Promise<void> {
    if (Array.isArray(contents)) {
        contents = contents.join(options?.eol || "\n");
    }
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
    if (os.platform() !== "win32" && parts.length > 1) {
        if (parts[0] === "") {
            // we were given an absolute path, starting at /
            // -> need to remove the leading empty part &
            //    prepend / onto the new leading part
            parts.splice(0, 1);
            parts[0] = `/${ parts[0] }`;
        }
    }
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
export function stat(at: string): Promise<Stats | null> {
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

export enum FsEntities {
    files = 1,
    folders = 2,
    all = 3
}

export type ErrorHandler = (e: NodeJS.ErrnoException) => Promise<void> | void;

export interface LsOptions {
    /**
     * flag: return results as full absolute paths
     * - set to false or omit to get paths relative
     *   to the starting point of ls
     */
    fullPaths?: boolean;
    recurse?: boolean;
    /**
     * optional entity type filter (defaults to return files and folders)
     */
    entities?: FsEntities;
    /**
     * RegEx to match any part of the full path for each entry that is
     * found whilst traversing the filesystem
     */
    match?: RegExp,
    /**
     * optional callback: if this is provided, you may suppress errors
     * whilst reading the filesystem, or re-throw them to stop traversal
     */
    onError?: ErrorHandler;
}

export async function ls(
    at: string,
    opts?: LsOptions
): Promise<string[]> {
    const entities = opts?.entities ?? FsEntities.all;
    at = path.resolve(at);

    const tester = async (fullPath: string) => {
        let accepted = true;
        if (entities !== FsEntities.all) {
            const isMatch = entities === FsEntities.files
                ? fileExists : folderExists;
            accepted = accepted && await isMatch(fullPath)
        }
        if (!!opts?.match) {
            const re = opts.match as RegExp;
            accepted = accepted && !!fullPath.match(re)
        }
        return accepted;
    };

    const result = await lsInternal(
        at,
        !!opts?.recurse,
        tester,
        opts?.onError
    );
    return opts?.fullPaths
        ? result
        : result.map(r => path.relative(at, r));
}

type PathTester = (at: string) => Promise<boolean>;

function lsInternal(
    at: string,
    recurse: boolean,
    tester: PathTester,
    onError?: ErrorHandler
): Promise<string[]> {
    return new Promise(async (resolve, reject) => {
        fs.readdir(at, async (err, data: string[]) => {
            if (err) {
                if (!onError) {
                    return reject(err);
                }
                try {
                    await onError(err);
                    return resolve([]);
                } catch (e) {
                    return reject(e);
                }
            }
            const result: string[] = [];
            for (const p of data) {
                const fullPath = prependAt(p);
                if (await tester(fullPath)) {
                    result.push(fullPath);
                }
                // even if tester fails, recurs on demand because test may
                // specifically knock out only stuff in the middle
                if (recurse && await folderExists(fullPath)) {
                    const subs = await lsInternal(fullPath, true, tester, onError);
                    result.push.apply(result, subs);
                }
            }
            resolve(result);
        });
    });

    function prependAt(s: string): string {
        return path.join(at, s);
    }
}

const
    rmRetries = 50,
    rmRetryBackoff = 100; // gives up to 5 seconds, with 100ms backoff

export async function rm(at: string): Promise<void> {
    if (await fileExists(at)) {
        return retry(() => unlink(at), rmRetries, rmRetryBackoff);
    }
    if (await folderExists(at)) {
        return deltree(at);
    }
}

async function deltree(at: string): Promise<void> {
    const contents = await ls(at, { recurse: true });
    contents.sort().reverse();
    for (const p of contents) {
        const fullPath = path.join(at, p);
        if (await folderExists(fullPath)) {
            await rmdir(fullPath);
        } else {
            await rm(fullPath);
        }
    }
    await rmdir(at);
}

export async function rename(
    at: string,
    to: string,
    force?: boolean
): Promise<void> {
    if (at === to) {
        return;
    }
    if (await exists(to)) {
        if (force) {
            await rm(to);
        } else {
            throw new Error(`target '${ to }' already exists: specify force: true to overwrite`);
        }
    }
    return retry(() =>
            new Promise((resolve, reject) => {
                fs.rename(at, to, err => {
                    if (isENOENT(err)) {
                        return reject(new AbortRetriesError(
                            err.message,
                            err
                        ));
                    }
                    return err
                        ? reject(err)
                        : resolve();
                });
            }),
        10,
        500
    );
}

export async function copyFile(
    src: string,
    target: string,
    options?: CopyFileOptions
): Promise<void> {
    options = options ?? CopyFileOptions.errorOnExisting;
    if (!(await fileExists(src))) {
        throw new Error(`file not found at '${ src }'`);
    }
    if (options !== CopyFileOptions.overwriteExisting &&
        await fileExists(target)) {
        throw new Error(`target already exists at '${ target }'`);
    }
    return new Promise((resolve, reject) => {
        fs.copyFile(src, target, err => {
            return err
                ? reject(err)
                : resolve();
        });
    });
}

export function findHomeFolder(): string {
    const
        environmentVariable = os.platform() === "win32"
            ? "USERPROFILE"
            : "HOME",
        result = process.env[environmentVariable];
    if (!result) {
        throw new Error(`Unable to determine user home folder (searched environment variable: ${environmentVariable}`);
    }
    return result;
}

export function resolveHomePath(relative: string): string {
    const home = findHomeFolder();
    return path.join(home, relative);
}

export enum CopyFileOptions {
    errorOnExisting,
    overwriteExisting
}

class AbortRetriesError extends Error {
    error: Error;

    constructor(
        message: string,
        error: Error
    ) {
        super(message);
        this.error = error;
    }
}

type AsyncAction = () => Promise<void>;

async function retry(
    action: AsyncAction,
    attempts: number,
    backoffMs: number) {
    for (let i = 0; i < attempts; i++) {
        try {
            await action();
            return;
        } catch (e) {
            if (e instanceof AbortRetriesError) {
                throw e.error;
            }
            console.error(e);
            if (i === attempts - 1) {
                throw e;
            }
            await sleep(backoffMs);
        }
    }
}

function sleep(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

function unlink(at: string): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.unlink(at, err => {
            if (isENOENT(err)) {
                resolve();
            }
            return err ? reject(err) : resolve();
        });
    });
}

export function rmdir(at: string): Promise<void> {
    return retry(() => rmdirInternal(at), rmRetries, rmRetryBackoff);
}

function isENOENT(err: NodeJS.ErrnoException | null): err is NodeJS.ErrnoException {
    return !!err && err.code === "ENOENT";
}

function rmdirInternal(at: string): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.rmdir(at, err => {
            if (isENOENT(err)) {
                resolve();
            }
            return err ? reject(err) : resolve();
        });
    });
}
