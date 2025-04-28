export enum Role {
  Manufacturer = 0,
  Warehouse = 1,
  Transporter = 2,
  Distributor = 3,
  Retailer = 4,
}

export enum Stage {
  Manufactured = 0,
  Warehoused = 1,
  Dispatched = 2,
  Distributor = 3,
  Retailer = 4,
  Sold = 5,
  Lost = 6,
}

export enum UserStatus {
  Pending = 0,
  Rejected = 1,
  Active = 2,
  Blocked = 3,
  Deactivated = 4,
}
