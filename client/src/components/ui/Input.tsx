import React, {InputHTMLAttributes} from 'react';
import styled from "styled-components";

type InputType = {
    label?: string
}

type InputPropsType = React.PropsWithChildren<InputType> & InputHTMLAttributes<HTMLInputElement>

const InputStyle = styled.input`

`

const Input: React.FC<InputPropsType> = (props) => {
    return (
        <InputStyle {...props}/>
    );
};

export default Input;
