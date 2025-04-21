import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../components/ui/use-toast';
import ContractStepper, { Step } from '../components/contract/ContractStepper';
import ContractSummary from '../components/contract/ContractSummary';
import ReviewPanel from '../components/contract/ReviewPanel';
import PaymentPlanDisplay from '../components/contract/PaymentPlanDisplay';
import EditContractModal from '../components/contract/EditContractModal';
import SignatureTab from '../components/contract/SignatureTab';
import HistoryTab from '../components/contract/HistoryTab';
import { cn } from '../lib/utils';
import { 
  Info, 
  Edit, 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  Save, 
  X, 
  User, 
  MapPin, 
  Clock, 
  FileText, 
  Paperclip, 
  History,
  MessageSquare,
  Send,
  FileSignature,
  PlayCircle,
  CheckCheck,
  UserRound,
  RefreshCw
} from 'lucide-react';
import { Contract, ContractHistoryItem, ContractParty, PaymentInterval, PaymentTranche } from '@/types/contract';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { format, addDays, addWeeks, addMonths } from 'date-fns';

const generatePaymentData = (
  frequency: 'Monthly' | 'Weekly' | 'Daily',
  startDateStr: string, 
  endDateStr: string, 
  totalAmount: number = 1000.00
): PaymentInterval => {
  let startDate: Date;
  let endDate: Date;
  
  try {
    startDate = new Date(startDateStr);
    endDate = new Date(endDateStr);
  } catch (e) {
    const startParts = startDateStr.split(',')[0].split(' ');
    const endParts = endDateStr.split(',')[0].split(' ');
    
    const monthMap: {[key: string]: number} = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    startDate = new Date(
      parseInt(startParts[2]), // year
      monthMap[startParts[0]], // month
      parseInt(startParts[1])  // day
    );
    
    endDate = new Date(
      parseInt(endParts[2]), // year
      monthMap[endParts[0]], // month
      parseInt(endParts[1])  // day
    );
  }
  
  const tranches: PaymentTranche[] = [];
  
  if (frequency === 'Monthly') {
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      tranches.push({
        DueDate: format(currentDate, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        Amount: {
          CurrencyCode: "USD",
          Value: 0
        },
        Status: "not_paid"
      });
      currentDate = addMonths(currentDate, 1);
    }
  } else if (frequency === 'Weekly') {
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      tranches.push({
        DueDate: format(currentDate, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        Amount: {
          CurrencyCode: "USD",
          Value: 0
        },
        Status: "not_paid"
      });
      currentDate = addWeeks(currentDate, 1);
    }
  } else if (frequency === 'Daily') {
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      tranches.push({
        DueDate: format(currentDate, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        Amount: {
          CurrencyCode: "USD",
          Value: 0
        },
        Status: "not_paid"
      });
      currentDate = addDays(currentDate, 1);
    }
  }
  
  if (tranches.length === 0) {
    tranches.push({
      DueDate: new Date().toISOString(),
      Amount: {
        CurrencyCode: "USD",
        Value: totalAmount
      },
      Status: "not_paid"
    });
  }
  
  const count = tranches.length;
  const baseAmount = parseFloat((totalAmount / count).toFixed(2));
  let remaining = totalAmount;
  
  for (let i = 0; i < count; i++) {
    if (i === count - 1) {
      tranches[i].Amount.Value = parseFloat(remaining.toFixed(2));
    } else {
      tranches[i].Amount.Value = baseAmount;
      remaining -= baseAmount;
    }
  }
  
  return {
    PaymentFrequency: frequency,
    Tranches: tranches
  };
};

const createInitialPaymentPlans = () => {
  const totalAmount = 1000.00;
  
  const startDate = 'Mar 18 2025, 1:58 PM';
  const endDate = 'Mar 25 2025, 1:58 PM';
  
  return {
    NeedPayableAmount: {
      CurrencyCode: "USD",
      Value: totalAmount
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
        PaymentOption: "Full" as const,
        PaymentIntervals: [
          generatePaymentData('Monthly', startDate, endDate),
          generatePaymentData('Weekly', startDate, endDate),
          generatePaymentData('Daily', startDate, endDate)
        ]
      }
    ]
  };
};

