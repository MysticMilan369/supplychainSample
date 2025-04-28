// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Enums.sol";

struct User {
    address wallet;
    string name;
    string place;
    Role role;
    UserStatus status;
}

struct Batch {
    string name;
    string description;
}

struct Product {
    string name;
    uint256 batchNo;
    Stage stage;
    string productType;
    string description;
    uint256 manufacturedDate;
    uint256 expiryDate;
    uint256 price;
}

struct TrackingProduct {
    address handlerWallet;
    uint256 entryTime;
    uint256 exitTime;
    uint productStage;
    Stage stage;
    string remark;
}

struct StageDetails {
    User user;
    Stage stage;
    uint256 stageCount;
    uint256 entryTime;
    uint256 exitTime;
    string remark;
}
