import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";

dotenv.config();

const erc721Abi = [
  {
    name: "safeTransferFrom",
    type: "function",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
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

  const erc721Address = "0x7F7fAE85A7DAE33937cA50d533c73DDB72994EF5" as `0x${string}`; // 배포된 컨트랙트 주소로 교체
  const tokenId = BigInt(2); // 전송할 토큰 ID (예: 2)
  const toAddress = "0x553aa022a56eeb380a8835dd80ed507ffa23063b" as `0x${string}`; // 수신자 주소로 교체
  // 도현 주소 0x553aa022a56eeb380a8835dd80ed507ffa23063b
  // 형국 주소 0xca9d0aaf3de175d6b354e340651a6aeac8bf1e2a
  // 이슬 주소 0xA080f25C40D5AEc8139f4984EdbbD8b8429e5dEb

  // 소유자 확인
  const owner = await client.readContract({
    address: erc721Address,
    abi: erc721Abi,
    functionName: "ownerOf",
    args: [tokenId],
  });
  console.log("Current owner:", owner);
  if (owner.toLowerCase() !== account.address.toLowerCase()) {
    throw new Error("You are not the owner of this NFT");
  }

  // NFT 전송
  const { request } = await client.simulateContract({
    address: erc721Address,
    abi: erc721Abi,
    functionName: "safeTransferFrom",
    args: [account.address, toAddress, tokenId],
  });

  const txHash = await client.writeContract(request);
  console.log("Transfer transaction sent! Hash:", txHash);

  const receipt = await client.waitForTransactionReceipt({ hash: txHash });
  console.log("NFT transferred successfully! Receipt:", receipt);

  // 전송 후 소유자 확인
  const newOwner = await client.readContract({
    address: erc721Address,
    abi: erc721Abi,
    functionName: "ownerOf",
    args: [tokenId],
  });
  console.log("New owner:", newOwner);
}

main().catch((error) => {
  console.error("Error transferring NFT:", error);
  process.exitCode = 1;
});