const Index = () => {
  const { toast } = useToast();
  const [isReviewPanelOpen, setIsReviewPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFromUser, setIsFromUser] = useState(true);
  const [selectedPaymentType, setSelectedPaymentType] = useState<'one-time' | 'partial' | undefined>(undefined);
  const [selectedPaymentFrequency, setSelectedPaymentFrequency] = useState<'Monthly' | 'Weekly' | 'Daily' | undefined>(undefined);
  const [editingSections, setEditingSections] = useState({
    from: false,
    to: false,
    place: false,
    time: false,
    rate: false,
    additionalDetails: false,
  });

  const [contractSteps, setContractSteps] = useState<Step[]>([
    { 
      id: 1, 
      name: 'Draft', 
      status: 'current' as const,
      description: 'Review contract details and sign',
      actionIcon: <div className="flex items-center text-xs text-blue-600"><FileSignature className="w-3 h-3 mr-1" /> Sign the contract</div>
    },
    { 
      id: 2, 
      name: 'Pending Review', 
      status: 'upcoming' as const,
      description: 'Waiting for other party to review'
    },
    { 
      id: 3, 
      name: 'Active', 
      status: 'upcoming' as const,
      description: 'Contract is active, ready to start'
    },
    { 
      id: 4, 
      name: 'In Progress', 
      status: 'upcoming' as const,
      description: 'Contract work in progress'
    },
    { 
      id: 5, 
      name: 'Pending Completion', 
      status: 'upcoming' as const,
      description: 'Waiting for completion approval'
    },
    { 
      id: 6, 
      name: 'Completed', 
      status: 'upcoming' as const,
      description: 'Contract successfully completed'
    },
  ]);

  const [contract, setContract] = useState<Contract>({
    id: 'c-12345',
    subject: 'Contract Template',
    type: 'Basic',
    facilitatedBy: 'Eveniopro',
    status: 'draft',
    progress: 25,
    from: {
      name: 'Sai Teja Kotagiri',
      email: 'samjose@gmail.com',
      rate: '',
      startDate: '',
      placeOfService: '',
      endDate: ''
    },
    to: {
      name: 'Mittu HIC',
      email: 'mittuhic@example.com',
      rate: '',
      startDate: '',
      placeOfService: '',
      endDate: ''
    },
    details: {
      placeOfService: 'Building number 220Hyderabad Telangana 50007',
      startDate: 'Mar 18 2025, 1:58 PM',
      endDate: 'Mar 25 2025, 1:58 PM',
      rate: 'USD 22/hour',
      mealsIncluded: true,
    },
    payment: createInitialPaymentPlans(),
    history: [],
    createdAt: '2023-09-10T10:00:00Z',
    updatedAt: '2023-09-10T10:00:00Z',
  });

  const [formState, setFormState] = useState({
    from: { ...contract.from },
    to: { ...contract.to },
    details: { ...contract.details },
  });

  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    section: {
      type: 'from' | 'to' | 'place' | 'duration' | 'rate';
      title: string;
      data: unknown;
    };
  }>({
    isOpen: false,
    section: {
      type: 'from',
      title: '',
      data: null
    }
  });

  useEffect(() => {
    if (selectedPaymentFrequency && contract) {
      const updatedInterval = generatePaymentData(
        selectedPaymentFrequency, 
        contract.details.startDate, 
        contract.details.endDate
      );
      
      const updatedPayment = { ...contract.payment! };
      
      const indexToUpdate = updatedPayment.PaymentPlans[0].PaymentIntervals.findIndex(
        interval => interval.PaymentFrequency === selectedPaymentFrequency
      );
      
      if (indexToUpdate !== -1) {
        updatedPayment.PaymentPlans[0].PaymentIntervals[indexToUpdate] = updatedInterval;
      } else {
        updatedPayment.PaymentPlans[0].PaymentIntervals.push(updatedInterval);
      }
      
      setContract(prev => ({
        ...prev,
        payment: updatedPayment
      }));
    }
  }, [selectedPaymentFrequency, contract.details, contract]);

  const handleEdit = (type: 'from' | 'to' | 'place' | 'duration' | 'rate', title: string, data: unknown) => {
    setEditModal({
      isOpen: true,
      section: {
        type,
        title,
        data
      }
    });
  };

  const handleSaveEdit = (data: ContractParty) => {
      switch (editModal.section.type) {
        case 'from':
          setContract(prev => ({ ...prev, from: data }));
          break;
      case 'to':
        setContract(prev => ({ ...prev, to: data }));
        break;
      case 'place':
        setContract(prev => ({ ...prev, details: { ...prev.details, placeOfService: data.placeOfService } }));
        break;
      case 'duration':
        setContract(prev => ({ ...prev, details: { ...prev.details, startDate: data.startDate, endDate: data.endDate } }));
        break;
      case 'rate':
        setContract(prev => ({ ...prev, details: { ...prev.details, rate: data.rate } }));
        break;
    }

    const historyItem: ContractHistoryItem = {
      id: `history-${Date.now()}`,
      date: new Date().toISOString(),
      action: `Edited ${editModal.section.title}`,
      user: isFromUser ? contract.from.name : contract.to.name,
    };
    
    setContract(prev => ({
      ...prev,
      history: [...(prev.history || []), historyItem]
    }));

    toast({
      title: "Changes Saved",
      description: `${editModal.section.title} has been updated.`,
    });
  };

  const handleSign = (signature: string) => {
    setContract(prev => ({
      ...prev,
      [isFromUser ? 'from' : 'to']: {
        ...prev[isFromUser ? 'from' : 'to'],
        signature
      }
    }));
    
    const historyItem: ContractHistoryItem = {
      id: `history-${Date.now()}`,
      date: new Date().toISOString(),
      action: 'Contract Signed',
      user: isFromUser ? contract.from.name : contract.to.name,
      notes: `Signed by ${isFromUser ? 'From' : 'To'} party`
    };
    
    setContract(prev => ({
      ...prev,
      history: [...(prev.history || []), historyItem]
    }));

    if (!isFromUser && contract.status === 'pending_review') {
      setContract(prev => ({
        ...prev,
        status: 'active',
        progress: 60
      }));
    }

    toast({
      title: "Contract Signed",
      description: "Your signature has been added to the contract.",
    });
    
    updateStepperStatus();
  };

  const handleSendForReview = () => {
    if (isFromUser && !contract.from.signature) {
      toast({
        title: "Signature Required",
        description: "Please sign the contract before sending for review.",
        variant: "destructive"
      });
      setActiveTab('signature');
      return;
    }
    
    setIsReviewPanelOpen(true);
  };

  const handleReviewComplete = (data: unknown) => {
    const updatedPayment = { ...contract.payment! };
    
    setContract({
      ...contract,
      status: 'pending_review',
      progress: 40,
      payment: updatedPayment
    });
    
    const historyItem: ContractHistoryItem = {
      id: `history-${Date.now()}`,
      date: new Date().toISOString(),
      action: 'Contract Sent for Review',
      user: isFromUser ? contract.from.name : contract.to.name,
    };
    
    setContract(prev => ({
      ...prev,
      history: [...(prev.history || []), historyItem]
    }));
    
    setIsReviewPanelOpen(false);
    
    toast({
      title: "Contract Sent for Review",
      description: `Your contract has been sent to ${contract.to.name} for review.`,
    });
    
    updateStepperStatus();
  };

  const handleStartContract = () => {
    if (contract.status !== 'active') {
      return;
    }
    
    setContract(prev => ({
      ...prev,
      status: 'in_progress',
      progress: 75
    }));
    
    const historyItem: ContractHistoryItem = {
      id: `history-${Date.now()}`,
      date: new Date().toISOString(),
      action: 'Contract Started',
      user: isFromUser ? contract.from.name : contract.to.name,
    };
    
    setContract(prev => ({
      ...prev,
      history: [...(prev.history || []), historyItem]
    }));
    
    toast({
      title: "Contract Started",
      description: "The contract has been marked as In Progress.",
    });
    
    updateStepperStatus();
  };

  const handleSavePaymentMethod = () => {
    if (!selectedPaymentType) {
      toast({
        title: "Selection Required",
        description: "Please select a payment type.",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedPaymentType === 'partial' && !selectedPaymentFrequency) {
      toast({
        title: "Selection Required",
        description: "Please select a payment frequency.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedPayment = { ...contract.payment! };
    updatedPayment.selectedPaymentType = selectedPaymentType;
    updatedPayment.selectedPaymentFrequency = selectedPaymentType === 'partial' ? selectedPaymentFrequency : undefined;
    
    setContract(prev => ({
      ...prev,
      payment: updatedPayment
    }));
    
    toast({
      title: "Payment Method Saved",
      description: "Your payment method has been saved successfully.",
    });
  };

  const handleDeleteContract = () => {
    toast({
      title: "Contract Deleted",
      description: "The contract has been deleted successfully.",
      variant: "destructive",
    });
  };

  const handleDownloadPdf = () => {
    toast({
      title: "Downloading PDF",
      description: "Your contract PDF is being downloaded.",
    });
  };

  const getPaymentIntervalDetails = (frequency?: string) => {
    if (!frequency || !contract.payment) return null;
    
    const paymentInterval = contract.payment.PaymentPlans[0].PaymentIntervals.find(
      interval => interval.PaymentFrequency === frequency
    );
    
    return paymentInterval;
  };

  const selectedPaymentInterval = getPaymentIntervalDetails(contract.payment?.selectedPaymentFrequency);

  const handleRequestPayment = (trancheIndex: number) => {
    if (!selectedPaymentInterval) return;
    
    const updatedContract = { ...contract };
    if (!updatedContract.payment) return;
    
    const intervalIndex = updatedContract.payment.PaymentPlans[0].PaymentIntervals.findIndex(
      interval => interval.PaymentFrequency === updatedContract.payment?.selectedPaymentFrequency
    );
    
    if (intervalIndex === -1) return;
    
    updatedContract.payment.PaymentPlans[0].PaymentIntervals[intervalIndex].Tranches[trancheIndex].Status = 'requested';
    updatedContract.payment.PaymentPlans[0].PaymentIntervals[intervalIndex].Tranches[trancheIndex].RequestDate = new Date().toISOString();
    
    setContract(updatedContract);
    
    toast({
      title: "Payment Requested",
      description: `Payment request has been sent to ${contract.from.name}.`,
    });
  };

  const handleApprovePayment = (trancheIndex: number) => {
    if (!selectedPaymentInterval) return;
    
    const updatedContract = { ...contract };
    if (!updatedContract.payment) return;
    
    const intervalIndex = updatedContract.payment.PaymentPlans[0].PaymentIntervals.findIndex(
      interval => interval.PaymentFrequency === updatedContract.payment?.selectedPaymentFrequency
    );
    
    if (intervalIndex === -1) return;
    
    updatedContract.payment.PaymentPlans[0].PaymentIntervals[intervalIndex].Tranches[trancheIndex].Status = 'paid';
    updatedContract.payment.PaymentPlans[0].PaymentIntervals[intervalIndex].Tranches[trancheIndex].PaymentDate = new Date().toISOString();
    
    setContract(updatedContract);
    
    toast({
      title: "Payment Successful",
      description: `Your payment has been processed successfully.`,
    });
  };

  const handleCancelPayment = (trancheIndex: number) => {
    if (!selectedPaymentInterval) return;
    
    const updatedContract = { ...contract };
    if (!updatedContract.payment) return;
    
    const intervalIndex = updatedContract.payment.PaymentPlans[0].PaymentIntervals.findIndex(
      interval => interval.PaymentFrequency === updatedContract.payment?.selectedPaymentFrequency
    );
    
    if (intervalIndex === -1) return;
    
    updatedContract.payment.PaymentPlans[0].PaymentIntervals[intervalIndex].Tranches[trancheIndex].Status = 'cancelled';
    
    setContract(updatedContract);
    
    toast({
      title: "Payment Cancelled",
      description: `You have cancelled the payment request.`,
      variant: "destructive",
    });
  };

  const toggleEditSection = (section: keyof typeof editingSections) => {
    if (editingSections[section]) {
      setContract(prev => ({
        ...prev,
        from: section === 'from' ? formState.from : prev.from,
        to: section === 'to' ? formState.to : prev.to,
        details: {
          ...prev.details,
          placeOfService: section === 'place' ? formState.details.placeOfService : prev.details.placeOfService,
          startDate: section === 'time' ? formState.details.startDate : prev.details.startDate,
          endDate: section === 'time' ? formState.details.endDate : prev.details.endDate,
          rate: section === 'rate' ? formState.details.rate : prev.details.rate,
          mealsIncluded: section === 'additionalDetails' ? formState.details.mealsIncluded : prev.details.mealsIncluded,
        }
      }));
      
      toast({
        title: "Changes Saved",
        description: `${section.charAt(0).toUpperCase() + section.slice(1)} section has been updated.`,
      });
    } else {
      setFormState({
        from: { ...contract.from },
        to: { ...contract.to },
        details: { ...contract.details },
      });
    }
    
    setEditingSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFormChange = (
    section: 'from' | 'to' | 'details',
    field: string,
    value: string | boolean
  ) => {
    setFormState(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateStepperStatus = useCallback(() => {
    const newSteps = [...contractSteps];
    
    newSteps.forEach(step => {
      step.status = 'upcoming';
    });
    
    switch(contract.status) {
      case 'draft':
        newSteps[0].status = 'current';
        newSteps[0].description = 'Review contract details and sign';
        newSteps[0].actionIcon = contract.from.signature ? 
          <Badge variant="outline" className={cn("bg-green-50 text-green-600 border-green-200")}>
            <CheckCheck className="w-3 h-3 mr-1" /> Signed
          </Badge> :
          <div className="flex items-center text-xs text-blue-600">
            <FileSignature className="w-3 h-3 mr-1" /> Sign the contract
          </div>;
        break;
      case 'pending_review':
        newSteps[0].status = 'completed';
        newSteps[1].status = 'current';
        newSteps[1].description = isFromUser ? 
          'Waiting for other party to review' : 
          'Review contract details and sign';
        newSteps[1].actionIcon = !isFromUser ? 
          <div className="flex items-center text-xs text-blue-600">
            <FileSignature className="w-3 h-3 mr-1" /> Sign the contract
          </div> : undefined;
        break;
      case 'active':
        newSteps[0].status = 'completed';
        newSteps[1].status = 'completed';
        newSteps[2].status = 'current';
        newSteps[2].description = 'Contract is signed by both parties';
        newSteps[2].actionIcon = isFromUser ?
          <div className="flex items-center text-xs text-blue-600">
            <PlayCircle className="w-3 h-3 mr-1" /> Start Contract
          </div> : undefined;
        break;
      case 'in_progress':
        newSteps[0].status = 'completed';
        newSteps[1].status = 'completed';
        newSteps[2].status = 'completed';
        newSteps[3].status = 'current';
        break;
      case 'pending_completion':
        newSteps[0].status = 'completed';
        newSteps[1].status = 'completed';
        newSteps[2].status = 'completed';
        newSteps[3].status = 'completed';
        newSteps[4].status = 'current';
        break;
      case 'completed':
        newSteps[0].status = 'completed';
        newSteps[1].status = 'completed';
        newSteps[2].status = 'completed';
        newSteps[3].status = 'completed';
        newSteps[4].status = 'completed';
        newSteps[5].status = 'current';
        break;
    }
    
    setContractSteps(newSteps);
  });

  const isSendForReviewEnabled = () => {
    if (isFromUser) {
      return !!contract.from.signature;
    }
    return false;
  };

  const toggleUserView = () => {
    setIsFromUser(!isFromUser);
    toast({
      title: `Switched to ${!isFromUser ? 'FROM' : 'TO'} User View`,
      description: `You are now viewing the contract as ${!isFromUser ? contract.from.name : contract.to.name}.`,
    });
    
    updateStepperStatus();
  };

  const showStartContractButton = isFromUser && contract.status === 'active';

  const isContractEditable = isFromUser && contract.status === 'draft';

  useEffect(() => {
    updateStepperStatus();
  }, [contract.status, updateStepperStatus]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container flex justify-between items-center h-16 px-4 md:px-6">
          <div className="flex items-center">
            <a href="/" className="text-xl font-bold text-blue-600">
              Eveniopro
            </a>
          </div>
          
          <div className="flex gap-4 items-center">
            <a href="/offers" className="flex items-center px-3 py-1.5 text-sm">
              Offers
            </a>
            <a href="/home" className="flex items-center px-3 py-1.5 text-sm">
              Home
            </a>
            <a href="/dashboard" className="flex items-center px-3 py-1.5 text-sm">
              Dashboard
            </a>
            <div className="ml-4 relative flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                ST
              </div>
              <span className="text-sm">Sai Teja</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8 md:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Contract</h1>
            <Badge variant="outline" className="text-blue-800 bg-blue-50 border-blue-200">
              {contract.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={toggleUserView}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Switch to {isFromUser ? 'TO' : 'FROM'} User
            </Button>
            
            {contract.status === 'active' && isFromUser && (
              <Button 
                onClick={handleStartContract}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Start Contract
              </Button>
            )}
            
            <Button 
              onClick={handleSendForReview}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!(isFromUser && contract.status === 'draft')}
            >
              <Send className="w-4 h-4 mr-2" />
              Send for Review
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-3">
            <div className="sticky top-24 bg-white rounded-lg shadow-soft border border-gray-100 p-8">
              <ContractStepper steps={contractSteps} />
            </div>
          </div>

          <div className="col-span-9">
            {contract.status === 'draft' && isFromUser && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start mb-8 animate-fade-in">
                <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-blue-800 font-medium">Confirm the details, add your signature and send for review.</p>
                  <p className="text-sm text-blue-600">
                    Please review all contract details carefully before sending it for review.
                  </p>
                </div>
              </div>
            )}
            
            {contract.status === 'pending_review' && !isFromUser && (
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-start mb-8 animate-fade-in">
                <Info className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-amber-800 font-medium">Contract is pending your review.</p>
                  <p className="text-sm text-amber-600">
                    Please review the contract details and add your signature to activate the contract.
                  </p>
                </div>
              </div>
            )}
            
            {contract.status === 'active' && (
              <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-start mb-8 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-green-800 font-medium">Contract is active and ready to start.</p>
                  <p className="text-sm text-green-600">
                    Both parties have signed the contract. {isFromUser ? "You can now start the contract." : "Waiting for the contract to be started."}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4 grid grid-cols-6 gap-2 bg-gray-100 p-1">
                  <TabsTrigger value="overview">
                    <FileText className="w-4 h-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="payments">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Payments
                  </TabsTrigger>
                  <TabsTrigger value="signature">
                    <Edit className="w-4 h-4 mr-2" />
                    Signature
                  </TabsTrigger>
                  <TabsTrigger value="files">
                    <Paperclip className="w-4 h-4 mr-2" />
                    Files
                  </TabsTrigger>
                  <TabsTrigger value="chat">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="history">
                    <History className="w-4 h-4 mr-2" />
                    History
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6 animate-fade-in">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg font-medium">Contract Overview</CardTitle>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ContractSummary 
                        contract={contract}
                        onEdit={isContractEditable ? handleEdit : undefined}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="payments" className="space-y-6 animate-fade-in">
                  {(contract.status === 'draft' && isFromUser) && (
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle>Payment Method</CardTitle>
                        <CardDescription>Select how you would like to pay for this contract</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <Label>Payment Type</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div 
                              className={cn(
                                "p-4 border rounded-lg cursor-pointer",
                                selectedPaymentType === 'one-time' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                              )}
                              onClick={() => setSelectedPaymentType('one-time')}
                            >
                              <div className="flex items-center">
                                <div className={cn(
                                  "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                  selectedPaymentType === 'one-time' ? 'border-blue-500' : 'border-gray-300'
                                )}>
                                  {selectedPaymentType === 'one-time' && (
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                  )}
                                </div>
                                <span className="ml-2 font-medium">One-time Payment</span>
                              </div>
                              <p className="text-sm text-gray-500 mt-2">Pay the full amount at once</p>
                            </div>
                            
                            <div 
                              className={cn(
                                "p-4 border rounded-lg cursor-pointer",
                                selectedPaymentType === 'partial' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                              )}
                              onClick={() => setSelectedPaymentType('partial')}
                            >
                              <div className="flex items-center">
                                <div className={cn(
                                  "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                  selectedPaymentType === 'partial' ? 'border-blue-500' : 'border-gray-300'
                                )}>
                                  {selectedPaymentType === 'partial' && (
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                  )}
                                </div>
                                <span className="ml-2 font-medium">Partial Payments</span>
                              </div>
                              <p className="text-sm text-gray-500 mt-2">Split your payments over time</p>
                            </div>
                          </div>
                        </div>
                        
                        {selectedPaymentType === 'partial' && (
                          <div className="space-y-4 animate-in fade-in-50 slide-in-from-top-5 duration-200">
                            <Label>Payment Frequency</Label>
                            <Select
                              value={selectedPaymentFrequency}
                              onValueChange={(value) => setSelectedPaymentFrequency(value as 'Monthly' | 'Weekly' | 'Daily')}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Monthly">Monthly</SelectItem>
                                <SelectItem value="Weekly">Weekly</SelectItem>
                                <SelectItem value="Daily">Daily</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        
                        <Button onClick={handleSavePaymentMethod} className="w-full">
                          Save Payment Method
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                  
                  <PaymentPlanDisplay 
                    paymentType={contract.payment?.selectedPaymentType}
                    paymentFrequency={contract.payment?.selectedPaymentFrequency}
                    interval={getPaymentIntervalDetails(contract.payment?.selectedPaymentFrequency)}
                    isFromUser={isFromUser}
                    onRequestPayment={handleRequestPayment}
                    onApprovePayment={handleApprovePayment}
                    onCancelPayment={handleCancelPayment}
                  />
                </TabsContent>
                
                <TabsContent value="signature" className="space-y-6 animate-fade-in">
                  <SignatureTab
                    contract={contract}
                    isFromUser={isFromUser}
                    onSign={handleSign}
                  />
                </TabsContent>
                
                <TabsContent value="files" className="space-y-6 animate-fade-in">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contract Files</CardTitle>
                      <CardDescription>View and manage contract documents</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 border border-dashed rounded-lg">
                        <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Drag and drop files here or click to browse</p>
                        <Button variant="outline" className="mt-4">Add Files</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="chat" className="space-y-6 animate-fade-in">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contract Discussion</CardTitle>
                      <CardDescription>Chat with other parties involved in this contract</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg">
                        <p className="text-gray-500">Chat feature coming soon</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="history" className="space-y-6 animate-fade-in">
                  <HistoryTab history={contract.history} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <ReviewPanel 
        isOpen={isReviewPanelOpen}
        onClose={() => setIsReviewPanelOpen(false)}
        onComplete={handleReviewComplete}
        contractData={{
          fromName: contract.from.name,
          toName: contract.to.name,
          rate: contract.details.rate,
        }}
      />
      
      <EditContractModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal(prev => ({ ...prev, isOpen: false }))}
        onSave={handleSaveEdit}
        section={editModal.section}
      />
    </div>
  );
};

export default Index;
