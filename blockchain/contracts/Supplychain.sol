// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Structs.sol";

contract SupplyChain {
    address public owner;
    uint256 private productCount;
    uint256 private batchCount;
    uint256 private userCount;

    //userId -> user struct
    mapping(address => User) public users;
    //batchId -> batch struct
    mapping(uint256 => Batch) public batches;
    //productId -> product struct
    mapping(uint256 => Product) private products;
    //productId -> product stageCount
    mapping(uint256 => uint256) private productStage;
    //productId -> product stageCount -> tracking product struct
    mapping(uint256 => mapping(uint256 => TrackingProduct)) private trackingProducts;
    //batchId -> array of productIds
    mapping(uint256 => uint256[]) private productsPerBatch;
    //useraddress -> array of productIds
    mapping(address => uint256[]) private userProducts;
    //useraddress -> productId -> already update or not
    mapping(address => mapping(uint256 => bool)) private userProductUpdate;
    //useraddress -> already exist or not
    mapping(address => bool) public userExist;
    //useraddress array
    address[] private userList;

    event UserAdded(
        address indexed wallet,
        string name,
        Role role,
        UserStatus status
    );
    event UserStatusUpdated(
        address indexed wallet,
        UserStatus oldStatus,
        UserStatus newStatus
    );
    event BatchCreated(uint256 indexed batchId, string name);
    event ProductAdded(uint256 indexed productId, string name, uint256 batchNo);
    event ProductStageUpdated(
        uint256 indexed productId,
        Stage newStage,
        string remarks
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action.");
        _;
    }

    modifier invalidProductCheck(uint256 _productId) {
        require(
            _productId > 0 && _productId <= productCount,
            "Invalid Product Id."
        );
        _;
    }

    modifier alreadyUpdateCheck(uint256 _productId) {
        require(
            !userProductUpdate[msg.sender][_productId],
            "You have already update this products."
        );
        _;
    }

    modifier userValidationCheck() {
        require(userExist[msg.sender], "User doesnot exist.");
        require(
            users[msg.sender].status == UserStatus.Active,
            "User is not on Active State."
        );
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function _isValidRoleForStage(address user, Stage _stage)
        internal
        view
        returns (bool)
    {
        Role userRole = users[user].role;
        if (_stage == Stage.Manufactured && userRole == Role.Manufacturer)
            return true;
        if (_stage == Stage.Warehoused && userRole == Role.Warehouse)
            return true;
        if (_stage == Stage.Dispatched && userRole == Role.Transporter)
            return true;
        if (_stage == Stage.Distributor && userRole == Role.Distributor)
            return true;
        if (_stage == Stage.Retailer && userRole == Role.Retailer) return true;
        if (_stage == Stage.Sold && userRole == Role.Retailer) return true;

        return false;
    }

    function registerUser(
        string memory _name,
        string memory _place,
        Role _role
    ) public {
        require(bytes(_name).length > 5, "Proper name is required.");
        require(!userExist[msg.sender], "User already exists.");
        require(msg.sender != owner, "Owner can not be registered as user.");

        users[msg.sender] = User(
            msg.sender,
            _name,
            _place,
            _role,
            UserStatus.Pending
        );
        userExist[msg.sender] = true;
        userList.push(msg.sender);
        userCount++;

        emit UserAdded(msg.sender, _name, _role, UserStatus.Pending);
    }

    function addUser(
        address _wallet,
        string memory _name,
        string memory _place,
        Role _role
    ) public onlyOwner {
        require(_wallet != address(0), "Invalid address.");
        require(bytes(_name).length > 5, "Proper name is required.");
        require(!userExist[_wallet], "User already exists.");
        require(_wallet != owner, "Owner can not be registered as user.");

        users[_wallet] = User(_wallet, _name, _place, _role, UserStatus.Active);
        userExist[_wallet] = true;
        userList.push(_wallet);
        userCount++;
        emit UserAdded(_wallet, _name, _role, UserStatus.Active);
    }

    function updateUserStatus(address _wallet, UserStatus newStatus)
        public
        onlyOwner
    {
        require(_wallet != address(0), "Invalid address.");

        UserStatus currentStatus = users[_wallet].status;
        require(
            currentStatus != newStatus,
            "User is already in the desired state."
        );

        if (newStatus == UserStatus.Deactivated) {
            require(
                currentStatus == UserStatus.Active,
                "User must be Active to be Deactivated."
            );
        } else if (newStatus == UserStatus.Rejected) {
            require(
                currentStatus == UserStatus.Pending,
                "User must be Pending to be Rejected."
            );
            userExist[_wallet] = false;
        } else if (newStatus == UserStatus.Active) {
            require(
                currentStatus == UserStatus.Pending ||
                    currentStatus == UserStatus.Deactivated,
                "User must be Pending or Deactivated to be Activated."
            );
        }
        users[_wallet].status = newStatus;
        emit UserStatusUpdated(_wallet, currentStatus, newStatus);
    }

    function createBatch(string memory _name, string memory _description)
        public
        userValidationCheck
    {
        require(
            users[msg.sender].role == Role.Manufacturer,
            "Unauthorized role for create batch."
        );
        require(bytes(_name).length > 5, "Proper name is required.");

        batchCount++;
        batches[batchCount] = Batch(_name, _description);

        emit BatchCreated(batchCount, _name);
    }

    function addProduct(
        string memory _name,
        string memory _productType,
        string memory _description,
        uint256 _batchNo,
        uint256 _manufacturedDate,
        uint256 _expiryDate,
        uint256 _price
    ) public userValidationCheck {
        require(
            users[msg.sender].role == Role.Manufacturer,
            "Unauthorized role for add product."
        );
        require(batchCount > 0, "No batch exists. Create a batch first.");
        require(
            _batchNo > 0 && _batchNo <= batchCount,
            "Invalid Batch Number."
        );
        require(
            _manufacturedDate < block.timestamp,
            "Manufacture date must be in the past."
        );
        require(
            _expiryDate > _manufacturedDate,
            "Expiry date must be after manufacture date."
        );

        productCount++;
        products[productCount] = Product(
            _name,
            _batchNo,
            Stage.Manufactured,
            _productType,
            _description,
            _manufacturedDate,
            _expiryDate,
            _price
        );
        productsPerBatch[_batchNo].push(productCount);
        productStage[productCount] += 1;
        userProducts[msg.sender].push(productCount);
        userProductUpdate[msg.sender][productCount] = true;
        trackingProducts[productCount][
            productStage[productCount]
        ] = TrackingProduct(
            msg.sender,
            block.timestamp,
            0,
            productStage[productCount],
            Stage.Manufactured,
            "Manufactured."
        );

        emit ProductAdded(productCount, _name, _batchNo);
    }

    function updateProductStage(
        uint256 _productId,
        Stage _newStage,
        string memory _remark
    ) public userValidationCheck {
        require(
            _newStage >= products[_productId].stage,
            "Invalid stage transition."
        );
        require(
            _isValidRoleForStage(msg.sender, _newStage),
            "Unauthorized role for this stage."
        );
        require(
            !userProductUpdate[msg.sender][_productId],
            "You have already update this product."
        );

        products[_productId].stage = _newStage;
        productStage[_productId]++;
        userProducts[msg.sender].push(_productId);
        userProductUpdate[msg.sender][_productId] = true;
        trackingProducts[_productId][
            productStage[_productId]
        ] = TrackingProduct(
            msg.sender,
            block.timestamp,
            0,
            productStage[_productId],
            _newStage,
            _remark
        );
        trackingProducts[_productId][productStage[_productId] - 1]
            .exitTime = block.timestamp;

        emit ProductStageUpdated(_productId, _newStage, _remark);
    }

    function markAsLost(uint256 _productId, string memory _remark)
        public
        invalidProductCheck(_productId)
        userValidationCheck
    {
        require(
            products[_productId].stage != Stage.Lost,
            "Product is already marked as lost."
        );

        require(
            trackingProducts[_productId][productStage[_productId]]
                .handlerWallet == msg.sender,
            "You are not authorized to mark product as Lost."
        );

        require(
            bytes(_remark).length > 0,
            "Remark is required to mark as lost."
        );

        products[_productId].stage = Stage.Lost;
        productStage[_productId]++;
        userProducts[msg.sender].push(_productId);
        userProductUpdate[msg.sender][_productId] = true;
        trackingProducts[_productId][
            productStage[_productId]
        ] = TrackingProduct(
            msg.sender,
            block.timestamp,
            0,
            productStage[_productId],
            Stage.Lost,
            _remark
        );
        emit ProductStageUpdated(_productId, Stage.Lost, _remark);
    }

    // function getAllProductsPerBatch(uint256 _batchNo)
    //     public
    //     view
    //     userValidationCheck
    //     returns (Product[] memory)
    // {
    //     require(_batchNo <= batchCount, "Invalid Batch Number.");

    //     uint256[] memory productArray = productsPerBatch[_batchNo];
    //     uint256 numOfProducts = productArray.length;
    //     Product[] memory productlist = new Product[](numOfProducts);
    //     for (uint256 i; i < numOfProducts; i++) {
    //         productlist[i] = products[productArray[i]];
    //     }
    //     return productlist;
    // }

    function getProductDetails(uint256 _productId)
        public
        view
        returns (
            Product memory product,
            Batch memory batchDetails,
            StageDetails[] memory stageDetails
        )
    {
        uint256 stageCount = productStage[_productId];
        StageDetails[] memory productStages = new StageDetails[](stageCount);
        for (uint256 i = 1; i <= stageCount; i++) {
            productStages[i - 1] = StageDetails({
                user: users[trackingProducts[_productId][i].handlerWallet],
                entryTime: trackingProducts[_productId][i].entryTime,
                exitTime: trackingProducts[_productId][i].exitTime,
                remark: trackingProducts[_productId][i].remark,
                stage: trackingProducts[_productId][i].stage,
                stageCount: i
            });
        }
        return (
            products[_productId],
            batches[products[_productId].batchNo],
            productStages
        );
    }

    function getAllUserList() public view onlyOwner returns (User[] memory) {
        User[] memory usersArray = new User[](userCount);
        for (uint256 i = 0; i < userCount; i++) {
            usersArray[i] = users[userList[i]];
        }
        return (usersArray);
    }

    function getProductsByUser()
        public
        view
        userValidationCheck
        returns (Product[] memory)
    {
        uint256[] memory productArray = userProducts[msg.sender];
        uint256 numOfProducts = productArray.length;
        Product[] memory productlist = new Product[](numOfProducts);
        for (uint256 i; i < numOfProducts; i++) {
            productlist[i] = products[productArray[i]];
        }
        return productlist;
    }
}
