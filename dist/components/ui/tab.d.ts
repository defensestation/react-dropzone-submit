interface TabProps {
    text: string;
    selected: boolean;
    setSelected: (text: string) => void;
    discount?: boolean;
}
export declare const Tab: ({ text, selected, setSelected, discount, }: TabProps) => import("react/jsx-runtime").JSX.Element;
export {};
