import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import hre, { ethers } from "hardhat";
  const helpers = require("@nomicfoundation/hardhat-network-helpers");

  describe("NftGatedAirdrop", function(){

    async function deployGtkToken() {
        const [tokenOwner, addr1] = await ethers.getSigners();

        const gtkToken = await ethers.getContractFactory("GTK");
        const gtkTokenDeployed = await gtkToken.deploy();
        const gtkcontractAddr = await gtkTokenDeployed.getAddress();
        return { gtkcontractAddr, gtkTokenDeployed, tokenOwner };
    }

    async function deployAirdrop() {
        // Get the ContractFactory and Signers here.
        const [owner, addr1] = await ethers.getSigners();
        const airdropContract = await ethers.getContractFactory("Airdrop");
        const { gtkcontractAddr, gtkTokenDeployed, tokenOwner } = await loadFixture(deployGtkToken)
        const BAYC_ADDR = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D"; //NFT ADDR.
        const merkleRoot = "0xf1653093bc39530fa9a33483b084ba886e452209800e7231c8e16a4909e4c539";
        const addrWithNft = "0x27677a95F17dE170FD4cbac47712784Fa3Be4D02";
        const addrWithoutNft = "0x51816a1b29569fbB1a56825C375C254742a9c5e1"; //Addr without NFT,
        const merkleProof = ["0x9152e25333c8bf06a40469e24a6558f1de1d399e65d4b58fb2364eb27a5c4d40","0xd41b2560b2d3241cbee053e2cf34a92afa35638a8243cf815b53f430dd662604","0xe60074fff5169d08db90cfb7969e1a46ee8419f64523500128979e2ce14d66ed"
        ];
        const invalidMerkleProof = ["0x9152e25333c8bf06a40469e24a6558f1de1d399e65d4b58fb2364eb27a5c4d40","0xd41b2560b2d3241cbee053e2cf34a92afa35638a8243cf815b53f430dd662604","0xe60074fff5169d08db90cfb7969e1a46ee8419f64523500128979e2ce14d6600"
        ]; 
        
        const airdrop = await airdropContract.deploy(gtkcontractAddr, merkleRoot);
        
        //Impersonate Address with NFT
        await helpers.impersonateAccount(addrWithNft);
        const impersonatedSigner = await ethers.getSigner(addrWithNft);
        const BAYC_Contract = await ethers.getContractAt("IERC721", BAYC_ADDR, impersonatedSigner);

        await gtkTokenDeployed.transfer(airdrop, ethers.parseUnits("1000", 18));


        return { owner, addr1, airdrop, gtkcontractAddr, merkleRoot, addrWithNft, merkleProof, gtkTokenDeployed, BAYC_Contract, impersonatedSigner, addrWithoutNft, BAYC_ADDR, invalidMerkleProof }
    }

    describe('Claim Airdrop', () => {


        it("Should check if address did not participated in airdrop", async function(){
            const { owner, addr1, airdrop, gtkcontractAddr, merkleRoot, addrWithNft, merkleProof, gtkTokenDeployed, BAYC_Contract, impersonatedSigner, addrWithoutNft, BAYC_ADDR, invalidMerkleProof } = await loadFixture(deployAirdrop);
            const amt = ethers.parseUnits("10", 18);
            await expect(airdrop.connect(addr1).claimAirdrop(invalidMerkleProof, amt)).to.be.revertedWith("Invalid Merkle proof.");
        });

        it("Should check if address has BAYC NFT", async function(){
            const { owner, addr1, airdrop, gtkcontractAddr, merkleRoot, addrWithNft, merkleProof, gtkTokenDeployed, BAYC_Contract, impersonatedSigner, addrWithoutNft, BAYC_ADDR } = await loadFixture(deployAirdrop);
            const amt = ethers.parseUnits("10", 18);
            expect(await airdrop.connect(impersonatedSigner).checkForNft(BAYC_ADDR, impersonatedSigner)).to.equal(true);
        });

        it("Should check if address participated in airdrop", async function(){
            const { owner, addr1, airdrop, gtkcontractAddr, merkleRoot, addrWithNft, merkleProof, gtkTokenDeployed, BAYC_Contract, impersonatedSigner, addrWithoutNft } = await loadFixture(deployAirdrop);
            const amt = ethers.parseUnits("10", 18);
            await expect( airdrop.connect(impersonatedSigner).claimAirdrop(merkleProof, amt)).to.not.be.reverted;
        });

        it("Should check if address claimed airdrop successfully.", async function(){
            const { owner, addr1, airdrop, gtkcontractAddr, merkleRoot, addrWithNft, merkleProof, gtkTokenDeployed, BAYC_Contract, impersonatedSigner, addrWithoutNft } = await loadFixture(deployAirdrop);
            const BalBeforeClaim = await gtkTokenDeployed.balanceOf(impersonatedSigner);
            const amt = ethers.parseUnits("10", 18);
            await airdrop.connect(impersonatedSigner).claimAirdrop(merkleProof, amt)
            const BalAfterClaim = await gtkTokenDeployed.balanceOf(impersonatedSigner);
            expect(BalAfterClaim).to.be.gt(BalBeforeClaim);
          });

          it("Should not allow double claiming of reward.", async function(){
            const { owner, addr1, airdrop, gtkcontractAddr, merkleRoot, addrWithNft, merkleProof, gtkTokenDeployed, BAYC_Contract, impersonatedSigner, addrWithoutNft } = await loadFixture(deployAirdrop);            
            const amt = ethers.parseUnits("10", 18);
            await airdrop.connect(impersonatedSigner).claimAirdrop(merkleProof, amt)
           await expect(airdrop.connect(impersonatedSigner).claimAirdrop(merkleProof, amt)).to.be.revertedWith("NFT claimed already.");
            
          });


     })

    

  });
