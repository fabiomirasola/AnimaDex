// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract ImageNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenCounter;
    mapping(string => bool) private _imageHashes;

    event ImageMinted(address indexed owner, uint256 tokenId, string imageHash, string tokenURI);

    constructor(address initialOwner) ERC721("ImageNFT", "IMG") Ownable(initialOwner) {
        _tokenCounter = 0;
    }

    function safeMint(address to, string memory imageHash, string memory uri)
    public
    onlyOwner
    returns (uint256)
    {
        require(!_imageHashes[imageHash], "Image hash already exists");

        _imageHashes[imageHash] = true;
        uint256 tokenId = _tokenCounter;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        emit ImageMinted(to, tokenId, imageHash, uri);

        _tokenCounter++;
        return tokenId;
    }

    function verifyImage(string memory imageHash) public view returns (bool) {
        return _imageHashes[imageHash];
    }

    function tokenURI(uint256 tokenId)
    public
    view
    override(ERC721, ERC721URIStorage)
    returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
    public
    view
    override(ERC721, ERC721URIStorage)
    returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
