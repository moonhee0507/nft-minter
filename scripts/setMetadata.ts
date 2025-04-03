import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";

dotenv.config();

const erc721Abi = [
  {
    name: "mintNFT",
    type: "function",
    inputs: [{ name: "recipient", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    name: "setTokenURI",
    type: "function",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "tokenURI", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "ownerOf",
    type: "function",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
] as const;

async function main() {
  const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);
  const client = createWalletClient({
    account,
    chain: sepolia,
    transport: http(`https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`),
  }).extend(publicActions);

  const erc721Address = "0x8daeF5A67bfC6c44D37411470cE400a5d7745bA3" as `0x${string}`;
  const tokenId = BigInt(1);
  const tokenURI = "https://moonhee0507.github.io/nft-metadata/1.json";

  // 토큰 소유자 확인
  const owner = await client.readContract({
    address: erc721Address,
    abi: erc721Abi,
    functionName: "ownerOf",
    args: [tokenId],
  });
  console.log("Token owner:", owner);
  if (owner.toLowerCase() !== account.address.toLowerCase()) {
    throw new Error("You are not the owner of this token");
  }

  // 메타데이터 설정
  const { request } = await client.simulateContract({
    address: erc721Address,
    abi: erc721Abi,
    functionName: "setTokenURI",
    args: [tokenId, tokenURI],
  });

  const txHash = await client.writeContract(request);
  console.log("Transaction sent! Hash:", txHash);

  const receipt = await client.waitForTransactionReceipt({ hash: txHash });
  console.log("Metadata set successfully! Receipt:", receipt);
}

main().catch((error) => {
  console.error("Error setting metadata:", error);
  process.exitCode = 1;
});