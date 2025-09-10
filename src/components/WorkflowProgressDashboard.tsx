import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Package, 
  Plus, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { useLocalEnvelopes } from "@/hooks/useLocalEnvelopes";
import { useState as useStateReact, useEffect } from "react";
import { EnhancedWorkflowProgressCard } from "./EnhancedWorkflowProgressCard";
import { SequentialWorkflowTracker } from "./SequentialWorkflowTracker";

interface WorkflowProgressDashboardProps {
  onCompose: () => void;
}

export function WorkflowProgressDashboard({ onCompose }: WorkflowProgressDashboardProps) {
  const { getUserEnvelopes } = useLocalEnvelopes();
  const [envelopes, setEnvelopes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEnvelope, setSelectedEnvelope] = useState<string | null>(null);

  useEffect(() => {
    const loadEnvelopes = async () => {
      setLoading(true);
      try {
        const userEnvelopes = await getUserEnvelopes();
        setEnvelopes(userEnvelopes);
      } catch (error) {
        console.error('Error loading envelopes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEnvelopes();
  }, [getUserEnvelopes]);

  const activeEnvelopes = envelopes.filter(envelope => 
    envelope.workflow_status !== 'completed' && 
    envelope.workflow_status !== 'rejected' &&
    envelope.status !== 'draft'
  );

  const completedEnvelopes = envelopes.filter(envelope => 
    envelope.workflow_status === 'completed' || 
    envelope.status === 'approved'
  );

  const rejectedEnvelopes = envelopes.filter(envelope => 
    envelope.workflow_status === 'rejected' || 
    envelope.status === 'rejected'
  );

  const getWorkflowStats = () => {
    const totalStages = activeEnvelopes.reduce((sum, env) => 
      sum + (env.workflow_stages?.length || 0), 0
    );
    const completedStages = activeEnvelopes.reduce((sum, env) => 
      sum + (env.workflow_stages?.filter(s => s.status === 'completed').length || 0), 0
    );

    return {
      totalEnvelopes: envelopes.length,
      activeEnvelopes: activeEnvelopes.length,
      completedEnvelopes: completedEnvelopes.length,
      rejectedEnvelopes: rejectedEnvelopes.length,
      totalStages,
      completedStages,
      overallProgress: totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0
    };
  };

  const stats = getWorkflowStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.activeEnvelopes}</p>
                <p className="text-sm text-muted-foreground">Active Envelopes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.completedEnvelopes}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.rejectedEnvelopes}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats.overallProgress}%</p>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-primary">Workflow Progress Dashboard</CardTitle>
              <p className="text-muted-foreground">
                Track your document workflows and approvals in real-time
              </p>
            </div>
            <Button onClick={onCompose} variant="default">
              <Plus className="h-4 w-4 mr-2" />
              New Envelope
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {envelopes.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-medium text-muted-foreground mb-2">No envelopes yet</h4>
              <p className="text-sm text-muted-foreground mb-4">Create your first envelope to get started</p>
              <Button onClick={onCompose} variant="default">
                <Plus className="h-4 w-4 mr-2" />
                Create Envelope
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="active" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Active ({activeEnvelopes.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Completed ({completedEnvelopes.length})
                </TabsTrigger>
                <TabsTrigger value="rejected" className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Issues ({rejectedEnvelopes.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-6 max-h-[400px] overflow-y-auto">
                {activeEnvelopes.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No active workflows</p>
                  </div>
                ) : (
                  <div className="grid gap-4 pr-2">
                    {activeEnvelopes.map((envelope) => (
                      <EnhancedWorkflowProgressCard 
                        key={envelope.id} 
                        envelope={envelope}
                        onClick={() => setSelectedEnvelope(envelope.id)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="mt-6 max-h-[400px] overflow-y-auto">
                {completedEnvelopes.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No completed workflows yet</p>
                  </div>
                ) : (
                  <div className="grid gap-4 pr-2">
                    {completedEnvelopes.map((envelope) => (
                      <EnhancedWorkflowProgressCard 
                        key={envelope.id} 
                        envelope={envelope}
                        onClick={() => setSelectedEnvelope(envelope.id)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="rejected" className="mt-6 max-h-[400px] overflow-y-auto">
                {rejectedEnvelopes.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-muted-foreground">No rejected workflows - Great job!</p>
                  </div>
                ) : (
                  <div className="grid gap-4 pr-2">
                    {rejectedEnvelopes.map((envelope) => (
                      <EnhancedWorkflowProgressCard 
                        key={envelope.id} 
                        envelope={envelope}
                        onClick={() => setSelectedEnvelope(envelope.id)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Workflow Detail Dialog */}
      {selectedEnvelope && (
        <Dialog open={!!selectedEnvelope} onOpenChange={() => setSelectedEnvelope(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>
                Workflow Details - ACID: {envelopes.find(e => e.id === selectedEnvelope)?.acid_number}
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[60vh]">
              <SequentialWorkflowTracker 
                envelopeId={selectedEnvelope} 
                onStageComplete={() => {
                  // Refresh will happen automatically via real-time subscription
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}