import { expect } from "chai";
import { ethers } from "hardhat";
import { ethers as e } from "ethers";
import { GameNFT } from "../typechain-types";

describe("GameNFT", function () {
  let owner: e.Signer;
  let player: e.Signer;
  let gameNFT: GameNFT;

  beforeEach(async function () {
    [owner, player] = await ethers.getSigners();

    const GameNFT = await ethers.getContractFactory("GameNFT");
    gameNFT = (await GameNFT.deploy(await owner.getAddress())) as GameNFT;
    await gameNFT.waitForDeployment();
  });

  it("should have the correct owner", async function () {
    const contractOwner = await gameNFT.owner();
    expect(contractOwner).to.equal(await owner.getAddress());
  });

  it("should mint an NFT with correct attributes", async function () {
    const tokenURI =
      "ipfs://bafybeig5o6to2vhx3qbkrhc43m76gnm42rdlrewoho6obngmu6e5qj5i3q";
    const strength = 10;
    const agility = 15;
    const intelligence = 20;

    const tx = await gameNFT.mintNFT(
      await player.getAddress(),
      tokenURI,
      strength,
      agility,
      intelligence
    );
    await tx.wait();

    const tokenId = await gameNFT._tokenIds();
    const attributes = await gameNFT.nftAttributes(tokenId);
    const experience = await gameNFT.nftExperience(tokenId);

    expect(attributes.strength).to.equal(strength);
    expect(attributes.agility).to.equal(agility);
    expect(attributes.intelligence).to.equal(intelligence);
    expect(experience).to.equal(0);
  });

  it("should upgrade an NFT's attributes", async function () {
    const tokenURI =
      "ipfs://bafybeig5o6to2vhx3qbkrhc43m76gnm42rdlrewoho6obngmu6e5qj5i3q";
    const strength = 10;
    const agility = 15;
    const intelligence = 20;

    let tx = await gameNFT.mintNFT(
      await player.getAddress(),
      tokenURI,
      strength,
      agility,
      intelligence
    );
    await tx.wait();

    const tokenId = Number(await gameNFT._tokenIds());

    const upgradeStrength = 5;
    const upgradeAgility = 3;
    const upgradeIntelligence = 2;

    tx = await gameNFT
      .connect(player)
      .upgradeNFT(
        tokenId,
        upgradeStrength,
        upgradeAgility,
        upgradeIntelligence
      );
    await tx.wait();

    const attributes = await gameNFT.nftAttributes(tokenId);
    const experience = await gameNFT.nftExperience(tokenId);

    expect(attributes.strength).to.equal(strength + upgradeStrength);
    expect(attributes.agility).to.equal(agility + upgradeAgility);
    expect(attributes.intelligence).to.equal(
      intelligence + upgradeIntelligence
    );
    expect(experience).to.equal(
      upgradeStrength + upgradeAgility + upgradeIntelligence
    );
  });

  it("should correctly handle battles", async function () {
    const tokenURI =
      "ipfs://bafybeig5o6to2vhx3qbkrhc43m76gnm42rdlrewoho6obngmu6e5qj5i3q";
    const strength1 = 10;
    const agility1 = 15;
    const intelligence1 = 20;
    const strength2 = 5;
    const agility2 = 10;
    const intelligence2 = 15;

    let tx = await gameNFT.mintNFT(
      await player.getAddress(),
      tokenURI,
      strength1,
      agility1,
      intelligence1
    );
    await tx.wait();

    tx = await gameNFT.mintNFT(
      await player.getAddress(),
      tokenURI,
      strength2,
      agility2,
      intelligence2
    );
    await tx.wait();

    const tokenId2 = await gameNFT._tokenIds();
    const tokenId1 = tokenId2 - 1n;

    tx = await gameNFT.connect(player).battle(tokenId1, tokenId2);
    await tx.wait();

    const experience1 = await gameNFT.nftExperience(tokenId1);
    const experience2 = await gameNFT.nftExperience(tokenId2);

    if (
      strength1 + agility1 + intelligence1 >
      strength2 + agility2 + intelligence2
    ) {
      expect(experience1).to.equal(1);
      expect(experience2).to.equal(0);
    } else {
      expect(experience1).to.equal(0);
      expect(experience2).to.equal(1);
    }
  });
});
