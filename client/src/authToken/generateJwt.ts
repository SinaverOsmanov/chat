export function generateJWT({userName, isModerator}:{userName: string, isModerator: boolean}) {


    if(isModerator) {

        const moderatorData = {
            role: "Moderator",
            userName: "admin",
            userId: "6325d80fe06688d15a620dbf",
            email: "someAdmin@email.com",
            iat: 1663602541,
            isModerator: true
        }

        return moderatorData
    }

    const ObjectId = (m = Math, d = Date, h = 16, s = (s:any) => m.floor(s).toString(h)) =>
        s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h))

    return {
        role: "User",
        userName: userName + Date.now(),
        userId: ObjectId(),
        email: "some"+Date.now()+"@email.com",
        iat: Date.now()
    }
}