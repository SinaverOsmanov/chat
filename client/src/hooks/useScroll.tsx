import React, {useEffect, useState} from 'react';
import {MessageType} from "../../../common/dto/types";


export const useScroll = ({messages}: {messages: MessageType[] }) => {

    const [autoScroll, setAutoScroll] = useState(true)

    useEffect(()=>{
        const el:Element | null = document.querySelector('.scroll')
        const scroll: Element | null = document.querySelector('.scrollHeight')

        if(!!el && !!scroll) {
            el.scrollTo(0, scroll.scrollHeight)
        }

    },[messages.length])


    return {checked: autoScroll, onChange: setAutoScroll}
};


{/*<FlexRow justify='end' align='middle' style={{marginTop: 10}}>*/}
{/*    <FlexColumn>*/}
{/*        <Switch size="small" defaultChecked {...scroll} />*/}
{/*    </FlexColumn>*/}
{/*    <FlexColumn style={{marginLeft: 5}}>*/}
{/*        Auto scroll*/}
{/*    </FlexColumn>*/}
{/*</FlexRow>*/}