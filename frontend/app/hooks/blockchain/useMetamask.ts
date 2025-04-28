import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

const rawChainId = process.env.NEXT_PUBLIC_CHAIN_ID;
const CHAIN_NAME = process.env.NEXT_PUBLIC_CHAIN_NAME;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;

if (!rawChainId) throw new Error("Missing NEXT_PUBLIC_CHAIN_ID in .env.local");
if (!CHAIN_NAME)
  throw new Error("Missing NEXT_PUBLIC_CHAIN_NAME in .env.local");
if (!RPC_URL) throw new Error("Missing NEXT_PUBLIC_RPC_URL in .env.local");

const CHAIN_ID = Number(rawChainId);

export function useMetamask() {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  const initProvider = useCallback(async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;

    const { ethereum } = window as any;
    const browserProvider = new ethers.BrowserProvider(ethereum);
    setProvider(browserProvider);

    try {
      const accounts: string[] = await ethereum.request({
        method: "eth_accounts",
      });
      const chainIdHex: string = await ethereum.request({
        method: "eth_chainId",
      });
      const parsedChainId = parseInt(chainIdHex, 16);

      if (parsedChainId !== CHAIN_ID) {
        setNetworkError(`Please switch your wallet to ${CHAIN_NAME}.`);
      } else {
        setNetworkError(null);
      }

      if (accounts.length > 0) {
        setUserAddress(accounts[0]);
        setConnectionStatus(`Connected to ${CHAIN_NAME}.`);
      }
    } catch (err: any) {
      console.error("Error initializing provider:", err.message);
    }
  }, []);

  useEffect(() => {
    initProvider();

    if (typeof window === "undefined" || !(window as any).ethereum) return;
    const { ethereum } = window as any;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setUserAddress(accounts[0]);
        setConnectionStatus(`Connected to ${CHAIN_NAME}.`);
      } else {
        setUserAddress(null);
        setConnectionStatus(null);
      }
      initProvider();
    };

    const handleChainChanged = (chainIdHex: string) => {
      const parsed = parseInt(chainIdHex, 16);
      if (parsed !== CHAIN_ID) {
        setNetworkError(`Please switch your wallet to ${CHAIN_NAME}.`);
      } else {
        setNetworkError(null);
      }

      initProvider();
    };

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);

    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
      ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [initProvider]);

  const connect = useCallback(async () => {
    try {
      if (typeof window === "undefined" || !(window as any).ethereum) {
        throw new Error("MetaMask not found. Please install it.");
      }

      const { ethereum } = window as any;

      const accounts: string[] = await ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length === 0) throw new Error("No accounts found.");

      const chainIdHex: string = await ethereum.request({
        method: "eth_chainId",
      });
      const parsed = parseInt(chainIdHex, 16);

      const browserProvider = new ethers.BrowserProvider(ethereum);
      setProvider(browserProvider);
      setUserAddress(accounts[0]);
      setConnectionStatus(`Connected to ${CHAIN_NAME}.`);

      if (parsed !== CHAIN_ID) {
        setNetworkError(`Please switch your wallet to ${CHAIN_NAME}.`);
      } else {
        setNetworkError(null);
      }
    } catch (err: any) {
      alert(err.message || "Something went wrong during wallet connection.");
    }
  }, []);


  const disconnect = useCallback(() => {
    setUserAddress(null);
    setProvider(null);
    setConnectionStatus(null);
    setNetworkError(null);
  }, []);

  return {
    userAddress,
    provider,
    connect,
    disconnect,
    connectionStatus,
    networkError,
  };
}
