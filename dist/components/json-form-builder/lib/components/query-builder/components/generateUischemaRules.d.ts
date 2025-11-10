import { Rule } from '../types';
export declare const generateUischemaRules: (rules: Rule[]) => ({
    effect: "HIDE" | "SHOW" | "ENABLE" | "DISABLE";
    condition: {
        [x: string]: any;
        scope: any;
    };
} | {
    effect: "HIDE" | "SHOW" | "ENABLE" | "DISABLE";
    condition: {
        and: any;
    };
})[];
