// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameNFT is ERC721URIStorage, Ownable {
    uint256 public _tokenIds;

    struct Attributes {
        uint256 strength;
        uint256 agility;
        uint256 intelligence;
    }

    mapping(uint256 => Attributes) public nftAttributes;
    mapping(uint256 => uint256) public nftExperience;

    constructor(
        address _initialOwner
    ) ERC721("GameNFT", "GNFT") Ownable(_initialOwner) {}

    function mintNFT(
        address recipient,
        string memory tokenURI,
        uint256 strength,
        uint256 agility,
        uint256 intelligence
    ) external onlyOwner returns (uint256) {
        _tokenIds++;
        uint256 newItemId = _tokenIds;
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        nftAttributes[newItemId] = Attributes(strength, agility, intelligence);
        nftExperience[newItemId] = 0;
        return newItemId;
    }

    function upgradeNFT(
        uint256 tokenId,
        uint256 strength,
        uint256 agility,
        uint256 intelligence
    ) external {
        require(
            ownerOf(tokenId) == msg.sender,
            "Only the owner can upgrade the NFT"
        );
        nftAttributes[tokenId].strength += strength;
        nftAttributes[tokenId].agility += agility;
        nftAttributes[tokenId].intelligence += intelligence;
        nftExperience[tokenId] += (strength + agility + intelligence);
    }

    function battle(uint256 tokenId1, uint256 tokenId2) external {
        require(
            ownerOf(tokenId1) == msg.sender,
            "Only the owner can battle with the NFT"
        );
        require(
            ownerOf(tokenId2) == msg.sender,
            "Only the owner can battle with the NFT"
        );
        uint256 power1 = nftAttributes[tokenId1].strength +
            nftAttributes[tokenId1].agility +
            nftAttributes[tokenId1].intelligence;
        uint256 power2 = nftAttributes[tokenId2].strength +
            nftAttributes[tokenId2].agility +
            nftAttributes[tokenId2].intelligence;
        if (power1 > power2) {
            nftExperience[tokenId1] += 1;
        } else {
            nftExperience[tokenId2] += 1;
        }
    }
}
