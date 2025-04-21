
import React from 'react';
import { cn } from '../../lib/utils';
import { Clock, User, DollarSign, MapPin, Calendar, Edit } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../../components/ui/tooltip';

export interface ContractSummaryProps {
  contract: {
    id: string;
    status: string;
    from: {
      name: string;
      email: string;
    };
    to: {
      name: string;
      email: string;
    };
    details: {
      placeOfService: string;
      startDate: string;
      endDate: string;
      rate: string;
    };
    createdAt: string;
    progress: number;
  };
  onEdit?: (type: 'from' | 'to' | 'place' | 'duration' | 'rate', title: string, data: unknown) => void;
  onSendForReview?: () => void;
  onDelete?: () => void;
  onDownloadPdf?: () => void;
  className?: string;
}

const ContractSummary = ({ 
  contract, 
  onEdit, 
  onSendForReview,
  onDelete,
  onDownloadPdf,
  className 
}: ContractSummaryProps) => {
  return (
    <div className={cn("rounded-lg bg-white border border-gray-200", className)}>
      <div className="p-6 space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-sm font-medium text-gray-500">Contract Progress</h4>
            <span className="text-sm font-medium text-blue-600">{contract.progress}%</span>
          </div>
          <div className="relative w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-700 ease-in-out" 
              style={{ width: `${contract.progress}%` }}
            />
          </div>
        </div>

        {/* Essential Details */}
        <div className="space-y-4">
          {/* Parties */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">From</span>
                </div>
                {onEdit && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0" 
                    onClick={() => onEdit('from', 'From Party', contract.from)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <p className="text-sm font-medium truncate">{contract.from.name}</p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{contract.from.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">To</span>
                </div>
                {onEdit && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0" 
                    onClick={() => onEdit('to', 'To Party', contract.to)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <p className="text-sm font-medium truncate">{contract.to.name}</p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{contract.to.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Contract Value */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Contract Value</span>
              </div>
              {onEdit && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0" 
                  onClick={() => onEdit('rate', 'Contract Rate', { rate: contract.details.rate })}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-600">{contract.details.rate}</p>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Place of Service</span>
              </div>
              {onEdit && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0" 
                  onClick={() => onEdit('place', 'Place of Service', { placeOfService: contract.details.placeOfService })}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <p className="text-sm text-gray-600 truncate">{contract.details.placeOfService}</p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{contract.details.placeOfService}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Time */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Duration</span>
              </div>
              {onEdit && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0" 
                  onClick={() => onEdit('duration', 'Contract Duration', {
                    startDate: contract.details.startDate,
                    endDate: contract.details.endDate
                  })}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {contract.details.startDate} - {contract.details.endDate}
            </p>
          </div>

          {/* Created On */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Created On</span>
            </div>
            <p className="text-sm text-gray-600">{new Date(contract.createdAt).toLocaleDateString()}</p>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Status</span>
            <div>
              <Badge variant="outline" className="text-blue-800 bg-blue-50 border-blue-200">
                {contract.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {(onSendForReview || onDelete || onDownloadPdf) && (
          <div className="space-y-3 pt-2">
            {onSendForReview && (
              <Button 
                onClick={onSendForReview} 
                className="w-full"
              >
                Send for Review
              </Button>
            )}
            
            {onDownloadPdf && (
              <Button 
                onClick={onDownloadPdf} 
                variant="outline" 
                className="w-full"
              >
                Download PDF
              </Button>
            )}
            
            {onDelete && (
              <Button 
                onClick={onDelete} 
                variant="outline" 
                className="w-full text-red-600 hover:bg-red-50 border-red-200"
              >
                Delete Contract
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractSummary;
