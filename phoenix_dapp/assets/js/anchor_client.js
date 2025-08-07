import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {Buffer} from 'buffer';

const PROGRAM_ID = new PublicKey('J4aBD9W7P8sij5dLP4KZLiJZrCZXoRFazpGaVhcZuwZZ');


const initializeConfig = async () => {
    const connection = new Connection('https://api.devnet.solana.com');
    const response = await window.solana.connect();
    const admin = response.publicKey;
    
    // Instruction discriminator (sha256 hash of "global:initialize_config")
    const discriminator = Buffer.from([
        208,
        127,
        21,
        1,
        194,
        190,
        196,
        70
    ]);
    
    const seed = 12345;
    const fee = 100;
    const basisPoints = 500;
    const mint = new PublicKey('So11111111111111111111111111111111111111112');
    const whitelistMint2 = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
    
    // Derive config PDA: [b"config", admin.key(), seed.to_le_bytes()]
    const [config] = PublicKey.findProgramAddressSync(
        [
            Buffer.from('config'),
            admin.toBuffer(),
            Buffer.from(new BigUint64Array([BigInt(seed)]).buffer)
        ],
        PROGRAM_ID
    );
    
    // Derive vault (associated token account)
    const vault = await getAssociatedTokenAddress(mint, config, true);
    
    // Serialize instruction data
    const data = Buffer.alloc(8 + 8 + 2 + 2 + 64);
    let offset = 0;
    
    discriminator.copy(data, offset); offset += 8;
    data.writeBigUInt64LE(BigInt(seed), offset); offset += 8;
    data.writeUInt16LE(fee, offset); offset += 2;
    data.writeUInt16LE(basisPoints, offset); offset += 2;
    mint.toBuffer().copy(data, offset); offset += 32;
    whitelistMint2.toBuffer().copy(data, offset);
    
    const instruction = new TransactionInstruction({
        keys: [
            { pubkey: admin, isSigner: true, isWritable: true },
            { pubkey: config, isSigner: false, isWritable: true },
            { pubkey: mint, isSigner: false, isWritable: false },
            { pubkey: vault, isSigner: false, isWritable: true },
            { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: new PublicKey('11111111111111111111111111111111'), isSigner: false, isWritable: false }
        ],
        programId: PROGRAM_ID,
        data
    });
    
    const { blockhash } = await connection.getLatestBlockhash();
    const transaction = new Transaction({ feePayer: admin, recentBlockhash: blockhash }).add(instruction);
    const signed = await window.solana.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());
    
    console.log('SUCCESS:', signature);
    return signature;
};

export {initializeConfig};


