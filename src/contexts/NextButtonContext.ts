import { createContext, type Dispatch, type SetStateAction } from 'react';

export interface NextButtonControl {
    label: string;
    action: () => void;
    isDisabled: boolean;
}

export const defaultControl: NextButtonControl = {
    label: 'Continue to Next Step',
    action: () => { },
    isDisabled: false,
};
export interface NextButtonContextType {
    setButtonControl: Dispatch<SetStateAction<NextButtonControl>>;
    buttonControl: NextButtonControl;
}

export const NextButtonContext = createContext<NextButtonContextType | null>(null);
