// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract NftGatedAirdrop {
    address public tokenAddress;
    address constant NftAddress = 0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D;
    bytes32 public merkleRoot;

    mapping(address => bool) hasClaimed;

    constructor(address _tokenAddress, bytes32 _merkleRoot) {
        tokenAddress = _tokenAddress;
        merkleRoot = _merkleRoot;
    }

    //Claim Airdrop only when they NFT.
    function claimAirdrop(
        // address _address
        bytes32[] calldata _merkleProof,
        // uint256 _tokenId,
        uint256 _amount
    ) external {
        require(msg.sender != address(0), "Zero address detected.");
        require(!hasClaimed[msg.sender], "Airdrop claimed already.");
        // Check that the user owns a BAYC NFT

        bytes32 leaf = keccak256(
            bytes.concat(keccak256(abi.encode(msg.sender, _amount)))
        );

        require(
            MerkleProof.verify(_merkleProof, merkleRoot, leaf),
            "Invalid Merkle proof."
        );

        require(
            checkForNft(NftAddress, msg.sender),
            "You don't have the BAYC NFT"
        );

        require(
            IERC20(tokenAddress).transfer(msg.sender, _amount),
            "Token transfer failed."
        );

        hasClaimed[msg.sender] = true;
    }

    function checkForNft(
        address _NFTContractAddress,
        address user
    ) public view returns (bool) {
        return IERC721(_NFTContractAddress).balanceOf(user) > 0;
    }
}
