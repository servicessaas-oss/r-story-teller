import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Loader2, Upload, FileText, Shield } from "lucide-react";

interface ProgressStep {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'pending' | 'active' | 'completed';
}

interface ProgressIndicatorProps {
  files: Array<{ name: string }>;
  onComplete: () => void;
}

export function ProgressIndicator({ files, onComplete }: ProgressIndicatorProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const steps: ProgressStep[] = [
    { id: 'signing', label: 'Signing and Transferring...', icon: Shield, status: 'pending' },
    { id: 'uploading', label: 'Uploading to secure storage', icon: Upload, status: 'pending' },
    ...files.map((file, index) => ({
      id: `signing-${index}`,
      label: `Signing document ${file.name}...`,
      icon: FileText,
      status: 'pending' as const
    })),
    { id: 'blockchain', label: 'Sending transaction to blockchain...', icon: Shield, status: 'pending' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => onComplete(), 500);
          return 100;
        }
        return prev + (100 / steps.length / 3);
      });
    }, 800);

    return () => clearInterval(timer);
  }, [steps.length, onComplete]);

  useEffect(() => {
    const stepIndex = Math.floor((progress / 100) * steps.length);
    setCurrentStep(stepIndex);
  }, [progress, steps.length]);

  const getStepStatus = (index: number): 'pending' | 'active' | 'completed' => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary text-center">Processing Transaction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => {
              const status = getStepStatus(index);
              const Icon = step.icon;
              
              return (
                <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div className="flex-shrink-0">
                    {status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : status === 'active' ? (
                      <Loader2 className="h-5 w-5 text-action animate-spin" />
                    ) : (
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <span className={`text-sm ${
                    status === 'completed' ? 'text-success' :
                    status === 'active' ? 'text-action font-medium' :
                    'text-muted-foreground'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}