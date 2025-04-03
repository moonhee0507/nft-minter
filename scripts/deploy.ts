import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getContractFactory } from "@nomicfoundation/hardhat-ethers/types"; // 타입 추가
import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.deploy();
  await myNFT.waitForDeployment();
  console.log("ERC-721 deployed to:", await myNFT.getAddress());

  // const MyMultiToken = await hre.ethers.getContractFactory("MyMultiToken");
  // const myMultiToken = await MyMultiToken.deploy();
  // await myMultiToken.waitForDeployment();
  // console.log("ERC-1155 deployed to:", await myMultiToken.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});