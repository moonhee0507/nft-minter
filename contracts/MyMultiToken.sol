// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract MyMultiToken is ERC1155 {
    constructor() ERC1155("https://your-metadata-uri/{id}.json") {
        _mint(msg.sender, 1, 10, ""); // ID 1로 10개 민팅
    }

    function mint(address account, uint256 id, uint256 amount) public {
        _mint(account, id, amount, "");
    }
}
