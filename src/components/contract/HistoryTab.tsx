
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { ContractHistoryItem } from '../../types/contract';
import { Clock, User, FileText } from 'lucide-react';

interface HistoryTabProps {
  history?: ContractHistoryItem[];
}

const HistoryTab = ({ history = [] }: HistoryTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contract History</CardTitle>
          <CardDescription>Track all changes and updates to the contract</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {history.length > 0 ? (
              history.map((item, index) => (
                <div key={item.id} className="flex gap-4">
                  <div className="flex-shrink-0 w-10">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      {item.action.includes('Sign') ? (
                        <FileText className="h-4 w-4 text-blue-600" />
                      ) : item.action.includes('Edit') ? (
                        <User className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    {index !== history.length - 1 && (
                      <div className="w-px h-full bg-gray-200 mx-auto mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-gray-500">{new Date(item.date).toLocaleString()}</p>
                    <p className="text-sm text-gray-600 mt-1">{item.user}</p>
                    {item.notes && (
                      <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No history available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoryTab;
