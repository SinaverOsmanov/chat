import React from "react";
import {Tabs as TabsAntd, TabsProps} from 'antd'
import styled from "styled-components";

const TabsStyle = styled(TabsAntd)`
  
  .ant-tabs-nav {
    margin: 0;
  }
`


export const Tabs:React.FC<TabsProps> = ({defaultActiveKey, onChange, items})=> {
    return <TabsStyle defaultActiveKey={defaultActiveKey} onChange={onChange} items={items}/>
}