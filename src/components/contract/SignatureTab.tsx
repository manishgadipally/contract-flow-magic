
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Contract, ContractHistoryItem } from '../../types/contract';

interface SignatureTabProps {
  contract: {
    from: {
      name: string;
      signature?: string;
    };
    to: {
      name: string;
      signature?: string;
    };
  };
  isFromUser: boolean;
  onSign: (signature: string) => void;
}

const SignatureTab = ({ contract, isFromUser, onSign }: SignatureTabProps) => {
  const [isDrawing, setIsDrawing] = useState(false);

  const handleSign = () => {
    // For now, we'll just use a placeholder signature
    const signature = `Signed by ${isFromUser ? contract.from.name : contract.to.name} on ${new Date().toLocaleDateString()}`;
    onSign(signature);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contract Signatures</CardTitle>
          <CardDescription>
            Both parties must sign to finalize the contract
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* From Party Signature */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">From: {contract.from.name}</h3>
                {contract.from.signature ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
              </div>
              {contract.from.signature ? (
                <div className="p-4 border rounded bg-gray-50">
                  <p className="text-sm font-medium">{contract.from.signature}</p>
                </div>
              ) : isFromUser ? (
                <Button onClick={handleSign} className="w-full">Sign Contract</Button>
              ) : (
                <p className="text-sm text-gray-500">Awaiting signature...</p>
              )}
            </div>

            {/* To Party Signature */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">To: {contract.to.name}</h3>
                {contract.to.signature ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
              </div>
              {contract.to.signature ? (
                <div className="p-4 border rounded bg-gray-50">
                  <p className="text-sm font-medium">{contract.to.signature}</p>
                </div>
              ) : !isFromUser ? (
                <Button onClick={handleSign} className="w-full">Sign Contract</Button>
              ) : (
                <p className="text-sm text-gray-500">Awaiting signature...</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignatureTab;
