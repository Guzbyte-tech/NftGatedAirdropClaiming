import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const NftGatedAirdropModule = buildModule("NftGatedAirdropModule", (m) => {

  const tokenAddress = "0x4b3c0dF2Fd4f32b38120dCCc89a4E96f2B215959";
  const merkleRoof = "0xf1653093bc39530fa9a33483b084ba886e452209800e7231c8e16a4909e4c539"
  const NftGatedAirdrop = m.contract("NftGatedAirdrop", [tokenAddress, merkleRoof], {
    
  });

  return { NftGatedAirdrop };
});

export default NftGatedAirdropModule;
