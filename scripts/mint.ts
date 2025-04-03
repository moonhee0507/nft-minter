import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";

dotenv.config();

// ABI (간소화된 버전, 실제로는 컨트랙트 ABI 필요)
const erc721Abi = [
  {
    name: "mintNFT",
    type: "function",
    inputs: [{ name: "recipient", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
  },
] as const;

const erc1155Abi = [
  {
    name: "mint",
    type: "function",
    inputs: [
      { name: "account", type: "address" },
      { name: "id", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

async function main() {
  const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);
  const client = createWalletClient({
    account,
    chain: sepolia,
    transport: http(`https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`),
  }).extend(publicActions);

  const erc721Address = "0x7F7fAE85A7DAE33937cA50d533c73DDB72994EF5" as `0x${string}`;
  const erc1155Address = "0x6a405938e4DD7b09dC73a3Ea7459a7420BdEfA67" as `0x${string}`;

  // ERC-721 민팅
  const { request: mint721 } = await client.simulateContract({
    address: erc721Address,
    abi: erc721Abi,
    functionName: "mintNFT",
    args: [account.address],
  });
  const tx1 = await client.writeContract(mint721);
  await client.waitForTransactionReceipt({ hash: tx1 });
  console.log("ERC-721 minted! Tx:", tx1);

  // ERC-1155 민팅
  const { request: mint1155 } = await client.simulateContract({
    address: erc1155Address,
    abi: erc1155Abi,
    functionName: "mint",
    args: [account.address, BigInt(2), BigInt(5)], // ID 2로 5개
  });
  const tx2 = await client.writeContract(mint1155);
  await client.waitForTransactionReceipt({ hash: tx2 });
  console.log("ERC-1155 minted! Tx:", tx2);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});