import { faker } from "@faker-js/faker";

export interface Dictionary<T> {
    [key: string]: T;
}

export function randomSentence(): string {
    const howManyWords = faker.number.int({ min: 5, max: 15 });
    const result = [] as string[];
    for (let i = 0; i < howManyWords; i++) {
        result.push(randomWord());
    }
    return result.join(" ");
}

const wordFunctions = Object.keys(faker.word).filter(n => typeof (faker.word as Dictionary<any>)[n] === "function");

export function randomWord() {
    const
        fn = randomElement(wordFunctions),
        word = faker.word as unknown as Dictionary<(() => string)>;
    return word[fn]();
}

export function randomElement<T>(arr: T[]): T {
    const idx = faker.number.int({ min: 0, max: arr.length - 1 });
    return arr[idx];
}
