import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
// import fetch from "node-fetch";
import * as dotenv from "dotenv";

dotenv.config();

const erc1155Abi = [
  {
    name: "uri",
    type: "function",
    inputs: [{ name: "_id", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
] as const;

async function main() {
  // Public Client 설정 (읽기 전용)
  const client = createPublicClient({
    chain: sepolia,
    transport: http(`https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`),
  });

  const erc1155Address = "0xaCDE966981B6811f96c9C85C66059C5d1dE4f4f5" as `0x${string}`; // 배포된 ERC-1155 주소로 교체
  const tokenId = BigInt(1); // 조회할 토큰 ID

  // 1. uri 함수 호출
  const uri = await client.readContract({
    address: erc1155Address,
    abi: erc1155Abi,
    functionName: "uri",
    args: [tokenId],
  });
  console.log("Token URI:", uri);

  // 2. 메타데이터 JSON 가져오기
  const resolvedUri = uri.replace("{id}", tokenId.toString()); // {id} 치환
  console.log("Resolved URI:", resolvedUri);

  try {
    const response = await fetch(resolvedUri);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const metadata = await response.json();
    console.log("Metadata:", JSON.stringify(metadata, null, 2));
  } catch (error) {
    console.error("Error fetching metadata:", error);
  }
}

main().catch((error) => {
  console.error("Error in script:", error);
  process.exitCode = 1;
});