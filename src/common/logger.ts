export const errorLogger = (functionName: string, error: Error) => {
    console.log('#'.repeat(50))
    console.log(`Error in ${functionName}: ${error}`)
    console.log('#'.repeat(50))
}

export const infoLogger = (functionName: string, info: string) => {
    console.log('='.repeat(50))
    console.log(`Info in ${functionName}: ${info}`)
    console.log('='.repeat(50))
}