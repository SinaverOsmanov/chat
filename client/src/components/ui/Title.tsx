import React from 'react';
import styled from "styled-components";
import {Typography} from "antd";
import {TitleProps} from "antd/es/typography/Title";

const TitleStyle = styled(Typography.Title)`
  margin: 0;
`

export const Title: React.FC<TitleProps> = ({children, ...rest}) => {
    return (
        <TitleStyle {...rest}>
            {children}
        </TitleStyle>
    );
};