// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
    
    enum Role {
         Manufacturer,
         Warehouse,
         Transporter,
         Distributor,
         Retailer 
    }

    enum Stage {
        Manufactured,
        Warehoused,
        Dispatched,
        Distributor,
        Retailer,
        Sold,
        Lost 
    }

    enum UserStatus {
        Pending,
        Rejected,
        Active,
        Blocked,
        Deactivated
    }