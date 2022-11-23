import React, {InputHTMLAttributes} from 'react';
import {InputProps} from 'antd'
import {Style} from "./style";

type InputPropsType = InputHTMLAttributes<HTMLInputElement> & InputProps

const Input = (props: InputPropsType) => {

    return (
        <Style {...props}/>
    );
};

export default React.memo(Input);
