
export type RequestPayload<T, U> = {
    promise: Promise<T>,
    data: U
}

export type ResponsePayload<T> = {
    data: T
}
