import { verify, decode, JwtPayload } from 'jsonwebtoken'
import { Jwt } from 'jsonwebtoken'
// import { keys } from './jwks.json'
import jwtConvert from 'jwk-to-pem'

const publicJwks = [
    {
        "alg": "RS256",
        "e": "AQAB",
        "kid": "DMo45kQPuH3AXC86psG3VK9ULjIR7T7KzA1j/Eb0Ims=",
        "kty": "RSA",
        "n": "xT___-0eivCDyHYqBWXWHawDWyatHOLW8_O1VbfavjrwtwE87-Scb6k_jGKcsMOebcpfHAxxDThIsAwmDmLMj19lUvJDPxT-zPBDqPGbN5qX8mnb12_wnRUqfMDGMAlb_YhLgXKioyIBUR5G1J7jKHfRa06weLxjvQvvzBw67quljgFB7Y8jC0AjKGWdL6Yxsk3B4kEUlEys3IIm3EKis2RoFf0FCklxJwxZhpR1KB26bq7WWUAv6YcB6MT2J5MO4TFlNcprnWuhSSY_HBo9P4rNlLayHKnuae6O--QWQv9MBE1xY1LU2qGpd3CRKeQMboAI-ufn0RvE1l7qZfdweQ",
        "use": "sig"
    },
    {
        "alg": "RS256",
        "e": "AQAB",
        "kid": "DKD+0kVmpIDILhW+kQv9clYkdzbNRcgpXeVj99ZvKcg=",
        "kty": "RSA",
        "n": "smiSEgUAxucZs8tIaGHTSSqPy-3J7dOnQYhQGh9CH29m66EMwVdE_idEkR_inT6eMnuWqnLpLizdm6-vvM6TG_Jjz2fxwdzKTYCvuG8yiyDoxyK699iXODfZ9mX-HABvcgN5F_vlSTEru_J0-SWNnfFk1PNouhdMFeYmEHxEpOBFEFMJZb4_oFicNqVKhVsBoke9UAbsDoLw_btBLrkdArDy-6EfnLGaHR0AMJVqKRF8iscWtxAeHB2r7e1vfrbooxWlePhOb9vGutTpeNrzU29F-wbmrZP7Bow05_5v_g6ZiSdofk6yfU21ut6XhBbohcZHgnWCNR0AJsb0hRreGw",
        "use": "sig"
    }
]
export const verifyToken = (payload: any) => {
    // const publicKey_0 = jwtConvert(keys[0])
    try {
        const decoded = decode(payload, { complete: true })
        const kid = decoded.header.kid
        const publicJwk = publicJwks.find(key => key.kid === kid)
        if (!publicJwk) {
            return null
        }
        const publicKey = jwtConvert(publicJwk)
        return verify(payload, publicKey) as JwtPayload
    } catch (error) {
        return null
    }
}

export const decodeToken = (payload: any) => {
    try {
        return decode(payload) as JwtPayload
    } catch (error) {
        return null
    }
}
