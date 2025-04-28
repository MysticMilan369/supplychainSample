// hooks/useContract.ts
import { useMemo } from "react";
import { ethers } from "ethers";

export function useContract<T = ethers.BaseContract>(
    address: string,
    abi: any,
    providerOrSigner: ethers.Provider | ethers.Signer | null
): T | null {
    return useMemo(() => {
        if (!address || !abi || !providerOrSigner) return null;

        try {
            return new ethers.Contract(address, abi, providerOrSigner) as T;
        } catch (error) {
            console.error("Error creating contract instance:", error);
            return null;
        }
    }, [address, abi, providerOrSigner]);
}
