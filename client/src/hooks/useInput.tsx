import React, {useState} from 'react';

type InputType = {
    value:string,
    onChange(event: React.ChangeEvent<HTMLInputElement>):void,
    onReset():void
}

export const useInput = (initialValue:string):InputType => {
    const [value, setValue] = useState(initialValue);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    };

    const handleReset = () => setValue('')

    return {value, onChange:handleChange, onReset:handleReset}
};