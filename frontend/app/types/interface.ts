import { Role, Stage, UserStatus } from "./enums";

export interface IUser {
  wallet: string;
  name: string;
  place: string;
  role: Role;
  status: UserStatus;
}

export interface IBatch {
  name: string;
  description: string;
}

export interface IProduct {
  name: string;
  batchNo: number;
  stage: Stage;
  productType: string;
  description: string;
  manufacturedDate: Date;
  expiryDate: Date;
  price: number;
}

export interface ITrackingProduct {
  handlerWallet: string;
  entryTime: Date;
  exitTime: Date;
  productStage: number;
  stage: Stage;
  remark: string;
}

export interface IStageDetails {
  user: IUser;
  stage: Stage;
  stageCount: number;
  entryTime: Date;
  exitTime: Date;
  remark: string;
}
