import React, {InputHTMLAttributes} from 'react';
import styled from "styled-components";
import {Input as InputAntd, InputProps} from 'antd'

type InputPropsType = InputHTMLAttributes<HTMLInputElement> & InputProps

const InputStyle = styled(InputAntd)`
  height: 100%;
`

const Input = (props: InputPropsType) => {
    return (
        <InputStyle {...props}/>
    );
};

export default Input;
