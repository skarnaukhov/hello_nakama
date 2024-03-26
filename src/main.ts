import {rpcFileHash} from "./rpc-file-hash";

function InitModule(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, initializer: nkruntime.Initializer) {
    initializer.registerRpc("file_hash", rpcFileHash);
    logger.info('JavaScript logic loaded.');
}

// Reference InitModule to avoid it getting removed on build
!InitModule && InitModule.bind(null);