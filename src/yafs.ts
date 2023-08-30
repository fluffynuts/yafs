import * as fs from "fs";
import {WriteFileOptions, Stats} from "fs";
import * as path from "path";
import * as os from "os";

const textOptions = {encoding: "utf8" as BufferEncoding};

interface ReadFileOptions {
    encoding: string | null | BufferEncoding;
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

export async function readTextFileLines(at: string): Promise<string[]> {
    return splitIntoLines(
        await readTextFile(at)
    );
}

/**
 * Convenience: wrapper around fs.readFileSync with text file options
 * - you should only select this if you have no option to go async
 * @param at
 */
export function readTextFileSync(at: string): string {
    return readFileSync(at, textOptions).toString();
}

export function readFileSync(at: string, opts?: ReadFileOptions | null): Buffer {
    return fs.readFileSync(at, opts as any /* looks like something is up with typings, gonna force it */);
}

export function readTextFileLinesSync(at: string): string[] {
    return splitIntoLines(
        readTextFileSync(at)
    );
}

function splitIntoLines(str: string) {
    return str.indexOf("\r\n") > -1
        ? str.split(/\r\n/)
        : str.split(/\n/);
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
        if (options) {
            fs.writeFile(at, contents, options, err => {
                return err ? reject(err) : resolve();
            });
        } else {
            fs.writeFile(at, contents, err => {
                return err ? reject(err) : resolve();
            });
        }
    });
}

