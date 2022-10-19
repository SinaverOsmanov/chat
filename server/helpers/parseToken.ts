export function parseToken(token: string): string | null {
    if (token) {
        return token.replace('Authorization=', '')
    }
    return null
}
