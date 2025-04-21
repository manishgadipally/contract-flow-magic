
import React from 'react';
import { PaymentInterval, PaymentTranche } from '../../types/contract';
import { format } from 'date-fns';
import { Calendar, CheckCircle, Clock, X, AlertCircle, ArrowRightCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';

interface PaymentPlanDisplayProps {
  paymentType: 'one-time' | 'partial';
  paymentFrequency?: 'Monthly' | 'Weekly' | 'Daily';
  interval?: PaymentInterval;
  isFromUser: boolean;
  onRequestPayment: (trancheIndex: number) => void;
  onApprovePayment: (trancheIndex: number) => void;
  onCancelPayment: (trancheIndex: number) => void;
}

const formatDate = (dateStr: string) => {
  try {
    return format(new Date(dateStr), 'MMM d, yyyy');
  } catch (e) {
    return dateStr;
  }
};

const PaymentPlanDisplay: React.FC<PaymentPlanDisplayProps> = ({
  paymentType,
  paymentFrequency,
  interval,
  isFromUser,
  onRequestPayment,
  onApprovePayment,
  onCancelPayment
}) => {
  if (paymentType === 'one-time') {
    return (
      <div className="bg-green-50 border border-green-100 rounded-lg p-6 mb-8 animate-fade-in">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-green-800 font-medium">One-time Payment Selected</p>
            <p className="text-sm text-green-600">
              You will be charged the full amount when this contract is accepted.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!interval || !paymentFrequency) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8 overflow-hidden">
      <div className="bg-blue-50 border-b border-blue-100 py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-medium text-blue-800">{paymentFrequency} Payment Plan</h3>
          </div>
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            {interval.Tranches.length} Payments
          </Badge>
        </div>
      </div>

      <div className="p-1">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {interval.Tranches.map((tranche, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {formatDate(tranche.DueDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                  {tranche.Amount.CurrencyCode} {tranche.Amount.Value.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={tranche.Status || 'not_paid'} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  {renderActions(tranche, index, isFromUser)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  function StatusBadge({ status }: { status: PaymentTranche['Status'] }) {
    switch (status) {
      case 'not_paid':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
            <Clock className="w-3 h-3 mr-1" /> Not Paid
          </Badge>
        );
      case 'requested':
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
            <AlertCircle className="w-3 h-3 mr-1" /> Payment Requested
          </Badge>
        );
      case 'paid':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" /> Paid
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
            <X className="w-3 h-3 mr-1" /> Cancelled
          </Badge>
        );
      default:
        return null;
    }
  }

  function renderActions(tranche: PaymentTranche, index: number, isFromUser: boolean) {
    const status = tranche.Status || 'not_paid';
    
    if (isFromUser) {
      // Actions for the user who is paying (From user)
      if (status === 'requested') {
        return (
          <div className="flex justify-end gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
              onClick={() => onCancelPayment(index)}
            >
              Decline
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
              onClick={() => onApprovePayment(index)}
            >
              Pay Now
            </Button>
          </div>
        );
      }
      return null;
    } else {
      // Actions for the user who is receiving the payment (To user)
      if (status === 'not_paid') {
        return (
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700"
            onClick={() => onRequestPayment(index)}
          >
            Request Payment
          </Button>
        );
      }
      return null;
    }
  }
};

export default PaymentPlanDisplay;
