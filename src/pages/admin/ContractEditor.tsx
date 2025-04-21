
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '../../components/ui/use-toast';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from '../../components/ui/form';
import { Contract, ContractParty, ContractDetails, PaymentInterval, PaymentTranche } from '../../types/contract';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronRight, Save, Trash, Users, FileText, CalendarDays, DollarSign, History, Paperclip } from 'lucide-react';

const getMockContract = (): Contract => ({
  id: 'c-12345',
  subject: 'Contract Template',
  type: 'Basic',
  facilitatedBy: 'Eveniopro',
  status: 'draft',
  progress: 25,
  from: {
    name: 'Sai Teja Kotagiri',
    email: 'samjose@gmail.com',
    endDate: '',
    rate: '',
    startDate: '',
    placeOfService: ''
  },
  to: {
    name: 'Mittu HIC',
    email: 'mittuhic@example.com',
    endDate: '',
    rate: '',
    startDate: '',
    placeOfService: ''
  },
  details: {
    placeOfService: 'Building number 220Hyderabad Telangana 50007',
    startDate: 'Mar 18 2025, 1:58 PM',
    endDate: 'Mar 25 2025, 1:58 PM',
    rate: 'USD 22/hour',
    mealsIncluded: true,
  },
  payment: {
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
                },
                Status: "not_paid"
              },
              {
                DueDate: "2025-05-01T00:00:00Z",
                Amount: {
                  CurrencyCode: "USD",
                  Value: 500.00
                },
                Status: "not_paid"
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
                },
                Status: "not_paid"
              },
              {
                DueDate: "2025-04-14T00:00:00Z",
                Amount: {
                  CurrencyCode: "USD",
                  Value: 250.00
                },
                Status: "not_paid"
              },
              {
                DueDate: "2025-04-21T00:00:00Z",
                Amount: {
                  CurrencyCode: "USD",
                  Value: 250.00
                },
                Status: "not_paid"
              },
              {
                DueDate: "2025-04-28T00:00:00Z",
                Amount: {
                  CurrencyCode: "USD",
                  Value: 250.00
                },
                Status: "not_paid"
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
                },
                Status: "not_paid"
              },
              {
                DueDate: "2025-04-02T00:00:00Z",
                Amount: {
                  CurrencyCode: "USD",
                  Value: 50.00
                },
                Status: "not_paid"
              },
              {
                DueDate: "2025-04-03T00:00:00Z",
                Amount: {
                  CurrencyCode: "USD",
                  Value: 50.00
                },
                Status: "not_paid"
              }
            ]
          }
        ]
      }
    ],
    selectedPaymentType: "partial",
    selectedPaymentFrequency: "Monthly"
  },
  createdAt: '2023-09-10T10:00:00Z',
  updatedAt: '2023-09-10T10:00:00Z',
});

