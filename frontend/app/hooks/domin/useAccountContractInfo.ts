import { useState, useEffect } from "react";
import { useMetamask } from "../blockchain/useMetamask";
import { useSupplyChainContract } from "../blockchain/useSupplyChainContract";
import { IUser } from "../../types/interface";

export function useAccountContractInfo() {
  const { provider, userAddress } = useMetamask();
  const contract = useSupplyChainContract();

  const [owner, setOwner] = useState<string | null>(null);
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [userDetails, setUserDetails] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!provider || !contract) return;

    let cancelled = false;

    const fetchAccountInfo = async () => {
      setLoading(true);
      setError(null);

      try {
        const onChainOwner = await contract.owner();
        if (!cancelled) setOwner(onChainOwner);

        if (userAddress) {
          const exists = await contract.userExist(userAddress);
          if (!cancelled) setUserExists(exists);

          if (exists) {
            const u = await contract.users(userAddress);
            if (!cancelled) {
              setUserDetails({
                wallet: u.wallet,
                name: u.name,
                place: u.place,
                role: Number(u.role),
                status: Number(u.status),
              });
            }
          } else if (!cancelled) {
            setUserDetails(null);
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            "Error fetching account info: " +
              (err?.reason ||
                err?.revert?.args?.[0] ||
                err?.toString()?.match(/: (.*?)(?=\s*\()/)?.[1] ||
                "Unknown error")
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAccountInfo();

    return () => {
      cancelled = true;
    };
  }, [provider, contract, userAddress]);

  return {
    owner,
    userExists,
    userDetails,
    loading,
    error,
  };
}
