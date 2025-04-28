import { useState, useEffect } from "react";
import { Contract, Signer } from "ethers";
import { useMetamask } from "./useMetamask";
import { useContract } from "./useContract";
import supplyChainABI from "../../../contracts/SupplyChain.json";
import contractAddress from "../../../contracts/contract-address.json";

export function useSupplyChainContract(): Contract | null {
  const { provider } = useMetamask();
  const [signer, setSigner] = useState<Signer | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (provider) {
      provider.getSigner().then((s) => {
        if (!cancelled) {
          setSigner(s);
        }
      });
    } else {
      setSigner(null);
    }

    return () => {
      cancelled = true;
    };
  }, [provider]);

  const signerOrProvider = signer || provider;

  const contract = useContract<Contract>(
    contractAddress.SupplyChain,
    supplyChainABI.abi,
    signerOrProvider
  );

  if (!signerOrProvider) {
    return null;
  }

  return contract;
}
