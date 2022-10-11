export function generateJWT() {

    const ObjectId = (m = Math, d = Date, h = 16, s = (s:any) => m.floor(s).toString(h)) =>
        s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h))

    return {
        role: "User",
        userName: 'User'+Date.now(),
        userId: ObjectId(),
        email: "some"+Date.now()+"@email.com",
        iat: Date.now()
    }
}