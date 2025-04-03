import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";

dotenv.config();

const erc721Abi = [
  {
    name: "mintNFT",
    type: "function",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "tokenURI", type: "string" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    name: "tokenURI",
    type: "function",
    inputs: [{ name: "tokenId", type: "uint256" }],
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

  const erc721Address = "0x7F7fAE85A7DAE33937cA50d533c73DDB72994EF5" as `0x${string}`; // 재배포된 주소로 교체
  const tokenURI = "https://moonhee0507.github.io/nft-metadata/2.json";

  // 민팅 및 메타데이터 설정
  const { request } = await client.simulateContract({
    address: erc721Address,
    abi: erc721Abi,
    functionName: "mintNFT",
    args: [account.address, tokenURI],
  });

  const txHash = await client.writeContract(request);
  console.log("Minting transaction sent! Hash:", txHash);

  const receipt = await client.waitForTransactionReceipt({ hash: txHash });
  console.log("NFT minted with metadata! Receipt:", receipt);

  // 민팅된 토큰 ID 확인 (receipt에서 이벤트 로그 파싱 가능, 여기서는 간단히 1 가정)
    const tokenId = BigInt(2); // 실제로는 이벤트 로그에서 추출 권장
//   const tokenId = await client.call({
//     to: erc721Address,
//     data: request.data, // 트랜잭션 데이터 재사용
//   }).then((result) => BigInt(result.data));
//   console.log("Minted token ID:", tokenId);

  const uri = await client.readContract({
    address: erc721Address,
    abi: erc721Abi,
    functionName: "tokenURI",
    args: [tokenId],
  });
  console.log("Token URI set to:", uri);
}

main().catch((error) => {
  console.error("Error minting with metadata:", error);
  process.exitCode = 1;
});