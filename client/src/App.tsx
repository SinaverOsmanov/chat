import { makeJwt } from 'authToken/tokens'
import React, { useEffect, useState } from 'react'
import './App.css'
import { Chat } from './components/Chat/Chat'

function App() {
	const [userNameValue, setUserNameValue] = useState('User')
	const [isModeratorValue, setIsModeratorValue] = useState(false)

	const [userName, setUserName] = useState(userNameValue)
	const [isModerator, setIsModerator] = useState(isModeratorValue)
	const [jwt, setJwt] = useState<string | undefined>()

	useEffect(() => {
		makeJwt(userName, isModerator).then(jwt => setJwt(jwt))
	}, [userName, isModerator])

	return (
		<div className="App">
			<div>username: </div>
			<div>{userName}</div>
			<div>{isModerator ? 'moderator' : 'not moderator'}</div>
			<div>new username: </div>
			<input
				value={userNameValue}
				onChange={e => setUserNameValue(e.target.value)}
			></input>
			<label>
				is moderator:{' '}
				<input
					type="checkbox"
					checked={isModeratorValue}
					onChange={e => setIsModeratorValue(e.target.checked)}
				/>
			</label>

			<button
				onClick={() => {
					setUserName(userNameValue)
					setIsModerator(isModeratorValue)
				}}
			>
				set name
			</button>
			{jwt && <Chat jwt={jwt} isModerator={isModerator} />}
		</div>
	)
}

export default App
