
import React, { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { X, AlertTriangle, Calendar, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import PaymentSchedule from './PaymentSchedule';
import { PaymentInterval } from '../../types/contract';

interface ReviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: unknown) => void;
  contractData: {
    fromName: string;
    toName: string;
    rate: string;
  };
}

// Mock payment plan data based on the provided JSON structure
const mockPaymentPlans = {
  NeedPayableAmount: {
    CurrencyCode: "USD",
    Value: 1000.00
  },
  OfferReceivableAmount: {
    CurrencyCode: "USD",
    Value: 950.00
  },
  PlatformFee: {
    FromNeed: {
      CurrencyCode: "USD",
      Value: 50.00
    },
    FromOffer: {
      CurrencyCode: "USD",
      Value: 25.00
    }
  },
  PaymentPlans: [
    {
      PaymentOption: "Full",
      PaymentIntervals: [
        {
          PaymentFrequency: "Monthly",
          Tranches: [
            {
              DueDate: "2025-04-01T00:00:00Z",
              Amount: {
                CurrencyCode: "USD",
                Value: 500.00
              }
            },
            {
              DueDate: "2025-05-01T00:00:00Z",
              Amount: {
                CurrencyCode: "USD",
                Value: 500.00
              }
            }
          ]
        },
        {
          PaymentFrequency: "Weekly",
          Tranches: [
            {
              DueDate: "2025-04-07T00:00:00Z",
              Amount: {
                CurrencyCode: "USD",
                Value: 250.00
              }
            },
            {
              DueDate: "2025-04-14T00:00:00Z",
              Amount: {
                CurrencyCode: "USD",
                Value: 250.00
              }
            },
            {
              DueDate: "2025-04-21T00:00:00Z",
              Amount: {
                CurrencyCode: "USD",
                Value: 250.00
              }
            },
            {
              DueDate: "2025-04-28T00:00:00Z",
              Amount: {
                CurrencyCode: "USD",
                Value: 250.00
              }
            }
          ]
        },
        {
          PaymentFrequency: "Daily",
          Tranches: [
            {
              DueDate: "2025-04-01T00:00:00Z",
              Amount: {
                CurrencyCode: "USD",
                Value: 50.00
              }
            },
            {
              DueDate: "2025-04-02T00:00:00Z",
              Amount: {
                CurrencyCode: "USD",
                Value: 50.00
              }
            },
            {
              DueDate: "2025-04-03T00:00:00Z",
              Amount: {
                CurrencyCode: "USD",
                Value: 50.00
              }
            }
          ]
        }
      ]
    }
  ]
};

