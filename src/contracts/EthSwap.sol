pragma solidity ^0.5.0;

import "./Token.sol";

contract EthSwap {    
    string public name = "EtherSwap Exchange";
    MMDToken public token;
    uint public rate = 100; 

    event TokenPurchased(
        address account,
        address token,
        uint amount,
        uint rate
    );

    event TokenSold(
        address account,
        address token,
        uint amount,
        uint rate
    );

    constructor(MMDToken _token) public {
        token = _token;
    }

    function buyTokens() public payable{
        //Redemption rate = # of tokens they receive for 1 ether
        //Calculate the number of tokens to buy
        uint tokenAmount = msg.value * rate;
        //require that ethswap has enough tokens
        require(token.balanceOf(address(this)) >= tokenAmount);
        
        //Transfer tokens to the user
        token.transfer(msg.sender, tokenAmount);

        // Emit an event
        emit TokenPurchased(msg.sender, address(token), tokenAmount, rate);
    }

    function sellTokens(uint _amount) public {

        //User cant sell more tokens than they have
        require(token.balanceOf(msg.sender) >= _amount);

        //Calculate the amount of Ether to redeem
        uint etherAmount = _amount / rate;

        //Require the EthSwap has enough Ether
        require(address(this).balance >= etherAmount);

        //Perform sale
        token.transferFrom(msg.sender, address(this), _amount);
        msg.sender.transfer(etherAmount);

        // Emit an event
        emit TokenSold(msg.sender, address(token), _amount, rate);
    
    }
}