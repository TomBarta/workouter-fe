import { Step, Block } from "./types";

export const generateId = () => Math.random().toString(36).substring(2, 11);

export const createDefaultStep = (): Step => ({
    id: generateId(),
    purpose: 'work',
    goalType: 'open'
});

export const createDefaultBlock = (): Block => ({
    id: generateId(),
    type: 'work',
    iterations: 1,
    steps: [createDefaultStep()]
});
