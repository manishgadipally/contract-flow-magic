
import React from 'react';
import { cn } from '../../lib/utils';
import { Check, AlertCircle, Pencil, Send, FileSignature, PlayCircle, Clock } from 'lucide-react';

export type StepStatus = 'completed' | 'current' | 'upcoming';

export interface Step {
  id: number;
  name: string;
  status: StepStatus;
  description?: string;
  actionIcon?: React.ReactNode;
}

interface ContractStepperProps {
  steps: Step[];
  className?: string;
}

const ContractStepper = ({ steps, className }: ContractStepperProps) => {
  // Get status-specific colors
  const getStatusColors = (status: StepStatus) => {
    switch (status) {
      case 'completed':
        return {
          circle: "bg-green-500 border-green-500 text-white",
          line: "bg-green-500",
          gradientLine: "bg-gradient-to-b from-green-500 to-gray-300",
          text: "text-green-600 font-medium",
          description: "text-green-600"
        };
      case 'current':
        return {
          circle: "bg-white border-blue-500 text-blue-500 ring-4 ring-blue-100",
          line: "bg-gray-300",
          gradientLine: "bg-gray-300",
          text: "text-blue-600 font-semibold",
          description: "text-gray-700"
        };
      case 'upcoming':
      default:
        return {
          circle: "bg-white border-gray-300 text-gray-400",
          line: "bg-gray-300",
          gradientLine: "bg-gray-300",
          text: "text-gray-500",
          description: "text-gray-500"
        };
    }
  };

  return (
    <nav aria-label="Contract Progress" className={cn("h-full", className)}>
      <ol className="relative flex flex-col space-y-8">
        {steps.map((step, index) => {
          const colors = getStatusColors(step.status);
          
          return (
            <li key={step.id} className="relative">
              <div className="flex items-start">
                <div className={cn(
                  "relative flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium border transition-all duration-300",
                  colors.circle
                )}>
                  {step.status === 'completed' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "absolute w-0.5 h-12 left-1/2 -translate-x-1/2 top-full",
                      step.status === 'completed' && steps[index + 1].status === 'completed' ? colors.line : 
                      step.status === 'completed' && steps[index + 1].status === 'current' ? colors.gradientLine :
                      "bg-gray-300"
                    )} />
                  )}
                </div>
                <div className="ml-4">
                  <span className={cn(
                    "text-sm font-medium transition-all duration-300 block",
                    colors.text
                  )}>
                    {step.name}
                  </span>
                  {step.description && (
                    <p className={cn(
                      "text-xs mt-1",
                      colors.description
                    )}>
                      {step.description}
                    </p>
                  )}
                  {step.status === 'current' && step.actionIcon && (
                    <div className="mt-2">
                      {step.actionIcon}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default ContractStepper;
