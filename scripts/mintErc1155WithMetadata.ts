import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";

dotenv.config();

const erc1155Abi = [
  {
    name: "mint",
    type: "function",
    inputs: [
      { name: "account", type: "address" },
      { name: "id", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "uri", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "uri",
    type: "function",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
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

  const erc1155Address = "0xec75d416a3F1791b34dA3f8E907571c4E402F655" as `0x${string}`; // 배포된 ERC-1155 주소로 교체
  const tokenId = BigInt(1); // 민팅할 토큰 ID
  const amount = BigInt(100); // 민팅할 수량
  const tokenURI = "https://moonhee0507.github.io/nft-metadata/erc1155/1.json"; // 메타데이터 URI

  // 민팅 및 메타데이터 설정
  const { request } = await client.simulateContract({
    address: erc1155Address,
    abi: erc1155Abi,
    functionName: "mint",
    args: [account.address, tokenId, amount, tokenURI],
  });

  const txHash = await client.writeContract(request);
  console.log("Minting transaction sent! Hash:", txHash);

  const receipt = await client.waitForTransactionReceipt({ hash: txHash });
  console.log("ERC-1155 minted with metadata! Receipt:", receipt);

  // 설정된 URI 확인
  const uri = await client.readContract({
    address: erc1155Address,
    abi: erc1155Abi,
    functionName: "uri",
    args: [tokenId],
  });
  console.log("Token URI set to:", uri);
}

main().catch((error) => {
  console.error("Error minting ERC-1155 with metadata:", error);
  process.exitCode = 1;
});