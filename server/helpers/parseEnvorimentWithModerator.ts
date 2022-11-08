export async function parseEnvorimentWithModerator(env:string | undefined): Promise<boolean> {
    if(env === undefined) return false
    return env === 'true'
}