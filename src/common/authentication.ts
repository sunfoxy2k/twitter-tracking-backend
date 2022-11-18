import { verify } from 'jsonwebtoken'
// import { keys } from './jwks.json'
// import jwt_convert from 'jwk-to-pem'
const public_key_0 = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxT///+0eivCDyHYqBWXW\nHawDWyatHOLW8/O1VbfavjrwtwE87+Scb6k/jGKcsMOebcpfHAxxDThIsAwmDmLM\nj19lUvJDPxT+zPBDqPGbN5qX8mnb12/wnRUqfMDGMAlb/YhLgXKioyIBUR5G1J7j\nKHfRa06weLxjvQvvzBw67quljgFB7Y8jC0AjKGWdL6Yxsk3B4kEUlEys3IIm3EKi\ns2RoFf0FCklxJwxZhpR1KB26bq7WWUAv6YcB6MT2J5MO4TFlNcprnWuhSSY/HBo9\nP4rNlLayHKnuae6O++QWQv9MBE1xY1LU2qGpd3CRKeQMboAI+ufn0RvE1l7qZfdw\neQIDAQAB\n-----END PUBLIC KEY-----'
const public_key_1 = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsmiSEgUAxucZs8tIaGHT\nSSqPy+3J7dOnQYhQGh9CH29m66EMwVdE/idEkR/inT6eMnuWqnLpLizdm6+vvM6T\nG/Jjz2fxwdzKTYCvuG8yiyDoxyK699iXODfZ9mX+HABvcgN5F/vlSTEru/J0+SWN\nnfFk1PNouhdMFeYmEHxEpOBFEFMJZb4/oFicNqVKhVsBoke9UAbsDoLw/btBLrkd\nArDy+6EfnLGaHR0AMJVqKRF8iscWtxAeHB2r7e1vfrbooxWlePhOb9vGutTpeNrz\nU29F+wbmrZP7Bow05/5v/g6ZiSdofk6yfU21ut6XhBbohcZHgnWCNR0AJsb0hRre\nGwIDAQAB\n-----END PUBLIC KEY-----'
export const verifyToken = (payload: any) => {
    // const public_key_0 = jwt_convert(keys[0])
    const decoded = verify(payload, public_key_0, { algorithms: ['RS256'] })
    return decoded
}