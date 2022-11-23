import { optionsToken } from 'authToken/tokens'
import React, { useState } from 'react'
import './App.css'
import { Chat } from './components/Chat/Chat'
import { FlexColumn, FlexRow } from './helpers/layoutStyle'
import Select from './components/ui/Select/Select'
import { Button } from './components/ui/Button/Button'

function App() {
    const [userNameValue, setUserNameValue] = useState(optionsToken[1].title)
    const [userJwtValue, setUserJwtValue] = useState(optionsToken[1].value)
    const [isModeratorValue, setIsModeratorValue] = useState(false)

    const [userName, setUserName] = useState(userNameValue)
    const [isModerator, setIsModerator] = useState(isModeratorValue)
    const [jwt, setJwt] = useState<string | undefined>(userJwtValue)

    function selectedToken(token: string) {
        if (token === optionsToken[1].value) {
            setUserNameValue('Пользователь 1')
            setIsModeratorValue(false)
        } else if (token === optionsToken[2].value) {
            setUserNameValue('Пользователь 2')
            setIsModeratorValue(false)
        } else {
            setUserNameValue('Модератор')
            setIsModeratorValue(true)
        }

        setUserJwtValue(token)
    }

    // useEffect(() => {
    // 	makeJwt(userName, isModerator).then(jwt => setJwt(jwt))
    // }, [userName, isModerator])

    return (
        <div className="App">
            <FlexRow style={{ marginBottom: 10 }}>
                <div>username: {userName}</div>
            </FlexRow>
            <FlexRow align="bottom" style={{ marginBottom: 10 }}>
                <FlexColumn>
                    <FlexRow style={{ marginBottom: 10 }}>
                        <div>new username:</div>
                    </FlexRow>
                    <FlexRow>
                        <Select
                            defaultValue={optionsToken[1].value}
                            onChange={selectedToken}
                            options={optionsToken}
                        />
                    </FlexRow>
                </FlexColumn>
                <FlexColumn offset={1}>
                    <Button
                        onClick={() => {
                            setUserName(userNameValue)
                            setJwt(userJwtValue)
                            setIsModerator(isModeratorValue)
                        }}
                    >
                        set user
                    </Button>
                </FlexColumn>
            </FlexRow>

            {/*<input*/}
            {/*	value={userNameValue}*/}
            {/*	onChange={e => setUserNameValue(e.target.value)}*/}
            {/*></input>*/}

            {jwt && (
                <Chat jwt={jwt} isModerator={isModerator} userName={userName} />
            )}
        </div>
    )
}

export default App
