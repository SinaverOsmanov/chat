import {generateJWT} from "./generateJwt";

export const moderatorToken =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiTW9kZXJhdG9yIiwidXNlck5hbWUiOiJVc2VyMSIsInVzZXJJZCI6IjYzMjVkODBmZTA2Njg4ZDE1YTYyMGRiZiIsImVtYWlsIjoic29tZUBlbWFpbC5jb20iLCJpYXQiOjE2NjM2MDI1NDEsImlzTW9kZXJhdG9yIjp0cnVlfQ.Z1KlQlpSoG9TIEhFfZlzd1QirHjaPvWGRphtyCC4D3A'
export const userToken =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiVXNlciIsInVzZXJOYW1lIjoiVXNlcjIiLCJ1c2VySWQiOiI2MzI1ZDgwZmUwNjY4OGQxNWE2MjBkYmQiLCJlbWFpbCI6InNvbWUyQGVtYWlsLmNvbSIsImlhdCI6MTY2MzYwMjU0MiwiaXNNb2RlcmF0b3IiOmZhbHNlfQ.IJBFqxkph2Ed_PvVzRwfmhUOI9XhAMEp8GTH6UceTqA'

export const user2Token =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiVXNlciIsInVzZXJOYW1lIjoiVXNlcjMiLCJ1c2VySWQiOiI2MzI1ZDgwZmUwNjY4OGQxNWE2MjBkYmEiLCJlbWFpbCI6InNvbWUzQGVtYWlsLmNvbSIsImlhdCI6MTY2MzYwMjU0MSwiaXNNb2RlcmF0b3IiOmZhbHNlfQ.rsJilzFvk1xeWYy1ClcGCwkP21Bw4R4l3vi6qTsFPiw'

import { HmacSHA256, enc } from 'crypto-js'

export default {moderator:moderatorToken, user:userToken, user2: user2Token}

// https://stackoverflow.com/questions/67432096/generating-jwt-tokens
export async function makeJwt(userName: string, isModerator: boolean) {
	// // The header typically consists of two parts:
	// // the type of the token, which is JWT, and the signing algorithm being used,
	// // such as HMAC SHA256 or RSA.
	const header = {
		alg: 'HS256',
		typ: 'JWT',
	}

	const encodedHeaders = enc.Base64url.stringify(
		enc.Utf8.parse(JSON.stringify(header))
	)

	// The second part of the token is the payload, which contains the claims.
	// Claims are statements about an entity (typically, the user) and
	// additional data. There are three types of claims:
	// registered, public, and private claims.

	const claims = generateJWT({userName, isModerator})


	const encodedPlayload = enc.Base64url.stringify(
		enc.Utf8.parse(JSON.stringify(claims))
	)

	// create the signature part you have to take the encoded header,
	// the encoded payload, a secret, the algorithm specified in the header,
	// and sign that.
	// const signature = await HMACSHA256(
	//  	`${encodedHeaders}.${encodedPlayload}`,
	//  	'secret-token-user-key'
	//  )

	const signature = HmacSHA256(
		`${encodedHeaders}.${encodedPlayload}`,
		'secret-token-user-key'
	)

	const encodedSignature = enc.Base64url.stringify(signature)

	const jwt = `${encodedHeaders}.${encodedPlayload}.${encodedSignature}`

	return jwt
}
