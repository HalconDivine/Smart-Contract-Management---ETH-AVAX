pragma solidity ^0.8.0;

contract Assessment {
    address public owner;
    mapping (address => uint256) public balances;
    mapping (string => uint256) public bagPrices;

    constructor() public {
        owner = msg.sender;
        balances[msg.sender] = 0;

        // Set bag prices
        bagPrices["Chanel"] = 20000;
        bagPrices["Dior"] = 50000;
        bagPrices["LV"] = 60000;
        bagPrices["Zara"] = 30000;
        bagPrices["Hermes"] = 25000;
        bagPrices["Fendi"] = 15000;
    }

    function deposit(uint256 amount) public {
        require(msg.sender != address(0), "Invalid sender");
        require(amount > 0, "Invalid amount");

        balances[msg.sender] += amount;
    }

    function withdraw(uint256 amount) public {
        require(msg.sender != address(0), "Invalid sender");
        require(amount > 0, "Invalid amount");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        balances[msg.sender] -= amount;
    }

    function buyBag(string memory bagName) public {
        require(msg.sender != address(0), "Invalid sender");

        uint256 price = bagPrices[bagName];
        require(price > 0, "Invalid bag name");

        require(balances[msg.sender] >= price, "Insufficient balance");

        // Withdraw the amount
        withdraw(price);

        // Set the notification
        emit BagBought(msg.sender, bagName, price);
    }

    event BagBought(address buyer, string bagName, uint256 price);
}