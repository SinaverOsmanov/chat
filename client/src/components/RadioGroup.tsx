import React, { useState } from 'react'
import { FlexColumn, FlexRow } from '../styled'
import Radio from './ui/Radio'

export const RadioGroup = ({ selectedSender, setSelectedSender }: any) => {
	const person = 'кто-то'

	function onChangeValue(event: React.ChangeEvent<HTMLInputElement>) {
		const name: string = event.target.name
		if (name) {
			setSelectedSender(name === 'name' ? person : 'Аноним')
		}
	}

	return (
		<FlexRow>
			<FlexColumn>
				<label htmlFor="name">
					<Radio
						id="name"
						name="name"
						checked={selectedSender === person}
						onChange={onChangeValue}
					/>
					{person}
				</label>
			</FlexColumn>
			<FlexColumn>
				<label htmlFor="anonymous">
					<Radio
						id="anonymous"
						name="anonymous"
						checked={selectedSender === 'Anonym'}
						onChange={onChangeValue}
					/>
					Аноним
				</label>
			</FlexColumn>
		</FlexRow>
	)
}