const AdminContractEditor = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [contract, setContract] = useState<Contract>(getMockContract());
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM d, yyyy, h:mm a');
    } catch (e) {
      return dateStr;
    }
  };

  const handleSaveChanges = () => {
    toast({
      title: "Changes Saved",
      description: `Contract #${contract.id} has been updated successfully.`,
    });
    setIsEditing(false);
  };

  const handleStatusChange = (newStatus: Contract['status']) => {
    setContract(prev => ({
      ...prev,
      status: newStatus,
      updatedAt: new Date().toISOString()
    }));
    
    toast({
      title: "Status Updated",
      description: `Contract status changed to ${newStatus.replace('_', ' ').toUpperCase()}.`,
    });
  };

  const handlePaymentFrequencyChange = (frequency: 'Monthly' | 'Weekly' | 'Daily') => {
    if (!contract.payment) return;
    
    setContract(prev => ({
      ...prev,
      payment: {
        ...prev.payment!,
        selectedPaymentFrequency: frequency
      },
      updatedAt: new Date().toISOString()
    }));
    
    toast({
      title: "Payment Plan Updated",
      description: `Payment frequency changed to ${frequency}.`,
    });
  };

  const handleTrancheStatusChange = (intervalFrequency: string, trancheIndex: number, newStatus: 'not_paid' | 'requested' | 'paid' | 'cancelled') => {
    if (!contract.payment) return;
    
    const updatedContract = { ...contract };
    const intervalIndex = updatedContract.payment?.PaymentPlans[0].PaymentIntervals.findIndex(
      interval => interval.PaymentFrequency === intervalFrequency
    );
    
    if (intervalIndex === -1 || intervalIndex === undefined) return;
    
    if (updatedContract.payment) {
      if (updatedContract.payment.PaymentPlans[0].PaymentIntervals[intervalIndex] && updatedContract.payment.PaymentPlans[0].PaymentIntervals[intervalIndex].Tranches[trancheIndex]) {
        updatedContract.payment.PaymentPlans[0].PaymentIntervals[intervalIndex].Tranches[trancheIndex].Status = newStatus;
      }
    }
    
    if (newStatus === 'requested') {
      if (updatedContract.payment) {
        updatedContract.payment.PaymentPlans[0].PaymentIntervals[intervalIndex].Tranches[trancheIndex].RequestDate = new Date().toISOString();
      }
    } else if (newStatus === 'paid') {
      if (updatedContract.payment) {
        updatedContract.payment.PaymentPlans[0].PaymentIntervals[intervalIndex].Tranches[trancheIndex].PaymentDate = new Date().toISOString();
      }
    }
    
    updatedContract.updatedAt = new Date().toISOString();
    setContract(updatedContract);
    
    toast({
      title: "Payment Status Updated",
      description: `Tranche #${trancheIndex + 1} status changed to ${newStatus.replace('_', ' ')}.`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container flex justify-between items-center h-16 px-4 md:px-6">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
              Eveniopro Admin
            </Link>
          </div>
          
          <div className="flex gap-4 items-center">
            <Link to="/admin/dashboard" className="flex items-center px-3 py-1.5 text-sm">
              Dashboard
            </Link>
            <Link to="/admin/contracts" className="flex items-center px-3 py-1.5 text-sm font-medium text-blue-600">
              Contracts
            </Link>
            <Link to="/admin/users" className="flex items-center px-3 py-1.5 text-sm">
              Users
            </Link>
            <div className="ml-4 relative flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium">
                AD
              </div>
              <span className="text-sm">Admin</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8 md:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Link to="/admin/contracts" className="text-sm text-gray-500 hover:text-gray-800">
                Contracts
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium">Contract #{id}</span>
            </div>
            <h1 className="text-2xl font-semibold mt-2">Admin Contract Editor</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to={`/contracts/${id}`} className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50">
              View Public Page
            </Link>
            <Button onClick={handleSaveChanges} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Contract Information</CardTitle>
                <CardDescription>Admin editor view</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Contract ID</p>
                  <p className="font-medium">{contract.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">{formatDate(contract.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{formatDate(contract.updatedAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Select 
                    defaultValue={contract.status}
                    onValueChange={(value) => handleStatusChange(value as Contract['status'])}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">DRAFT</SelectItem>
                      <SelectItem value="pending_review">PENDING REVIEW</SelectItem>
                      <SelectItem value="active">ACTIVE</SelectItem>
                      <SelectItem value="in_progress">IN PROGRESS</SelectItem>
                      <SelectItem value="pending_completion">PENDING COMPLETION</SelectItem>
                      <SelectItem value="completed">COMPLETED</SelectItem>
                      <SelectItem value="cancelled">CANCELLED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-muted-foreground">Progress</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${contract.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>0%</span>
                    <span>{contract.progress}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="destructive" className="w-full">
                  <Trash className="w-4 h-4 mr-2" />
                  Delete Contract
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-5 mb-6">
                <TabsTrigger value="general">
                  <FileText className="w-4 h-4 mr-2" />
                  General
                </TabsTrigger>
                <TabsTrigger value="parties">
                  <Users className="w-4 h-4 mr-2" />
                  Parties
                </TabsTrigger>
                <TabsTrigger value="details">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="payments">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Payments
                </TabsTrigger>
                <TabsTrigger value="attachments">
                  <Paperclip className="w-4 h-4 mr-2" />
                  Attachments
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>General Information</CardTitle>
                    <CardDescription>Update basic contract information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="subject">Contract Subject</Label>
                        <Input 
                          id="subject" 
                          value={contract.subject} 
                          onChange={(e) => setContract({...contract, subject: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">Contract Type</Label>
                        <Select 
                          defaultValue={contract.type}
                          onValueChange={(value) => setContract({...contract, type: value})}
                        >
                          <SelectTrigger id="type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Basic">Basic</SelectItem>
                            <SelectItem value="Premium">Premium</SelectItem>
                            <SelectItem value="Custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facilitatedBy">Facilitated By</Label>
                      <Input 
                        id="facilitatedBy" 
                        value={contract.facilitatedBy} 
                        onChange={(e) => setContract({...contract, facilitatedBy: e.target.value})}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="parties">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>From Party</CardTitle>
                      <CardDescription>Contract initiator details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fromName">Name</Label>
                        <Input 
                          id="fromName" 
                          value={contract.from.name} 
                          onChange={(e) => setContract({
                            ...contract, 
                            from: {...contract.from, name: e.target.value}
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fromEmail">Email</Label>
                        <Input 
                          id="fromEmail" 
                          type="email"
                          value={contract.from.email} 
                          onChange={(e) => setContract({
                            ...contract, 
                            from: {...contract.from, email: e.target.value}
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fromOrganization">Organization</Label>
                        <Input 
                          id="fromOrganization" 
                          value={contract.from.organization || ''} 
                          onChange={(e) => setContract({
                            ...contract, 
                            from: {...contract.from, organization: e.target.value}
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fromAddress">Address</Label>
                        <Textarea 
                          id="fromAddress" 
                          value={contract.from.address || ''} 
                          onChange={(e) => setContract({
                            ...contract, 
                            from: {...contract.from, address: e.target.value}
                          })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>To Party</CardTitle>
                      <CardDescription>Contract recipient details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="toName">Name</Label>
                        <Input 
                          id="toName" 
                          value={contract.to.name} 
                          onChange={(e) => setContract({
                            ...contract, 
                            to: {...contract.to, name: e.target.value}
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="toEmail">Email</Label>
                        <Input 
                          id="toEmail" 
                          type="email"
                          value={contract.to.email} 
                          onChange={(e) => setContract({
                            ...contract, 
                            to: {...contract.to, email: e.target.value}
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="toOrganization">Organization</Label>
                        <Input 
                          id="toOrganization" 
                          value={contract.to.organization || ''} 
                          onChange={(e) => setContract({
                            ...contract, 
                            to: {...contract.to, organization: e.target.value}
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="toAddress">Address</Label>
                        <Textarea 
                          id="toAddress" 
                          value={contract.to.address || ''} 
                          onChange={(e) => setContract({
                            ...contract, 
                            to: {...contract.to, address: e.target.value}
                          })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Contract Details</CardTitle>
                    <CardDescription>Service and timeline information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="placeOfService">Place of Service</Label>
                      <Textarea 
                        id="placeOfService" 
                        value={contract.details.placeOfService} 
                        onChange={(e) => setContract({
                          ...contract, 
                          details: {...contract.details, placeOfService: e.target.value}
                        })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input 
                          id="startDate" 
                          value={contract.details.startDate} 
                          onChange={(e) => setContract({
                            ...contract, 
                            details: {...contract.details, startDate: e.target.value}
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input 
                          id="endDate" 
                          value={contract.details.endDate} 
                          onChange={(e) => setContract({
                            ...contract, 
                            details: {...contract.details, endDate: e.target.value}
                          })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rate">Rate</Label>
                      <Input 
                        id="rate" 
                        value={contract.details.rate} 
                        onChange={(e) => setContract({
                          ...contract, 
                          details: {...contract.details, rate: e.target.value}
                        })}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="mealsIncluded" 
                        checked={contract.details.mealsIncluded}
                        onCheckedChange={(checked) => setContract({
                          ...contract, 
                          details: {...contract.details, mealsIncluded: checked}
                        })}
                      />
                      <Label htmlFor="mealsIncluded">Meals Included</Label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="additionalDetails">Additional Details</Label>
                      <Textarea 
                        id="additionalDetails" 
                        value={contract.details.additionalDetails || ''} 
                        onChange={(e) => setContract({
                          ...contract, 
                          details: {...contract.details, additionalDetails: e.target.value}
                        })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="payments">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Configuration</CardTitle>
                    <CardDescription>Manage payment details and schedule</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Payment Type</Label>
                        <Select 
                          defaultValue={contract.payment?.selectedPaymentType || 'one-time'} 
                          onValueChange={(value) => setContract({
                            ...contract, 
                            payment: {
                              ...contract.payment!,
                              selectedPaymentType: value as 'one-time' | 'partial'
                            }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="one-time">One-time Payment</SelectItem>
                            <SelectItem value="partial">Partial Payment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {contract.payment?.selectedPaymentType === 'partial' && (
                        <div className="space-y-2">
                          <Label>Payment Frequency</Label>
                          <Select 
                            defaultValue={contract.payment.selectedPaymentFrequency || 'Monthly'} 
                            onValueChange={(value) => handlePaymentFrequencyChange(value as 'Monthly' | 'Weekly' | 'Daily')}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Monthly">Monthly</SelectItem>
                              <SelectItem value="Weekly">Weekly</SelectItem>
                              <SelectItem value="Daily">Daily</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    
                    {contract.payment?.selectedPaymentType === 'partial' && contract.payment.selectedPaymentFrequency && (
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-100 p-3 border-b font-medium flex justify-between items-center">
                          <span>{contract.payment.selectedPaymentFrequency} Payment Schedule</span>
                          <span>Total: {contract.payment.NeedPayableAmount.CurrencyCode} {contract.payment.NeedPayableAmount.Value.toFixed(2)}</span>
                        </div>
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
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {contract.payment.PaymentPlans[0].PaymentIntervals
                              .find(interval => interval.PaymentFrequency === contract.payment?.selectedPaymentFrequency)
                              ?.Tranches.map((tranche, index) => (
                                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    <Input 
                                      type="date" 
                                      defaultValue={new Date(tranche.DueDate).toISOString().split('T')[0]}
                                      onChange={(e) => {
                                        const updatedContract = { ...contract };
                                        const intervalIndex = updatedContract.payment!.PaymentPlans[0].PaymentIntervals.findIndex(
                                          interval => interval.PaymentFrequency === contract.payment?.selectedPaymentFrequency
                                        );
                                        if (intervalIndex === -1) return;
                                        updatedContract.payment!.PaymentPlans[0].PaymentIntervals[intervalIndex].Tranches[index].DueDate = 
                                          new Date(e.target.value).toISOString();
                                        setContract(updatedContract);
                                      }}
                                    />
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    <div className="flex items-center">
                                      <Input 
                                        type="number"
                                        value={tranche.Amount.Value}
                                        onChange={(e) => {
                                          const updatedContract = { ...contract };
                                          const intervalIndex = updatedContract.payment!.PaymentPlans[0].PaymentIntervals.findIndex(
                                            interval => interval.PaymentFrequency === contract.payment?.selectedPaymentFrequency
                                          );
                                          if (intervalIndex === -1) return;
                                          updatedContract.payment!.PaymentPlans[0].PaymentIntervals[intervalIndex].Tranches[index].Amount.Value = 
                                            parseFloat(e.target.value);
                                          setContract(updatedContract);
                                        }}
                                      />
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <Select 
                                      defaultValue={tranche.Status || 'not_paid'} 
                                      onValueChange={(value) => handleTrancheStatusChange(
                                        contract.payment!.selectedPaymentFrequency!,
                                        index,
                                        value as 'not_paid' | 'requested' | 'paid' | 'cancelled'
                                      )}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="not_paid">Not Paid</SelectItem>
                                        <SelectItem value="requested">Requested</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <Button 
                                      variant="destructive" 
                                      size="sm"
                                      onClick={() => {
                                        const updatedContract = { ...contract };
                                        const intervalIndex = updatedContract.payment!.PaymentPlans[0].PaymentIntervals.findIndex(
                                          interval => interval.PaymentFrequency === contract.payment?.selectedPaymentFrequency
                                        );
                                        if (intervalIndex === -1) return;
                                        
                                        if (updatedContract.payment!.PaymentPlans[0].PaymentIntervals[intervalIndex].Tranches.length > 1) {
                                          updatedContract.payment!.PaymentPlans[0].PaymentIntervals[intervalIndex].Tranches.splice(index, 1);
                                          setContract(updatedContract);
                                          toast({
                                            title: "Tranche Removed",
                                            description: `Payment tranche has been removed.`,
                                          });
                                        } else {
                                          toast({
                                            title: "Cannot Remove",
                                            description: `At least one payment tranche must exist.`,
                                            variant: "destructive"
                                          });
                                        }
                                      }}
                                    >
                                      <Trash className="w-4 h-4" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                        <div className="p-3 border-t bg-gray-50">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const updatedContract = { ...contract };
                              const intervalIndex = updatedContract.payment!.PaymentPlans[0].PaymentIntervals.findIndex(
                                interval => interval.PaymentFrequency === contract.payment?.selectedPaymentFrequency
                              );
                              if (intervalIndex === -1) return;
                              
                              const tranches = updatedContract.payment!.PaymentPlans[0].PaymentIntervals[intervalIndex].Tranches;
                              const lastTranche = tranches[tranches.length - 1];
                              
                              const newDueDate = new Date(lastTranche.DueDate);
                              if (contract.payment!.selectedPaymentFrequency === 'Daily') {
                                newDueDate.setDate(newDueDate.getDate() + 1);
                              } else if (contract.payment!.selectedPaymentFrequency === 'Weekly') {
                                newDueDate.setDate(newDueDate.getDate() + 7);
                              } else if (contract.payment!.selectedPaymentFrequency === 'Monthly') {
                                newDueDate.setMonth(newDueDate.getMonth() + 1);
                              }
                              
                              const newTranche: PaymentTranche = {
                                DueDate: newDueDate.toISOString(),
                                Amount: {
                                  CurrencyCode: lastTranche.Amount.CurrencyCode,
                                  Value: lastTranche.Amount.Value
                                },
                                Status: 'not_paid'
                              };
                              
                              updatedContract.payment!.PaymentPlans[0].PaymentIntervals[intervalIndex].Tranches.push(newTranche);
                              setContract(updatedContract);
                              
                              toast({
                                title: "Tranche Added",
                                description: `New payment tranche has been added.`,
                              });
                            }}
                          >
                            Add Payment Tranche
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Platform Fee (From Need)</Label>
                        <div className="flex">
                          <Input 
                            value={contract.payment?.PlatformFee.FromNeed.Value} 
                            onChange={(e) => {
                              if (!contract.payment) return;
                              const value = parseFloat(e.target.value);
                              if (isNaN(value)) return;
                              
                              setContract({
                                ...contract,
                                payment: {
                                  ...contract.payment,
                                  PlatformFee: {
                                    ...contract.payment.PlatformFee,
                                    FromNeed: {
                                      ...contract.payment.PlatformFee.FromNeed,
                                      Value: value
                                    }
                                  }
                                }
                              });
                            }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Platform Fee (From Offer)</Label>
                        <div className="flex">
                          <Input 
                            value={contract.payment?.PlatformFee.FromOffer.Value} 
                            onChange={(e) => {
                              if (!contract.payment) return;
                              const value = parseFloat(e.target.value);
                              if (isNaN(value)) return;
                              
                              setContract({
                                ...contract,
                                payment: {
                                  ...contract.payment,
                                  PlatformFee: {
                                    ...contract.payment.PlatformFee,
                                    FromOffer: {
                                      ...contract.payment.PlatformFee.FromOffer,
                                      Value: value
                                    }
                                  }
                                }
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="attachments">
                <Card>
                  <CardHeader>
                    <CardTitle>Contract Attachments</CardTitle>
                    <CardDescription>Manage files and documents</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 border border-dashed rounded-lg bg-gray-50">
                      <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Drag and drop files here or click to browse</p>
                      <Button variant="outline" className="mt-4">Add Attachment</Button>
                    </div>
                    
                    {contract.attachments && contract.attachments.length > 0 ? (
                      <div className="mt-6 space-y-2">
                        {contract.attachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center text-blue-600 mr-3">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-medium">{attachment.name}</p>
                                <p className="text-xs text-gray-500">{(attachment.size / 1000).toFixed(2)} KB</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Trash className="w-4 h-4 text-gray-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminContractEditor;
