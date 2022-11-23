import React from 'react';
import {Select as SelectAntd, SelectProps} from "antd";
import { Style } from './style';

type SelectType = {
    options: { value: string, title: string }[]
}

type SelectPropsType = SelectProps<any, any> & SelectType

const Select: React.FC<SelectPropsType> = ({options, ...props}) => {

    return (
        <Style>
            <SelectAntd {...props}>
                {options ? options.map(({value, title}) =>
                        <SelectAntd.Option key={value} value={value}>{title}</SelectAntd.Option>) :
                    <SelectAntd.Option value='time'>По времени</SelectAntd.Option>
                }
            </SelectAntd>
        </Style>

    );
};

export default React.memo(Select);