export function writeFileSync(
    at: string,
    contents: Buffer,
    options?: WriteFileOptions
) {
    mkdirSync(path.dirname(at));
    if (options) {
        fs.writeFileSync(at, contents, options);
    } else {
        fs.writeFileSync(at, contents);
    }
}
export function writeTextFileSync(
    at: string,
    contents: string | string[],
    options?: TextWriteFileOptions
): void {
    if (Array.isArray(contents)) {
        contents = contents.join(options?.eol || "\n");
    }
    writeFileSync(at, Buffer.from(contents), options);
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
            parts[0] = `/${parts[0]}`;
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

export function mkdirSync(at: string): void {
    const
        parts = at.split(/[\\|\/]/);
    if (os.platform() !== "win32" && parts.length > 1) {
        if (parts[0] === "") {
            // we were given an absolute path, starting at /
            // -> need to remove the leading empty part &
            //    prepend / onto the new leading part
            parts.splice(0, 1);
            parts[0] = `/${parts[0]}`;
        }
    }
    for (let i = 0; i < parts.length; i++) {
        const current = path.join(...parts.slice(0, i + 1));
        if (folderExistsSync(current)) {
            continue;
        }

        fs.mkdirSync(current);
    }
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
 * Tests if the given path is a folder
 * @param at
 */
export function folderExistsSync(at: string): boolean {
    try {
        const st = statSync(at);
        return !!st && st.isDirectory();
    } catch (e) {
        return false;
    }
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
 * Tests if the given path is a file
 * @param at
 */
export function fileExistsSync(at: string): boolean {
    try {
        const st = statSync(at);
        return !!st && st.isFile();
    } catch (e) {
        return false;
    }
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
 * Tests if the given path exists at all (could be a folder, file, FIFO, whatever)
 * @param at
 */
export function existsSync(at: string): boolean {
    try {
        return !!fs.statSync(at);
    } catch (e) {
        return false;
    }
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

/**
 * Provides a safe, synchronous wrapper around fs.statSync
 * - you either get back a stats object or null, never an error
 * @param at
 */
export function statSync(at: string): Stats | null {
    try {
        return fs.statSync(at)
    } catch (e) {
        return null;
    }
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
    match?: RegExp | RegExp[],

    /**
     * One or more regular expressions for folders to ignore. Ignored
     * paths will not be traversed during recursive operations.
     */
    doNotTraverse?: RegExp | RegExp[],
    /**
     * optional callback: if this is provided, you may suppress errors
     * whilst reading the filesystem, or re-throw them to stop traversal
     */
    onError?: ErrorHandler;

    /**
     * optional (defaults to false): typically if the target of an ls invocation
     * does not exist, you should get back an empty set of results (you could always
     * check on existence if you want to with folderExists), but if you really want
     * the ENOENT to bubble up, set this to true
     */
    throwOnMissingTarget?: boolean;

    /**
     * optional: when recurse is specified, traverse no deeper than
     * this into the filesystem
     */
    maxDepth?: number;
}

function resolveMatches(opts: LsOptions): RegExp[] {
    if (!opts.match) {
        return [];
    }
    return Array.isArray(opts.match)
        ? opts.match
        : [opts.match]
}

function makeSafeArray<T>(items: T[] | T | undefined): T[] {
    if (items === undefined) {
        return [];
    }
    return Array.isArray(items)
        ? items
        : [items];
}

const defaultLsOptions = {
    entities: FsEntities.all,
    throwOnMissingTarget: false
} as LsOptions;

export function lsSync(
    at: string,
    opts?: LsOptions
): string[] {
    const options = {...defaultLsOptions, ...opts};
    const ignoreMissing = !options.throwOnMissingTarget;
    if (ignoreMissing) {
        const atExists = existsSync(at);
        if (!atExists) {
            return [];
        }
    }

    const {entities} = options;
    at = path.resolve(at);
    const matches = resolveMatches(options);
    options.doNotTraverse = makeSafeArray(options.doNotTraverse);

    const tester = (fullPath: string) => {
        let accepted = true;
        if (entities !== FsEntities.all) {
            const isMatch = entities === FsEntities.files
                ? fileExistsSync : folderExistsSync;
            accepted = accepted && isMatch(fullPath)
        }
        const relativePath = path.relative(at, fullPath);
        let matched = !matches.length;
        for (const m of matches) {
            matched = matched || !!relativePath.match(m);
        }
        return accepted && matched;
    };

    const result = lsInternalSync(
        at,
        tester,
        options
    );
    return opts?.fullPaths
        ? result
        : result.map(r => path.relative(at, r));
}

export async function ls(
    at: string,
    opts?: LsOptions
): Promise<string[]> {
    const options = {...defaultLsOptions, ...opts};
    const ignoreMissing = !options.throwOnMissingTarget;
    if (ignoreMissing) {
        const atExists = await exists(at);
        if (!atExists) {
            // prefer empty results over explosions
            return [];
        }
    }

    const {entities} = options;

    at = path.resolve(at);

    const matches = resolveMatches(options);
    options.doNotTraverse = makeSafeArray(options.doNotTraverse);

    const tester = async (fullPath: string) => {
        let accepted = true;
        if (entities !== FsEntities.all) {
            const isMatch = entities === FsEntities.files
                ? fileExists : folderExists;
            accepted = accepted && await isMatch(fullPath)
        }
        const relativePath = path.relative(at, fullPath);
        let matched = !matches.length;
        for (const m of matches) {
            matched = matched || !!relativePath.match(m);
        }
        return accepted && matched;
    };

    const result = await lsInternal(
        at,
        tester,
        options
    );
    return opts?.fullPaths
        ? result
        : result.map(r => path.relative(at, r));
}

type PathTester = (at: string) => Promise<boolean>;
type SynchronousPathTester = (at: string) => boolean;

function lsInternalSync(
    at: string,
    tester: SynchronousPathTester,
    opts: LsOptions,
    currentDepth?: number
) {
    if (currentDepth === undefined) {
        currentDepth = 0;
    }
    currentDepth++;
    const {
        maxDepth,
        onError,
        recurse
    } = opts;
    if (maxDepth !== undefined && currentDepth > maxDepth) {
        return [];
    }

    try {
        const data = fs.readdirSync(at);
        const result: string[] = [];
        for (const p of data) {
            const fullPath = prependAt(p);
            if (tester(fullPath)) {
                result.push(fullPath);
            }
            if (!recurse) {
                continue;
            }
            // caller sanitises
            const noTraverse = opts.doNotTraverse as RegExp[];
            let skip = false;
            for (const re of noTraverse) {
                if (fullPath.match(re)) {
                    skip = true;
                    break;
                }
            }
            if (skip) {
                continue;
            }
            // even if tester fails, recurs on demand because test may
            // specifically knock out only stuff in the middle
            if (folderExistsSync(fullPath)) {
                const subs = lsInternalSync(
                    fullPath,
                    tester,
                    opts,
                    currentDepth
                );
                result.push.apply(result, subs);
            }
        }
        return result;
    } catch (e) {
        if (!onError) {
            throw e;
        }
        try {
            onError(e as Error);
            return [];
        } catch (e) {
            throw e;
        }
    }

    function prependAt(s: string): string {
        return path.join(at, s);
    }

}

function lsInternal(
    at: string,
    tester: PathTester,
    opts: LsOptions,
    currentDepth?: number
): Promise<string[]> {
    if (currentDepth === undefined) {
        currentDepth = 0;
    }
    currentDepth++;
    const {
        maxDepth,
        onError,
        recurse
    } = opts;
    if (maxDepth !== undefined && currentDepth > maxDepth) {
        return Promise.resolve([]);
    }
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
                if (!recurse) {
                    continue;
                }
                // caller sanitises
                const noTraverse = opts.doNotTraverse as RegExp[];
                let skip = false;
                for (const re of noTraverse) {
                    if (fullPath.match(re)) {
                        skip = true;
                        break;
                    }
                }
                if (skip) {
                    continue;
                }
                // even if tester fails, recurs on demand because test may
                // specifically knock out only stuff in the middle
                if (await folderExists(fullPath)) {
                    const subs = await lsInternal(
                        fullPath,
                        tester,
                        opts,
                        currentDepth
                    );
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

export function rmSync(at: string): void {
    if (!fs.rmSync) {
        throw new Error(`fs.rmSync is not supported in this version of node - at least v14 is required`);
    }
    if (folderExistsSync(at)) {
        rmdirSync(at);
        return;
    }
    if (!fileExistsSync(at)) {
        return;
    }
    fs.rmSync(at, {maxRetries: 50});
}

export function rmdirSync(at: string): void {
    if (!folderExistsSync(at)) {
        return;
    }
    fs.rmSync(
        at,
        {
            maxRetries: 50,
            recursive: true
        }
    );
}

async function deltree(at: string): Promise<void> {
    const contents = await ls(at, {recurse: true});
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
            throw new Error(`target '${to}' already exists: specify force: true to overwrite`);
        }
    }
    return retry(
        () =>
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
        throw new Error(`file not found at '${src}'`);
    }
    if (await folderExists(target)) {
        const baseName = path.basename(src);
        target = path.join(target, baseName);
    }
    if (options !== CopyFileOptions.overwriteExisting &&
        await fileExists(target)) {
        throw new Error(`target already exists at '${target}'`);
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

class AbortRetriesError
    extends Error {
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
