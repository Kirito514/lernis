import { ethers } from 'ethers';

// Simple ERC-721 Contract ABI for NFT minting
export const SIMPLE_NFT_ABI = [
  // ERC-721 Standard functions
  "function name() public view returns (string)",
  "function symbol() public view returns (string)",
  "function totalSupply() public view returns (uint256)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "function approve(address to, uint256 tokenId) public",
  "function getApproved(uint256 tokenId) public view returns (address)",
  "function setApprovalForAll(address operator, bool approved) public",
  "function isApprovedForAll(address owner, address operator) public view returns (bool)",
  "function transferFrom(address from, address to, uint256 tokenId) public",
  "function safeTransferFrom(address from, address to, uint256 tokenId) public",
  "function safeTransferFrom(address from, address to, uint256 tokenId, bytes data) public",
  
  // Custom minting function
  "function mint(address to, string memory tokenURI) public returns (uint256)",
  "function mintCertificate(address to, string memory title, string memory course, string memory grade, string memory issuer) public returns (uint256)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
  "event CertificateMinted(address indexed to, uint256 indexed tokenId, string title, string course)"
];

// Contract bytecode for deployment (simplified)
export const SIMPLE_NFT_BYTECODE = "0x608060405234801561001057600080fd5b50600436106100365760003560e01c8063095ea7b31461003b57806318160ddd14610057575b600080fd5b610055600480360381019061005091906101a4565b610075565b005b61005f61008b565b60405161006c91906101e0565b60405180910390f35b61007d610091565b6100878282610099565b5050565b60025481565b60008054905090565b7f7d84a6263ae0d98d3329bd7b46bb4e8d6f98cd35a7adb45c274c8b7fd5ebd5e60001b6001600084815260200190815260200160002060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614610146576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161013d90610247565b60405180910390fd5b5050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006101798261014e565b9050919050565b6101898161016e565b811461019457600080fd5b50565b6000813590506101a681610180565b92915050565b600080604083850312156101c3576101c2610149565b5b60006101d185828601610197565b92505060206101e285828601610197565b9150509250929050565b600060208201905061020160008301846101b5565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061024f57607f821691505b60208210810361026257610261610208565b5b5091905056fea2646970667358221220";

// Deploy a simple NFT contract
export const deploySimpleNFTContract = async (signer: ethers.JsonRpcSigner) => {
  try {
    console.log('Deploying Simple NFT Contract...');
    
    const factory = new ethers.ContractFactory(SIMPLE_NFT_ABI, SIMPLE_NFT_BYTECODE, signer);
    
    // Deploy with constructor parameters
    const contract = await factory.deploy(
      "EduNFT Certificates", // name
      "EDUCERT", // symbol
      "https://api.edunft.com/metadata/" // baseURI
    );
    
    console.log('Contract deployment transaction:', contract.deploymentTransaction()?.hash);
    
    // Wait for deployment
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log('Contract deployed at:', contractAddress);
    
    return {
      contract,
      address: contractAddress,
      deploymentTx: contract.deploymentTransaction()?.hash
    };
  } catch (error) {
    console.error('Contract deployment failed:', error);
    throw error;
  }
};

// Mint NFT using deployed contract
export const mintNFT = async (
  contractAddress: string,
  signer: ethers.JsonRpcSigner,
  to: string,
  tokenURI: string
) => {
  try {
    const contract = new ethers.Contract(contractAddress, SIMPLE_NFT_ABI, signer);
    
    console.log('Minting NFT to:', to);
    console.log('Token URI:', tokenURI);
    
    const tx = await contract.mint(to, tokenURI);
    console.log('Mint transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('Mint transaction confirmed:', receipt);
    
    // Get token ID from event
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === 'Transfer' && parsed?.args.from === '0x0000000000000000000000000000000000000000';
      } catch {
        return false;
      }
    });
    
    let tokenId = 0;
    if (event) {
      const parsed = contract.interface.parseLog(event);
      tokenId = Number(parsed?.args.tokenId);
    }
    
    return {
      success: true,
      transactionHash: receipt.hash,
      tokenId: tokenId,
      contractAddress: contractAddress
    };
  } catch (error) {
    console.error('NFT minting failed:', error);
    throw error;
  }
};

// Check if address is a contract
export const isContract = async (provider: ethers.BrowserProvider, address: string): Promise<boolean> => {
  try {
    const code = await provider.getCode(address);
    return code !== '0x';
  } catch (error) {
    return false;
  }
};
