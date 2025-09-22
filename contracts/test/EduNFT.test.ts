import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Lernis } from '../typechain-types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

describe('Lernis', function () {
  let eduNFT: Lernis;
  let owner: HardhatEthersSigner;
  let university: HardhatEthersSigner;
  let student: HardhatEthersSigner;
  let admin: HardhatEthersSigner;

  const SAMPLE_IPFS_URI = 'ipfs://QmSampleHash123456789';
  const ORG_ID = 1;

  beforeEach(async function () {
    [owner, university, student, admin] = await ethers.getSigners();

    const LernisFactory = await ethers.getContractFactory('Lernis');
    eduNFT = await LernisFactory.deploy(owner.address);
    await eduNFT.waitForDeployment();
  });

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      expect(await eduNFT.owner()).to.equal(owner.address);
    });

    it('Should grant admin role to owner', async function () {
      const ADMIN_ROLE = await eduNFT.ADMIN_ROLE();
      expect(await eduNFT.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
    });

    it('Should grant minter role to owner', async function () {
      const MINTER_ROLE = await eduNFT.MINTER_ROLE();
      expect(await eduNFT.hasRole(MINTER_ROLE, owner.address)).to.be.true;
    });

    it('Should have initial total supply of 0', async function () {
      expect(await eduNFT.totalSupply()).to.equal(0);
    });
  });

  describe('Organization Verification', function () {
    it('Should allow admin to verify organization', async function () {
      await eduNFT.connect(owner).verifyOrganization(university.address);
      expect(await eduNFT.isOrganizationVerified(university.address)).to.be.true;
    });

    it('Should emit OrganizationVerified event', async function () {
      await expect(eduNFT.connect(owner).verifyOrganization(university.address))
        .to.emit(eduNFT, 'OrganizationVerified')
        .withArgs(university.address, true);
    });

    it('Should grant minter role to verified organization', async function () {
      await eduNFT.connect(owner).verifyOrganization(university.address);
      const MINTER_ROLE = await eduNFT.MINTER_ROLE();
      expect(await eduNFT.hasRole(MINTER_ROLE, university.address)).to.be.true;
    });

    it('Should not allow non-admin to verify organization', async function () {
      await expect(
        eduNFT.connect(university).verifyOrganization(university.address)
      ).to.be.revertedWithCustomError(eduNFT, 'AccessControlUnauthorizedAccount');
    });

    it('Should not allow verifying already verified organization', async function () {
      await eduNFT.connect(owner).verifyOrganization(university.address);
      await expect(
        eduNFT.connect(owner).verifyOrganization(university.address)
      ).to.be.revertedWithCustomError(eduNFT, 'OrganizationAlreadyVerified');
    });

    it('Should allow admin to revoke organization verification', async function () {
      await eduNFT.connect(owner).verifyOrganization(university.address);
      await eduNFT.connect(owner).revokeOrganization(university.address);
      expect(await eduNFT.isOrganizationVerified(university.address)).to.be.false;
    });
  });

  describe('Minting', function () {
    beforeEach(async function () {
      await eduNFT.connect(owner).verifyOrganization(university.address);
    });

    it('Should allow verified organization to mint certificate', async function () {
      await expect(
        eduNFT.connect(university).mintCertificate(student.address, SAMPLE_IPFS_URI, ORG_ID)
      ).to.emit(eduNFT, 'CertificateMinted')
        .withArgs(0, student.address, SAMPLE_IPFS_URI, ORG_ID, university.address);

      expect(await eduNFT.ownerOf(0)).to.equal(student.address);
      expect(await eduNFT.tokenURI(0)).to.equal(SAMPLE_IPFS_URI);
      expect(await eduNFT.getOrgIdByToken(0)).to.equal(ORG_ID);
      expect(await eduNFT.totalSupply()).to.equal(1);
    });

    it('Should not allow unverified organization to mint', async function () {
      await expect(
        eduNFT.connect(student).mintCertificate(student.address, SAMPLE_IPFS_URI, ORG_ID)
      ).to.be.revertedWithCustomError(eduNFT, 'OnlyVerifiedOrganizations');
    });

    it('Should not allow non-minter to mint', async function () {
      await expect(
        eduNFT.connect(admin).mintCertificate(student.address, SAMPLE_IPFS_URI, ORG_ID)
      ).to.be.revertedWithCustomError(eduNFT, 'AccessControlUnauthorizedAccount');
    });

    it('Should increment token ID for each mint', async function () {
      await eduNFT.connect(university).mintCertificate(student.address, SAMPLE_IPFS_URI, ORG_ID);
      await eduNFT.connect(university).mintCertificate(admin.address, SAMPLE_IPFS_URI, ORG_ID);

      expect(await eduNFT.ownerOf(0)).to.equal(student.address);
      expect(await eduNFT.ownerOf(1)).to.equal(admin.address);
      expect(await eduNFT.totalSupply()).to.equal(2);
    });
  });

  describe('Token URI and Metadata', function () {
    beforeEach(async function () {
      await eduNFT.connect(owner).verifyOrganization(university.address);
      await eduNFT.connect(university).mintCertificate(student.address, SAMPLE_IPFS_URI, ORG_ID);
    });

    it('Should return correct token URI', async function () {
      expect(await eduNFT.tokenURI(0)).to.equal(SAMPLE_IPFS_URI);
    });

    it('Should return correct organization ID for token', async function () {
      expect(await eduNFT.getOrgIdByToken(0)).to.equal(ORG_ID);
    });

    it('Should revert for non-existent token', async function () {
      await expect(eduNFT.getOrgIdByToken(999)).to.be.revertedWithCustomError(eduNFT, 'InvalidTokenId');
    });
  });

  describe('Access Control', function () {
    it('Should support ERC721 interface', async function () {
      const ERC721_INTERFACE_ID = '0x80ac58cd';
      expect(await eduNFT.supportsInterface(ERC721_INTERFACE_ID)).to.be.true;
    });

    it('Should support AccessControl interface', async function () {
      const ACCESS_CONTROL_INTERFACE_ID = '0x7965db0b';
      expect(await eduNFT.supportsInterface(ACCESS_CONTROL_INTERFACE_ID)).to.be.true;
    });

    it('Should support ERC721URIStorage interface', async function () {
      const ERC721_URI_STORAGE_INTERFACE_ID = '0x5b5e139f';
      expect(await eduNFT.supportsInterface(ERC721_URI_STORAGE_INTERFACE_ID)).to.be.true;
    });
  });
});
