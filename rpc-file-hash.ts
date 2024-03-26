function rpcFileHash(context: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
    let request : FileHashRequest = {
        type: 'core',
        version: '1.0.0'
    }

    let response : FileHashResponse = <FileHashResponse> {
        type: request.type,
        version: request.version,
        content: null
    }

    if (!context.userId) {
        let errorMessage = "No user ID in context";
        logger.error(errorMessage);
        response.error = errorMessage;
        return JSON.stringify(response);
    }

    if (payload) {
        try {
            request = JSON.parse(payload);
            response.hash = request.hash;
            logger.info('Request: %q', request)
        } catch (error) {
            let errorMessage = "Error parsing payload";
            logger.error(errorMessage + '%q', error);
            response.error = errorMessage;
            return JSON.stringify(response);
        }
    } else {
        logger.info("No input payload. Processing with default values %q", request)
    }

    let write: nkruntime.StorageWriteRequest = {
        collection: 'audit',
        key: 'file_hash_requests',
        value: request,
        userId: context.userId,
    }

    try {
        nk.storageWrite([ write ])
    } catch (error) {
        let errorMessage = "storageWrite error";
        logger.error(errorMessage + '%q', error);
        response.error = errorMessage;
        return JSON.stringify(response);
    }

    let fileContent: string;
    let relativePath = '../'+request.type+'/'+request.version+'.json';
    try {
        fileContent = nk.fileRead(relativePath);
    } catch (error) {
        let errorMessage = "Error reading file";
        logger.error(errorMessage + '%q', error);
        response.error = errorMessage;
        return JSON.stringify(response);
    }

    try {
        let hash = nk.sha256Hash(fileContent);
        if (request.hash === hash) {
            response.content = fileContent;
        }
    } catch (error) {
        let errorMessage = "Error calculating hash for the file";
        logger.error(errorMessage + '%q', error);
        response.error = errorMessage;
        return JSON.stringify(response);
    }

    let result = JSON.stringify(response);
    logger.info('Response: %q', result);
    return result;
}

// export default rpcFileHash;
