import { ethers } from 'ethers';

// ERC-721 ABI for NFT minting
export const ERC721_ABI = [
  "function mint(address to, string memory tokenURI) public returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function totalSupply() public view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

// Certificate NFT Contract ABI (custom)
export const CERTIFICATE_CONTRACT_ABI = [
  "function mintCertificate(address to, string memory tokenURI, string memory title, string memory course, string memory grade) public returns (uint256)",
  "function getCertificateDetails(uint256 tokenId) public view returns (string memory title, string memory course, string memory grade, string memory issuer, uint256 issueDate)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function balanceOf(address owner) public view returns (uint256)",
  "event CertificateMinted(address indexed to, uint256 indexed tokenId, string title, string course)"
];

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Ethereum Mainnet
  ethereum: {
    certificateContract: "0x0000000000000000000000000000000000000000", // Deploy your contract here
  },
  // Polygon
  polygon: {
    certificateContract: "0x0000000000000000000000000000000000000000", // Deploy your contract here
  },
  // BSC
  bsc: {
    certificateContract: "0x0000000000000000000000000000000000000000", // Deploy your contract here
  },
  // Testnets
  sepolia: {
    certificateContract: "0x0000000000000000000000000000000000000000", // Deploy your contract here
  },
  mumbai: {
    certificateContract: "0x0000000000000000000000000000000000000000", // Deploy your contract here
  }
};

// Get contract instance
export const getCertificateContract = (provider: ethers.BrowserProvider, contractAddress: string) => {
  return new ethers.Contract(contractAddress, CERTIFICATE_CONTRACT_ABI, provider);
};

// Get contract instance with signer
export const getCertificateContractWithSigner = (signer: ethers.JsonRpcSigner, contractAddress: string) => {
  return new ethers.Contract(contractAddress, CERTIFICATE_CONTRACT_ABI, signer);
};

// Check if contract is deployed
export const isContractDeployed = async (provider: ethers.BrowserProvider, address: string): Promise<boolean> => {
  try {
    const code = await provider.getCode(address);
    return code !== '0x';
  } catch (error) {
    return false;
  }
};

// Get network info
export const getNetworkInfo = async (provider: ethers.BrowserProvider) => {
  try {
    const network = await provider.getNetwork();
    return {
      chainId: network.chainId,
      name: network.name,
      isTestnet: network.chainId === 11155111n || network.chainId === 80001n || network.chainId === 97n, // Sepolia, Mumbai, BSC Testnet
    };
  } catch (error) {
    console.error('Error getting network info:', error);
    return null;
  }
};
