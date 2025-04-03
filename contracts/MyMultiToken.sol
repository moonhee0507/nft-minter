// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; // 소유자 권한 관리

contract MyMultiToken is ERC1155, ERC1155URIStorage, Ownable {
    // 토큰별 발행량 추적을 위한 매핑
    mapping(uint256 => uint256) private _totalSupply;

    // 이벤트 정의: 민팅과 URI 설정 시 발생
    event TokenMinted(
        address indexed account,
        uint256 indexed id,
        uint256 amount
    );
    event URISet(uint256 indexed id, string uri);

    // 생성자: 기본 URI 설정 및 초기 소유자 지정
    constructor()
        ERC1155("https://moonhee0507.github.io/nft-metadata/erc1155/{id}.json")
    {}

    // 민팅 함수: 새로운 토큰 발행
    // acount: 토큰을 받을 주소
    // id: 토큰 ID
    // amount: 발행할 수량
    // uri: 메타데이터 URI (선택)
    function mint(
        address account,
        uint256 id,
        uint256 amount,
        string memory uri
    ) public onlyOwner {
        require(account != address(0), "Invalid recipient address"); // 수신자 주소 유효성 검사
        _mint(account, id, amount, ""); // 내부 민팅 함수 호출
        _totalSupply[id] += amount; // 총 발행량 업데이트

        if (bytes(uri).length > 0) {
            _setURI(id, uri); // URI가 제공되면 설정
            emit URISet(id, uri);
        }

        emit TokenMinted(account, id, amount); // 민팅 이벤트 발생
    }

    // 일괄 민팅 함수: 여러 토큰을 한 번에 발행
    // accounts: 수신자 주소 배열
    // ids: 토큰 ID 배열
    // amounts: 발행 수량 배열
    // uris: 메타데이터 URI 배열 (선택적)
    function mintBatch(
        address[] memory accounts,
        uint256[] memory ids,
        uint256[] memory amounts,
        string[] memory uris
    ) public onlyOwner {
        require(
            accounts.length == ids.length && ids.length == amounts.length,
            "Array lengths must match"
        );
        for (uint256 i = 0; i < ids.length; i++) {
            require(accounts[i] != address(0), "Invalid recipient address");
            _mint(accounts[i], ids[i], amounts[i], "");
            _totalSupply[ids[i]] += amounts[i];

            if (i < uris.length && bytes(uris[i]).length > 0) {
                _setURI(ids[i], uris[i]);
                emit URISet(ids[i], uris[i]);
            }

            emit TokenMinted(accounts[i], ids[i], amounts[i]);
        }
    }

    // 토큰별 총 발행량 조회
    function totalSupply(uint256 id) public view returns (uint256) {
        return _totalSupply[id];
    }

    // 메타데이터 URI 조회 (오버라이드)
    // ERC1155와 ERC1155URIStorage의 uri 함수 결합
    function uri(
        uint256 id
    ) public view override(ERC1155, ERC1155URIStorage) returns (string memory) {
        return super.uri(id); // ERC1155URIStorage의 구현 사용
    }

    // 토큰 소각 함수: 소유자가 토큰을 파괴
    function burn(address account, uint256 id, uint256 amount) public {
        require(
            msg.sender == account || isApprovedForAll(account, msg.sender),
            "Caller is not owner nor approved"
        );
        _burn(account, id, amount);
        _totalSupply[id] -= amount; // 총 발행량 감소
    }

    // 필수 오버라이드: ERC1155와 ERC1155URIStorage의 충돌 해결
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC1155) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
