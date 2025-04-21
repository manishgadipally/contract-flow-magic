
import React from 'react';
import { format } from 'date-fns';
import { PaymentInterval, PaymentTranche } from '../../types/contract';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Calendar, DollarSign } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PaymentScheduleProps {
  interval: PaymentInterval;
  selected: boolean;
  onSelect: () => void;
}

const PaymentSchedule: React.FC<PaymentScheduleProps> = ({ interval, selected, onSelect }) => {
  const { PaymentFrequency, Tranches } = interval;
  
  // Calculate total amount for this payment schedule
  const totalAmount = Tranches.reduce((sum, tranche) => sum + tranche.Amount.Value, 0);
  
  // Format date from ISO string
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div 
      className={cn(
        "border rounded-lg p-4 cursor-pointer transition-all duration-200",
        selected 
          ? "border-blue-300 bg-blue-50 shadow-sm" 
          : "border-gray-200 hover:border-blue-200"
      )}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center",
            selected ? "border-blue-500" : "border-gray-300"
          )}>
            {selected && <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>}
          </div>
          <h3 className="font-medium text-lg">{PaymentFrequency} Payments</h3>
        </div>
        <span className="font-semibold text-lg">
          {Tranches[0].Amount.CurrencyCode} {totalAmount.toFixed(2)}
        </span>
      </div>
      
      <div className="rounded-md overflow-hidden border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Tranches.map((tranche, index) => (
              <TableRow key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <TableCell className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {formatDate(tranche.DueDate)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  <div className="flex items-center justify-end gap-1">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    {tranche.Amount.Value.toFixed(2)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {Tranches.length > 3 && (
        <div className="text-center mt-2 text-sm text-blue-600 font-medium">
          {Tranches.length} payments in total
        </div>
      )}
    </div>
  );
};

export default PaymentSchedule;
