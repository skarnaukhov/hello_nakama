interface FileHashRequest {
    type?: string,
    version?: string,
    hash?: string
}

interface FileHashResponse {
    type: string,
    version: string,
    hash: string,
    content: string
}