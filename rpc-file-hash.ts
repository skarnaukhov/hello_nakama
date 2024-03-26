function rpcFileHash(context: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
    if (!context.userId) {
        throw Error('No user ID in context');
    }

    let request : FileHashRequest = {
        type: 'core',
        version: '1.0.0'
    }
    if (payload) {
        try {
            request = JSON.parse(payload);
            logger.info('Request: %q', request)
        } catch (error) {
            logger.error('Error parsing json message: %q', error);
            throw error;
        }
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
        logger.error('storageWrite error: %q', error);
        throw error;
    }

    let fileContent: string;
    let relativePath = '../'+request.type+'/'+request.version+'.json';

    try {
        fileContent = nk.fileRead(relativePath);
    } catch (error) {
        logger.error('Error reading file %q', error);
        throw error;
    }

    let hash: string;
    try {
        hash = nk.sha256Hash(fileContent);
    } catch (error) {
        logger.error('Error calculating hash for the file %q', error);
        throw error;
    }

    let resp: FileHashResponse = <FileHashResponse> {
        type: request.type,
        version: request.version,
        hash: request.hash,
        content: request.hash === hash ? fileContent : null
    }

    let result = JSON.stringify(resp);
    logger.info('Response: %q', result);

    return result;
}

export default rpcFileHash;
