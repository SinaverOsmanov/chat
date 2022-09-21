import React, {SelectHTMLAttributes} from 'react';
import styled from "styled-components";

type SelectType = {
    options?: []
}

type SelectPropsType = React.PropsWithChildren<SelectType> & SelectHTMLAttributes<HTMLSelectElement>

const SelectStyle = styled.select`
  width: 100%;
`

const Select: React.FC<SelectPropsType> = ({children, ...rest}) => {
    return (
        <SelectStyle {...rest}>
            {children}
        </SelectStyle>
    );
};

export default Select;
