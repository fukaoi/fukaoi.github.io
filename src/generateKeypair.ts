import StellarBase from 'stellar-base';

export const generateKeypair = (seed: string) => {
  const hex = Buffer.from(seed, 'hex');
  const pair = StellarBase.Keypair.fromRawEd25519Seed(hex);
  return {
    pubkey: pair.publicKey(),
    secret: pair.secret()
  }
}
