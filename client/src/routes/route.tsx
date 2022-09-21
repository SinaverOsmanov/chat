import { createBrowserRouter, Link } from 'react-router-dom'
import App from '../App'
import React from 'react'

export const router = createBrowserRouter([
	{
		path: '/',
		element: (
			<ul>
				<li>
					<Link to="/1">To event 1</Link>
				</li>
				<li>
					<Link to="/2">To event 2</Link>
				</li>
			</ul>
		),
	},
	{
		path: '/:eventId',
		element: <App />,
	},
])
