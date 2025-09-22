import { ethers } from 'hardhat';
import { Lernis } from '../typechain-types';

async function main() {
  console.log('Starting deployment...');

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);
  console.log('Account balance:', (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy Lernis contract
  const LernisFactory = await ethers.getContractFactory('Lernis');
  const eduNFT = await LernisFactory.deploy(deployer.address);
  await eduNFT.waitForDeployment();

  const contractAddress = await eduNFT.getAddress();
  console.log('Lernis deployed to:', contractAddress);

  // Verify the deployment
  const totalSupply = await eduNFT.totalSupply();
  console.log('Initial total supply:', totalSupply.toString());

  // Grant admin role to deployer (already done in constructor, but let's verify)
  const hasAdminRole = await eduNFT.hasRole(await eduNFT.ADMIN_ROLE(), deployer.address);
  console.log('Deployer has admin role:', hasAdminRole);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
  };

  console.log('\n=== Deployment Summary ===');
  console.log('Network:', deploymentInfo.network);
  console.log('Contract Address:', deploymentInfo.contractAddress);
  console.log('Deployer:', deploymentInfo.deployer);
  console.log('Block Number:', deploymentInfo.blockNumber);
  console.log('Timestamp:', deploymentInfo.timestamp);

  // Instructions for next steps
  console.log('\n=== Next Steps ===');
  console.log('1. Update CONTRACT_ADDRESS in your .env files');
  console.log('2. Verify the contract on Polygonscan (if on testnet):');
  console.log(`   npx hardhat verify --network ${hre.network.name} ${contractAddress} "${deployer.address}"`);
  console.log('3. Test the contract functionality');

  return deploymentInfo;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