const ReviewPanel = ({ isOpen, onClose, onComplete, contractData }: ReviewPanelProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [subscriptionActive, setSubscriptionActive] = useState(true);
  const [balanceStatus, setBalanceStatus] = useState<'sufficient' | 'insufficient'>('sufficient');
  const [paymentType, setPaymentType] = useState<'one-time' | 'partial'>('one-time');
  const [selectedInterval, setSelectedInterval] = useState<string>('');
  const [autoPayDate, setAutoPayDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Calculate fee breakdown
  const { NeedPayableAmount, OfferReceivableAmount, PlatformFee } = mockPaymentPlans;
  const totalAmount = NeedPayableAmount.Value;
  const platformFee = PlatformFee.FromNeed.Value;
  const receiverAmount = OfferReceivableAmount.Value;
  
  // Reset steps when panel opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setShowSuccess(false);
      setPaymentType('one-time');
      setSelectedInterval('');
    }
  }, [isOpen]);

  // Handle step transitions
  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      onClose();
    }
  };
  
  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      
      // After showing success message, we'll complete the flow
      setTimeout(() => {
        onComplete({
          paymentType,
          selectedInterval: paymentType === 'partial' ? selectedInterval : null,
          totalAmount,
          platformFee,
          receiverAmount
        });
      }, 2000);
    }, 1500);
  };

  // If not open, don't render
  if (!isOpen) return null;

  // Get the payment intervals from our mock data
  const paymentIntervals = mockPaymentPlans.PaymentPlans[0].PaymentIntervals;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-xs" onClick={onClose}></div>
      
      <div className={cn(
        "absolute top-0 right-0 w-full sm:w-[550px] h-full bg-white shadow-elevation-3 overflow-auto transition-all duration-500 ease-out transform",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Send Contract for Review</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {showSuccess ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-2">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold">Contract Sent Successfully</h3>
              <p className="text-gray-600 max-w-xs">
                Your contract has been sent to {contractData.toName} for review. We'll notify you when they respond.
              </p>
              <Button onClick={onClose} className="mt-2">
                Close
              </Button>
            </div>
          ) : (
            <>
              {/* Step indicator */}
              <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-brand-blue transition-all duration-500 ease-out" 
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                />
              </div>
              
              <div className="text-sm text-gray-500 mb-6">
                Step {currentStep} of 4
              </div>
              
              {/* Step 1: Subscription Check */}
              {currentStep === 1 && (
                <div className="animate-fade-in space-y-6">
                  <h3 className="text-lg font-medium">Subscription Status</h3>
                  
                  {subscriptionActive ? (
                    <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-green-800">Active Subscription</p>
                        <p className="text-sm text-green-700">
                          Your subscription is active. You can send this contract for review.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-start">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-amber-800">Inactive Subscription</p>
                        <p className="text-sm text-amber-700 mb-2">
                          Your subscription is inactive. Please subscribe to send contracts for review.
                        </p>
                        <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                          Subscribe Now
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Step 2: Connect Balance Check */}
              {currentStep === 2 && (
                <div className="animate-fade-in space-y-6">
                  <h3 className="text-lg font-medium">Account Balance</h3>
                  
                  {balanceStatus === 'sufficient' ? (
                    <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-green-800">Sufficient Balance</p>
                        <p className="text-sm text-green-700">
                          You have sufficient balance in your account to process this contract.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-red-800">Insufficient Balance</p>
                        <p className="text-sm text-red-700 mb-2">
                          Your account balance is insufficient. Please add funds to proceed.
                        </p>
                        <Button className="bg-red-500 hover:bg-red-600 text-white">
                          Add Funds
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Step 3: Billing Summary */}
              {currentStep === 3 && (
                <div className="animate-fade-in space-y-6">
                  <h3 className="text-lg font-medium">Billing Summary</h3>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount</span>
                        <span className="font-medium">${totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Platform Fee</span>
                        <span className="font-medium text-gray-600">-${platformFee.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-gray-200 my-2 pt-2"></div>
                      <div className="flex justify-between">
                        <span className="font-medium">Amount to {contractData.toName}</span>
                        <span className="font-semibold text-brand-blue">${receiverAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500 bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <p>
                      The total amount of ${totalAmount.toFixed(2)} will be charged when you confirm sending this contract for review.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Step 4: Payment Type */}
              {currentStep === 4 && (
                <div className="animate-fade-in space-y-6">
                  <h3 className="text-lg font-medium">Payment Method</h3>
                  
                  <RadioGroup 
                    value={paymentType} 
                    onValueChange={(val) => {
                      setPaymentType(val as 'one-time' | 'partial');
                      if (val === 'one-time') {
                        setSelectedInterval('');
                      }
                    }}
                    className="space-y-4"
                  >
                    <div className="flex items-center space-x-2 border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-brand-blue transition-colors">
                      <RadioGroupItem value="one-time" id="one-time" />
                      <Label htmlFor="one-time" className="flex-1 cursor-pointer">
                        <div className="font-medium">One-time Payment</div>
                        <div className="text-sm text-gray-500">Pay the full amount now</div>
                      </Label>
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    
                    <div className="flex items-center space-x-2 border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-brand-blue transition-colors">
                      <RadioGroupItem value="partial" id="partial" />
                      <Label htmlFor="partial" className="flex-1 cursor-pointer">
                        <div className="font-medium">Partial Payment</div>
                        <div className="text-sm text-gray-500">Split your payments over time</div>
                      </Label>
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                  </RadioGroup>
                  
                  {paymentType === 'partial' && (
                    <div className="pt-2 animate-fade-in space-y-4">
                      <h4 className="font-medium text-gray-700">Choose a payment schedule</h4>
                      
                      <div className="space-y-4 mt-2">
                        {paymentIntervals.map((interval: PaymentInterval, index: number) => (
                          <PaymentSchedule
                            key={index}
                            interval={interval}
                            selected={selectedInterval === interval.PaymentFrequency}
                            onSelect={() => setSelectedInterval(interval.PaymentFrequency)}
                          />
                        ))}
                      </div>
                      
                      {!selectedInterval && (
                        <div className="text-sm text-amber-600 mt-2">
                          Please select a payment schedule to continue
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Footer - fixed at bottom */}
        {!showSuccess && (
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center mt-auto">
            <Button 
              variant="outline" 
              onClick={prevStep}
              className="border-gray-200"
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Button>
            
            <Button 
              onClick={nextStep}
              disabled={
                isSubmitting || 
                (currentStep === 4 && paymentType === 'partial' && !selectedInterval)
              }
              className="bg-brand-blue hover:bg-brand-blue-dark text-white min-w-[100px]"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing
                </div>
              ) : currentStep === 4 ? 'Complete' : 'Continue'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewPanel;
