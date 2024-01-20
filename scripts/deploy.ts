import { ethers } from "hardhat";

async function main() {
  const wakeMeCryptoInstance = await ethers.deployContract("WakeMeCrypto");
  await wakeMeCryptoInstance.waitForDeployment();
  return wakeMeCryptoInstance;
}

main()
  .then(async (lockInstance) => {
    console.log("Contract deployed to:", lockInstance.target);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
