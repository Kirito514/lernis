// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

/**
 * @title EduNFT
 * @dev Educational Certificate NFT Contract
 * @notice This contract allows verified organizations to mint educational certificates as NFTs
 */
contract EduNFT is ERC721, ERC721URIStorage, Ownable, AccessControl {
    using Counters for Counters.Counter;

    // Roles
    bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');
    bytes32 public constant ADMIN_ROLE = keccak256('ADMIN_ROLE');

    // State variables
    Counters.Counter private _tokenIdCounter;
    mapping(uint256 => uint256) public orgIdByToken;
    mapping(address => bool) public verifiedOrganizations;

    // Events
    event CertificateMinted(
        uint256 indexed tokenId,
        address indexed to,
        string ipfsURI,
        uint256 orgId,
        address indexed minter
    );
    event OrganizationVerified(address indexed org, bool verified);
    event MinterRoleGranted(address indexed account, address indexed admin);

    // Errors
    error OnlyVerifiedOrganizations();
    error InvalidTokenId();
    error OrganizationAlreadyVerified();
    error OrganizationNotVerified();

    constructor(
        address initialOwner
    ) ERC721('EduNFT', 'EDU') Ownable(initialOwner) {
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(ADMIN_ROLE, initialOwner);
        _grantRole(MINTER_ROLE, initialOwner);
    }

    /**
     * @dev Mint a new educational certificate NFT
     * @param to The address to mint the NFT to
     * @param ipfsURI The IPFS URI containing the certificate metadata
     * @param orgId The organization ID that issued the certificate
     */
    function mintCertificate(
        address to,
        string memory ipfsURI,
        uint256 orgId
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        if (!verifiedOrganizations[msg.sender]) {
            revert OnlyVerifiedOrganizations();
        }

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, ipfsURI);
        orgIdByToken[tokenId] = orgId;

        emit CertificateMinted(tokenId, to, ipfsURI, orgId, msg.sender);

        return tokenId;
    }

    /**
     * @dev Verify an organization to allow them to mint certificates
     * @param org The organization address to verify
     */
    function verifyOrganization(address org) external onlyRole(ADMIN_ROLE) {
        if (verifiedOrganizations[org]) {
            revert OrganizationAlreadyVerified();
        }
        verifiedOrganizations[org] = true;
        _grantRole(MINTER_ROLE, org);
        emit OrganizationVerified(org, true);
        emit MinterRoleGranted(org, msg.sender);
    }

    /**
     * @dev Revoke organization verification
     * @param org The organization address to revoke
     */
    function revokeOrganization(address org) external onlyRole(ADMIN_ROLE) {
        if (!verifiedOrganizations[org]) {
            revert OrganizationNotVerified();
        }
        verifiedOrganizations[org] = false;
        _revokeRole(MINTER_ROLE, org);
        emit OrganizationVerified(org, false);
    }

    /**
     * @dev Get the organization ID for a specific token
     * @param tokenId The token ID to query
     * @return The organization ID that issued the certificate
     */
    function getOrgIdByToken(uint256 tokenId) external view returns (uint256) {
        if (!_exists(tokenId)) {
            revert InvalidTokenId();
        }
        return orgIdByToken[tokenId];
    }

    /**
     * @dev Check if an organization is verified
     * @param org The organization address to check
     * @return True if the organization is verified
     */
    function isOrganizationVerified(address org) external view returns (bool) {
        return verifiedOrganizations[org];
    }

    /**
     * @dev Get the total number of tokens minted
     * @return The current token count
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    // Override required functions
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
