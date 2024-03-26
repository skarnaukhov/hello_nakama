import { createMock } from 'ts-auto-mock';
import { On, method } from 'ts-auto-mock/extension';
import rpcFileHash from "./rpc-file-hash";
import {describe, expect, beforeEach, test, jest} from '@jest/globals';
import 'jest';

describe('rpcFileHash', function() {
    let mockCtx: any, mockLogger: any, mockNk: any, mockLoggerError: any, mockNkFileRead: any, mockNkHash: any, mockNkStorageWrite: any, mockStorageWriteAck: any, payload: any;

    beforeEach(function () {
        // Create mock objects to pass to the RPC.
        payload = createMock<FileHashRequest>( {
            type: 'core',
            version: '1.0.0',
            hash: 'hash'
        });
        mockCtx = createMock<nkruntime.Context>({ userId: 'mock-user' });
        mockLogger = createMock<nkruntime.Logger>();
        mockNk = createMock<nkruntime.Nakama>();
        mockStorageWriteAck = createMock<nkruntime.StorageWriteAck>();

        // Configure specific mock functions to use Jest spies via jest-ts-auto-mock
        mockLoggerError = On(mockLogger).get(method(function (mock) {
            return mock.error;
        }))
        mockNkFileRead = On(mockNk).get(method(function (mock) {
            return mock.fileRead;
        }));
        mockNkHash = On(mockNk).get(method(function (mock) {
            return mock.sha256Hash;
        }));
        mockNkStorageWrite = On(mockNk).get(method(function (mock) {
            return mock.storageWrite;
        }));
    });

    test('returns failure if payload not valid', function() {
        let payload = "hello";
        const result = rpcFileHash(mockCtx, mockLogger, mockNk, payload);
        const resultPayload = JSON.parse(result);

        expect(mockLoggerError).toBeCalled();
        expect(mockNkStorageWrite).toBeCalledTimes(0);
        expect(resultPayload.error).toBe("Error parsing payload")
    });

    test('returns failure if user id is empty', function() {
        let payloadStr = JSON.stringify(payload);
        mockCtx = createMock<nkruntime.Context>({ userId: undefined });
        const result = rpcFileHash(mockCtx, mockLogger, mockNk, payloadStr);
        const resultPayload = JSON.parse(result);

        expect(resultPayload.error).toBe("No user ID in context")
    });

    test('returns failure if file doesn\'t exist', function() {
        (mockNkFileRead as jest.Mock).mockImplementation(() => {
            throw new Error("File not found");
        });
        let payloadStr = JSON.stringify(payload);
        const result = rpcFileHash(mockCtx, mockLogger, mockNk, payloadStr);
        const resultPayload = JSON.parse(result);

        expect(resultPayload.error).toBe("Error reading file")
    });

    test('file read happened properly', function() {
        let fileContent = "fileContent";
        (mockNkFileRead as jest.Mock).mockImplementation(() => {
            return fileContent;
        });
        (mockNkHash as jest.Mock).mockImplementation(() => {
            return payload.hash;
        });
        let payloadStr = JSON.stringify(payload);
        const result = rpcFileHash(mockCtx, mockLogger, mockNk, payloadStr);
        const resultPayload = JSON.parse(result);

        expect(resultPayload.type).toBe(payload.type);
        expect(resultPayload.version).toBe(payload.version);
        expect(resultPayload.hash).toBe(payload.hash);
        expect(resultPayload.content).toBe(fileContent);
    });

    test('save data executed', function() {
        let userId = 'userId';
        mockCtx = createMock<nkruntime.Context>({ userId: userId });
        let write: nkruntime.StorageWriteRequest = {
            collection: 'audit',
            key: 'file_hash_requests',
            value: payload,
            userId: userId
        }
        let payloadStr = JSON.stringify(payload);
        const result = rpcFileHash(mockCtx, mockLogger, mockNk, payloadStr);
        const resultPayload = JSON.parse(result);

        expect(mockNkStorageWrite).toBeCalledTimes(1);
        expect(mockNkStorageWrite).toBeCalledWith([write]);
    });

    test('if hash not equal return null content', function() {
        let fileContent = "fileContent";
        (mockNkFileRead as jest.Mock).mockImplementation(() => {
            return fileContent;
        });
        (mockNkHash as jest.Mock).mockImplementation(() => {
            return payload.hash + "1";
        });
        let payloadStr = JSON.stringify(payload);
        const result = rpcFileHash(mockCtx, mockLogger, mockNk, payloadStr);
        const resultPayload = JSON.parse(result);

        expect(resultPayload.type).toBe(payload.type);
        expect(resultPayload.version).toBe(payload.version);
        expect(resultPayload.hash).toBe(payload.hash);
        expect(resultPayload.content).toBeNull();
    });

    test('function works with empty values in payload', function() {
        let emptyPayload = createMock<FileHashRequest>( {
        });
        let fileContent = "fileContent";
        (mockNkFileRead as jest.Mock).mockImplementation(() => {
            return fileContent;
        });
        (mockNkHash as jest.Mock).mockImplementation(() => {
            return payload.hash + "1";
        });
        let payloadStr = JSON.stringify(emptyPayload);
        const result = rpcFileHash(mockCtx, mockLogger, mockNk, payloadStr);
        const resultPayload = JSON.parse(result);

        expect(resultPayload.type).toBe(payload.type);
        expect(resultPayload.version).toBe(payload.version);
        expect(resultPayload.hash).toBeUndefined();
        expect(resultPayload.content).toBeNull();
    });

});