import { useState } from "react";
import { useSupplyChainContract } from "../blockchain/useSupplyChainContract";
import { IBatch, IProduct } from "../../types/interface";

export function useBatchManagement() {
  const contract = useSupplyChainContract();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateContract = () => {
    if (!contract) {
      setError(
        "Please switch to the correct network and connect your wallet. Contract not found."
      );
      return false;
    }
    setError(null);
    return true;
  };

   const createBatch = async (name: string, description: string) => {
     if (!validateContract()) return null;
     if (!name.trim() || !description.trim()) {
       setError("Name and description are required.");
       return null;
     }

     setLoading(true);
     setError(null);

     try {
       const tx = await contract!.createBatch(name, description);
       const receipt = await tx.wait();

       for (const log of receipt.logs) {
         if (log.transactionHash !== receipt.hash) continue;

         try {
           const parsedLog = contract?.interface.parseLog(log);
           if (parsedLog?.name === "BatchCreated") {
             const [batchId, batchName] = parsedLog.args;
             return {
               batchId: Number(batchId),
               name: batchName,
             };
           }
         } catch (error) {
           setError("Failed to parse event log.");
         }
       }

       setError("BatchCreated event not found in transaction receipt.");
       return null;
     } catch (err: any) {
       setError(
         "Error creating batch: " +
           (err?.reason ||
             err?.revert?.args?.[0] ||
             err?.toString()?.match(/: (.*?)(?=\s*\()/)?.[1] ||
             "Unknown error")
       );
       return null;
     } finally {
       setLoading(false);
     }
   };

  const getBatchDetails = async (batchId: number) => {
    if (!validateContract()) return null;

    setError(null);

    try {
      const batch = await contract!.batches(batchId);
      return {
        name: batch.name,
        description: batch.description,
      } as IBatch;
    } catch (err: any) {
      setError(
        "Error fetching batch details: " +
          (err?.reason ||
            err?.revert?.args?.[0] ||
            err?.toString()?.match(/: (.*?)(?=\s*\()/)?.[1] ||
            "Unknown error")
      );
      return null;
    }
  };

  const getAllProductsPerBatch = async (batchNo: number) => {
    if (!validateContract()) return null;

    setLoading(true);
    setError(null);

    try {
      const products = await contract!.getAllProductsPerBatch(batchNo);
      return products.map((p: any) => ({
        name: p.name,
        batchNo: Number(p.batchNo),
        stage: Number(p.stage),
        productType: p.productType,
        description: p.description,
        manufacturedDate: new Date(Number(p.manufacturedDate) * 1000),
        expiryDate: new Date(Number(p.expiryDate) * 1000),
        price: Number(p.price),
      })) as IProduct[];
    } catch (err: any) {
      setError(
        "Error fetching products for batch: " +
          (err?.reason ||
            err?.revert?.args?.[0] ||
            err?.toString()?.match(/: (.*?)(?=\s*\()/)?.[1] ||
            "Unknown error")
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createBatch,
    getBatchDetails,
    getAllProductsPerBatch,
    loading,
    error,
  };
}
