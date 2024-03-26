import { createMock } from 'ts-auto-mock';
import { On, method } from 'ts-auto-mock/extension';
import rpcFileHash from "./rpc-file-hash";
import { describe, expect, beforeEach, test } from '@jest/globals';

describe('rpcFileHash', function() {
    let mockCtx: any, mockLogger: any, mockNk: any, mockLoggerError: any, mockNkStorageRead: any, mockNkStorageWrite: any, mockStorageWriteAck: any;

    beforeEach(function () {
        // Create mock objects to pass to the RPC.
        mockCtx = createMock<nkruntime.Context>({ userId: 'mock-user' });
        mockLogger = createMock<nkruntime.Logger>();
        mockNk = createMock<nkruntime.Nakama>();
        mockStorageWriteAck = createMock<nkruntime.StorageWriteAck>();

        // Configure specific mock functions to use Jest spies via jest-ts-auto-mock
        mockLoggerError = On(mockLogger).get(method(function (mock) {
            return mock.error;
        }))
        mockNkStorageRead = On(mockNk).get(method(function (mock) {
            return mock.storageRead;
        }));
        mockNkStorageWrite = On(mockNk).get(method(function (mock) {
            return mock.storageWrite;
        }));
    });

    test('returns failure if payload is null', function() {
        const payload = null;
        const result = rpcFileHash(mockCtx, mockLogger, mockNk, payload);

        expect(mockLoggerError).toBeCalled();
        expect(mockNkStorageWrite).toBeCalledTimes(0);
    });
});