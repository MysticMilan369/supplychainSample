import { useState, useCallback } from "react";
import { IUser } from "../../types/interface";
import { Role, UserStatus } from "../../types/enums";
import { useSupplyChainContract } from "../blockchain/useSupplyChainContract";

export const useUserManagement = () => {
  const contract = useSupplyChainContract();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateContract = useCallback((): boolean => {
    if (!contract) {
      setError(
        "Please switch to the correct network and connect your wallet. Contract not found."
      );
      return false;
    }
    setError(null);
    return true;
  }, [contract]);

  const addUser = useCallback(
    async (
      wallet: string,
      name: string,
      place: string,
      role: Role
    ): Promise<{
      wallet: string;
      name: string;
      role: Role;
      status: UserStatus;
    } | null> => {
      if (!validateContract()) return null;

      if (!wallet || !name || !place) {
        setError("All fields are required.");
        return null;
      }

      if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
        setError("Invalid wallet address.");
        return null;
      }

      if (name.length <= 5) {
        setError("Name must be longer than 5 characters.");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const tx = await contract!.addUser(wallet, name, place, role);
        const receipt = await tx.wait();

        for (const log of receipt.logs) {
          if (log.transactionHash !== receipt.hash) continue;

          try {
            const parsedLog = contract?.interface.parseLog(log);
            if (parsedLog?.name === "UserAdded") {
              const [userWallet, userName, userRole, userStatus] =
                parsedLog.args;
              return {
                wallet: userWallet,
                name: userName,
                role: Number(userRole),
                status: Number(userStatus),
              };
            }
          } catch (error) {
            setError("Failed to parse event log.");
          }
        }
        setError("User added successfully!, but no event found in the logs.");
        return null;
      } catch (err: any) {
        console.log(err);
        setError(
          "Error adding user: " +
            (err?.reason ||
              err?.revert?.args?.[0] ||
              err?.toString()?.match(/: (.*?)(?=\s*\()/)?.[1] ||
              "Unknown error")
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [contract, validateContract]
  );

  const registerUser = useCallback(
    async (
      name: string,
      place: string,
      role: Role
    ): Promise<{
      wallet: string;
      name: string;
      role: Role;
      status: UserStatus;
    } | null> => {
      if (!validateContract()) return null;
      if (name.length <= 5) {
        setError("Name must be longer than 5 characters.");
        return null;
      }

      setLoading(true);
      setError(null);
      try {
        const tx = await contract!.registerUser(name, place, role);
        const receipt = await tx.wait();

        for (const log of receipt.logs) {
          if (log.transactionHash !== receipt.hash) continue;

          try {
            const parsedLog = contract?.interface.parseLog(log);
            if (parsedLog?.name === "UserAdded") {
              const [userWallet, userName, userRole, userStatus] =
                parsedLog.args;
              return {
                wallet: userWallet,
                name: userName,
                role: Number(userRole),
                status: Number(userStatus),
              };
            }
          } catch (error) {
            setError("Failed to parse event log.");
          }
        }
        setError(
          "User registered successfully!, but no event found in the logs."
        );
        return null;
      } catch (err: any) {
        setError(
          "Error registering user: " +
            (err?.reason ||
              err?.revert?.args?.[0] ||
              err?.toString()?.match(/: (.*?)(?=\s*\()/)?.[1] ||
              "Unknown error")
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [contract, validateContract]
  );

  const updateUserStatus = useCallback(
    async (
      wallet: string,
      newStatus: UserStatus
    ): Promise<{
      wallet: string;
      oldStatus: UserStatus;
      newStatus: UserStatus;
    } | null> => {
      if (!validateContract()) return null;

      if (!wallet) {
        setError("Wallet address is required.");
        return null;
      }

      if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
        setError("Invalid wallet address.");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const tx = await contract!.updateUserStatus(wallet, newStatus);
        const receipt = await tx.wait();

        for (const log of receipt.logs) {
          if (log.transactionHash !== receipt.hash) continue;

          try {
            const parsedLog = contract?.interface.parseLog(log);
            if (parsedLog?.name === "UserStatusUpdated") {
              const [userWallet, oldStatus, updatedStatus] = parsedLog.args;
              return {
                wallet: userWallet,
                oldStatus: Number(oldStatus),
                newStatus: Number(updatedStatus),
              };
            }
          } catch (error: any) {
            setError("Failed to parse event log.");
          }
        }
        setError(
          "User status updated successfully!, but no event found in the logs."
        );
        return null;
      } catch (err: any) {
        setError(
          "Error updating user status: " +
            (err?.reason ||
              err?.revert?.args?.[0] ||
              err?.toString()?.match(/: (.*?)(?=\s*\()/)?.[1] ||
              "Unknown error")
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [contract, validateContract]
  );

  const getUserDetails = useCallback(
    async (userAddress: string): Promise<IUser | null> => {
      if (!validateContract()) return null;

      try {
        const user = await contract!.users(userAddress);
        return {
          wallet: user.wallet,
          name: user.name,
          place: user.place,
          role: Number(user.role),
          status: Number(user.status),
        };
      } catch (err: any) {
        setError(
          "Error fetching user details: " +
            (err?.reason ||
              err?.revert?.args?.[0] ||
              err?.toString()?.match(/: (.*?)(?=\s*\()/)?.[1] ||
              "Unknown error")
        );
        return null;
      }
    },
    [contract, validateContract]
  );

  const getAllUsers = useCallback(async (): Promise<IUser[]> => {
    if (!validateContract()) return [];

    try {
      const users = await contract!.getAllUserList();
      if (!users || users.length === 0) {
        setError("No users found.");
        return [];
      }
      return users.map((user: any) => ({
        wallet: user.wallet,
        name: user.name,
        place: user.place,
        role: Number(user.role),
        status: Number(user.status),
      }));
    } catch (err: any) {
      setError(
        "Error fetching user list: " +
          (err?.reason ||
            err?.revert?.args?.[0] ||
            err?.toString()?.match(/: (.*?)(?=\s*\()/)?.[1] ||
            "Unknown error")
      );
      return [];
    }
  }, [contract, validateContract]);

  return {
    addUser,
    registerUser,
    updateUserStatus,
    getUserDetails,
    getAllUsers,
    loading,
    error,
  };
};
