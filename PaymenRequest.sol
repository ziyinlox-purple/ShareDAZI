// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";


contract TokenConverter {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
   

    AggregatorV3Interface internal priceFeedETH;
    AggregatorV3Interface internal priceFeedBTC;
    AggregatorV3Interface internal priceFeedDAI;
    AggregatorV3Interface internal priceFeedUSDC;

    constructor(
        address _priceFeedETH,
        address _priceFeedBTC,
        address _priceFeedDAI,
        address _priceFeedUSDC
    ) {
        priceFeedETH = AggregatorV3Interface(_priceFeedETH);
        priceFeedBTC = AggregatorV3Interface(_priceFeedBTC);
        priceFeedDAI = AggregatorV3Interface(_priceFeedDAI);
        priceFeedUSDC = AggregatorV3Interface(_priceFeedUSDC);
    }


    function getETHToUSDPrice() external view returns (int) {
        (, int price, , , ) = priceFeedETH.latestRoundData();
        return price;
    }

    function getBTCToUSDPrice() external view returns (int) {
        (, int price, , , ) = priceFeedBTC.latestRoundData();
        return price;
    }    
}

interface ITokenConverter {
    function getETHToUSDPrice() external view returns (int);
}

contract PaymentRequest {
    ITokenConverter public tokenConverter;

    constructor(address _tokenConverter) {
        tokenConverter = ITokenConverter(_tokenConverter);
        initiator = msg.sender;
    }

    // 函数中调用合约A的获取ETH到USD价格的函数
    function getETHToUSDPriceFromA() external view returns (int) {
        return tokenConverter.getETHToUSDPrice();
    }

    address[] public participantList;

    // Function to contribute and add participant's address to the list
    function contribute() external {
        // Assuming msg.sender is the participant's address
        address participant = msg.sender;

        // Add the participant's address to the list
        participantList.push(participant);

        // Your contribution logic here
        // ...
    }

    using SafeERC20 for IERC20;

    address public initiator;
    uint256 public totalAmount;
    uint256 public numberOfParticipants;
    mapping(address => uint256) public individualShare;
    mapping(address => bool) public participants;

    event PaymentCompleted(address indexed initiator, uint256 totalAmount, uint256 numberOfParticipants);
    event PaymentContribution(address indexed participant, uint256 amount);

    modifier onlyInitiator() {
        require(msg.sender == initiator, "Only the initiator can call this function");
        _;
    }



    function contribute(uint256 _amount) external {
        require(!participants[msg.sender], "You have already contributed");
        require(_amount > 0, "Invalid contribution amount");
        require(totalAmount >= _amount, "Not enough remaining amount");

        participants[msg.sender] = true;
        individualShare[msg.sender] = _amount;
        totalAmount -= _amount;
        numberOfParticipants++;

        emit PaymentContribution(msg.sender, _amount);
    }

    function completePayment() external onlyInitiator {
        require(totalAmount == 0, "Total amount is not fully contributed");

        emit PaymentCompleted(initiator, totalAmount, numberOfParticipants);
    }

    function transferFunds(address _recipient, uint256 _amount) internal {
        // 假设使用 ETH 进行转账
        payable(_recipient).transfer(_amount);
    }

    // Function to get participant's address at a given index
    function getParticipantAtIndex(uint256 index) external view returns (address) {
        require(index < participantList.length, "Index out of bounds");
        return participantList[index];
    }
}
