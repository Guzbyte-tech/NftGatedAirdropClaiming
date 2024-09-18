import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import hre, { ethers } from "hardhat";

  describe("MerkleAirdrop", function(){
    
    let merkleRoot = "0xdd8b463cdc12388c8a93b3dd9ea70e9d121347210ca1f691f5a32e3b24f7a703";

    async function deployGtkToken() {
      // Get the ContractFactory and Signers here.
      const [owner, addr1] = await ethers.getSigners();
  
      // Deploy the ERC20 token
      const gtkToken = await ethers.getContractFactory("GTK");
      const gtkTokenDeployed = await gtkToken.deploy();
      const gtkcontractAddr = gtkTokenDeployed.getAddress();
      return { gtkcontractAddr, gtkTokenDeployed };
    }

    async function deployAirdrop() {
      // Get the ContractFactory and Signers here.
      const [owner, addr1] = await ethers.getSigners();
      const airdropContract = await ethers.getContractFactory("MerkleAirdrop");
      const {gtkcontractAddr, gtkTokenDeployed} = await deployGtkToken();
      const merkleTreeAirdrop = await airdropContract.deploy(gtkcontractAddr, merkleRoot);
      return { owner, addr1, merkleTreeAirdrop, gtkcontractAddr, merkleRoot, gtkTokenDeployed }
    }
    

    describe("Claim Airdrop", function(){
      it("Should check if address didn't participated in airdrop", async function(){
        let proof = ["0x81ddb8944bc5301d8d414f58ac4d74939d9608494a6e08b9dfb05cffc652900a","0xa8b1917ae6f19ba060838edf873a973f07e441530dadf027f0aa0d1026d05873","0x89b2c78d9f90a5ba1b0a1abd914ce4dc82ed99359ad86e2b50e64d0b9211ad36"];
        const amount = ethers.parseUnits("1", 18);
        // const proofHash = ethers.keccak256(ethers.toUtf8Bytes(proof));
        const { owner, addr1, merkleTreeAirdrop, gtkcontractAddr, merkleRoot } = await loadFixture(deployAirdrop);
        const amt = ethers.parseUnits("1", 18);
        const checkClaim = merkleTreeAirdrop.claimAirdrop(addr1, amt, proof);
        console.log(addr1.address);
        await expect(checkClaim).to.be.revertedWith("Invalid Merkle proof.");
      });

      it("Should check if address participated in airdrop", async function(){
        let proof = ["0x81ddb8944bc5301d8d414f58ac4d74939d9608494a6e08b9dfb05cffc652900a","0xa8b1917ae6f19ba060838edf873a973f07e441530dadf027f0aa0d1026d05873","0x89b2c78d9f90a5ba1b0a1abd914ce4dc82ed99359ad86e2b50e64d0b9211ad36"];
        const amount = ethers.parseUnits("1", 18);
        const { owner, addr1, merkleTreeAirdrop, gtkcontractAddr, merkleRoot, gtkTokenDeployed } = await loadFixture(deployAirdrop);
        const addr = "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB";
        const amt = ethers.parseUnits("1", 18);
        await gtkTokenDeployed.transfer(merkleTreeAirdrop.getAddress(), amt);
        await expect(merkleTreeAirdrop.claimAirdrop(addr, amt, proof)).to.not.be.reverted;
      });


      it("Should check if address claimed airdrop successfully.", async function(){
        let proof = ["0x81ddb8944bc5301d8d414f58ac4d74939d9608494a6e08b9dfb05cffc652900a","0xa8b1917ae6f19ba060838edf873a973f07e441530dadf027f0aa0d1026d05873","0x89b2c78d9f90a5ba1b0a1abd914ce4dc82ed99359ad86e2b50e64d0b9211ad36"];
        const amount = ethers.parseUnits("1", 18);
        const { owner, addr1, merkleTreeAirdrop, gtkcontractAddr, merkleRoot, gtkTokenDeployed } = await loadFixture(deployAirdrop);
        const addr = "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB";
        const amt = ethers.parseUnits("1", 18);
        await gtkTokenDeployed.transfer(merkleTreeAirdrop.getAddress(), amt);
        await expect(merkleTreeAirdrop.claimAirdrop(addr, amt, proof)).to.not.be.reverted;
        const claimStatus = await merkleTreeAirdrop.checkClaimStatus(addr);
        expect(claimStatus).to.be.equal(true);
      });

      it("Should check if user actually got airdrop reward.", async function(){
        let proof = ["0x81ddb8944bc5301d8d414f58ac4d74939d9608494a6e08b9dfb05cffc652900a","0xa8b1917ae6f19ba060838edf873a973f07e441530dadf027f0aa0d1026d05873","0x89b2c78d9f90a5ba1b0a1abd914ce4dc82ed99359ad86e2b50e64d0b9211ad36"];
        const amount = ethers.parseUnits("1", 18);
        const { owner, addr1, merkleTreeAirdrop, gtkcontractAddr, merkleRoot, gtkTokenDeployed } = await loadFixture(deployAirdrop);
        const addr = "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB";
        const amt = ethers.parseUnits("1", 18);
        await gtkTokenDeployed.transfer(merkleTreeAirdrop.getAddress(), amt);
        const userBalBefore = await gtkTokenDeployed.balanceOf(addr);


        await expect(merkleTreeAirdrop.claimAirdrop(addr, amt, proof)).to.not.be.reverted;
        const claimStatus = await merkleTreeAirdrop.checkClaimStatus(addr);
        expect(claimStatus).to.be.equal(true);

        const userBalAfter = await gtkTokenDeployed.balanceOf(addr);

        expect(userBalAfter).to.be.gt(userBalBefore);
      });



    });
  });