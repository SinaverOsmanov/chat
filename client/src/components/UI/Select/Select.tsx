import React from 'react'
import { Select as SelectAntd, SelectProps } from 'antd'
import { Style } from './style'

type SelectItemType = { value: string; title: string }

type SelectType = {
    options: SelectItemType[]
    defaultOption: SelectItemType
}

type SelectPropsType = SelectType & SelectProps<any, any>

const Select: React.FC<SelectPropsType> = ({
    options,
    defaultOption,
    ...props
}) => {
    return (
        <Style>
            <SelectAntd {...props}>
                {options ? (
                    options.map(({ value, title }) => (
                        <SelectAntd.Option key={value} value={value}>
                            {title}
                        </SelectAntd.Option>
                    ))
                ) : (
                    <SelectAntd.Option value={defaultOption.value}>
                        {defaultOption.title}
                    </SelectAntd.Option>
                )}
            </SelectAntd>
        </Style>
    )
}

export default React.memo(Select)
