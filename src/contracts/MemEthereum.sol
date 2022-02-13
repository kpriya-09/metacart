pragma solidity ^0.5.0;

import "./ERC721Full.sol";

contract MemEthereum {  
  uint public imageCount = 0;
  mapping(uint => Image) public images;

  struct Image {
    uint id;
    string hash;
    address payable author;
  }

  event ImageCreated(
    uint id,
    string hash,
    address payable author
  );

//   constructor() ERC721Full("MemEthereum", "IMAGES") public {
//   }
    constructor() public{}

  function uploadImage(string memory _imgHash) public {
    require(bytes(_imgHash).length > 0);
    require(msg.sender!=address(0));
    imageCount ++;

    images[imageCount] = Image(imageCount, _imgHash, msg.sender);
    //_mint(msg.sender,imageCount);
    emit ImageCreated(imageCount, _imgHash, msg.sender);
  }

//   function mint(string memory _hash) public {
//     require(!_imageExists[_hash]);
//     uint _id = images.push(_);
//     _mint(msg.sender, _id);
//     _colorExists[_color] = true;
//   }
    function tipImageOwner(uint _id) public payable {
        //future use
        }
}