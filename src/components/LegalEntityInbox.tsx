import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Search,
  Filter,
  SortDesc,
  Eye,
  Calendar
} from "lucide-react";
import { useLegalEntityEnvelopes } from "@/hooks/useLegalEntityEnvelopes";
import { BlockchainSigningButton } from "@/components/BlockchainSigningButton";
import { toast } from "sonner";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSequentialWorkflow } from "@/hooks/useSequentialWorkflow";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface PendingEnvelope {
  id: string;
  acid_number: string;
  files: any;
  status: string;
  payment_status: string;
  created_at: string;
  due_date?: string;
  sender_name?: string;
  priority: 'high' | 'medium' | 'low';
  document_types: string[];
  assignment_status: string;
  assignment_id: string;
  assigned_at: string;
}

interface LegalEntityInboxProps {
  onSelectEnvelope: (envelope: PendingEnvelope) => void;
}

export function LegalEntityInbox({ onSelectEnvelope }: LegalEntityInboxProps) {
  console.log('🏢 LegalEntityInbox rendered');
  
  const [envelopes, setEnvelopes] = useState<PendingEnvelope[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const { getAssignedEnvelopes, updateEnvelopeVerification } = useLegalEntityEnvelopes();
  const { completeCurrentStage, rejectCurrentStage } = useSequentialWorkflow();
  const { user, profile } = useAuth();

  console.log('🏢 LegalEntityInbox current state:', { 
    envelopesCount: envelopes.length, 
    loading, 
    searchQuery, 
    statusFilter 
  });

  const fetchEnvelopes = async () => {
    console.log('📨 LegalEntityInbox: fetchEnvelopes called');
    try {
      setLoading(true);
      const data = await getAssignedEnvelopes();
      console.log('📨 LegalEntityInbox: Received data:', data);
      setEnvelopes(data);
    } catch (error) {
      console.error('❌ LegalEntityInbox: Error fetching envelopes:', error);
      toast.error('Failed to load envelopes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnvelopes();
    
    // Set up polling to refresh envelopes periodically
    const interval = setInterval(fetchEnvelopes, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleApproveDocument = async (envelopeId: string) => {
    try {
      // First get the envelope to find the current stage
      const { data: envelope, error: fetchError } = await supabase
        .from('envelopes')
        .select('current_stage, workflow_stages')
        .eq('id', envelopeId)
        .single();

      if (fetchError) throw fetchError;

      const currentStage = envelope.current_stage || 1;
      
      // Use sequential workflow to complete the current stage
      if (user) {
        await completeCurrentStage(envelopeId, currentStage, user.id);
        toast.success('Document approved and workflow advanced!');
      } else {
        // Fallback to simple approval if no user context
        await updateEnvelopeVerification(envelopeId, 'approved');
        toast.success('Document approved successfully!');
      }
      
      await fetchEnvelopes(); // Refresh the list
    } catch (error) {
      console.error('Error approving document:', error);
      toast.error('Failed to approve document');
    }
  };

  const handleRejectDocument = async (envelopeId: string) => {
    try {
      // First get the envelope to find the current stage
      const { data: envelope, error: fetchError } = await supabase
        .from('envelopes')
        .select('current_stage, workflow_stages')
        .eq('id', envelopeId)
        .single();

      if (fetchError) throw fetchError;

      const currentStage = envelope.current_stage || 1;
      
      // Use sequential workflow to reject the current stage
      if (user) {
        await rejectCurrentStage(
          envelopeId, 
          currentStage, 
          'Document rejected by legal entity',
          user.id
        );
        toast.success('Document rejected and workflow stopped');
      } else {
        // Fallback to simple rejection if no user context
        await updateEnvelopeVerification(envelopeId, 'rejected');
        toast.success('Document rejected');
      }
      
      await fetchEnvelopes(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting document:', error);
      toast.error('Failed to reject document');
    }
  };

  const filteredEnvelopes = envelopes
    .filter(envelope => {
      const matchesSearch = envelope.acid_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           envelope.sender_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || envelope.assignment_status === statusFilter;
      const matchesPriority = priorityFilter === "all" || envelope.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'due_date':
          return new Date(a.due_date || '').getTime() - new Date(b.due_date || '').getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const getTimeRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMs < 0) return { text: "Overdue", variant: "destructive" as const };
    if (diffDays > 0) return { text: `${diffDays}d remaining`, variant: "default" as const };
    if (diffHours > 0) return { text: `${diffHours}h remaining`, variant: "secondary" as const };
    return { text: "Due soon", variant: "destructive" as const };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary">Document Inbox</h2>
          <p className="text-muted-foreground">
            {filteredEnvelopes.length} documents pending your review
          </p>
        </div>
        
        <Button 
          onClick={fetchEnvelopes} 
          variant="outline"
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </>
          )}
          Refresh
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ACID number or sender..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Received</SelectItem>
                <SelectItem value="due_date">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Envelopes List */}
      {filteredEnvelopes.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No documents found</h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== "all" || priorityFilter !== "all" 
                ? "Try adjusting your filters or search criteria"
                : "There are no documents waiting for your review at the moment."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEnvelopes.map((envelope) => {
            const timeRemaining = getTimeRemaining(envelope.due_date || '');
            
            return (
              <Card key={envelope.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Header Row */}
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">ACID: {envelope.acid_number}</h3>
                        <Badge className={getPriorityColor(envelope.priority)}>
                          {envelope.priority.toUpperCase()} PRIORITY
                        </Badge>
                        <Badge variant={timeRemaining.variant}>
                          <Clock className="h-3 w-3 mr-1" />
                          {timeRemaining.text}
                        </Badge>
                      </div>

                      {/* Sender and Date */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>From: {envelope.sender_name}</span>
                        <span>•</span>
                        <span>Received: {new Date(envelope.created_at).toLocaleDateString()}</span>
                        {envelope.due_date && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due: {new Date(envelope.due_date).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Documents */}
                      <div>
                        <h4 className="font-medium mb-2 text-sm">
                          Documents ({Array.isArray(envelope.files) ? envelope.files.length : 0})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(envelope.files) && envelope.files.map((file: any, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <FileText className="h-3 w-3 mr-1" />
                              {file.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-6">
                      <Button
                        onClick={() => onSelectEnvelope(envelope)}
                        variant="default"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                      
                      {/* Approval Actions */}
                      {envelope.assignment_status === 'pending' || envelope.assignment_status === 'in_review' ? (
                        <div className="flex flex-col gap-1">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="default"
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Approve Document</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to approve this document? This action will mark it as approved and notify the sender.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleApproveDocument(envelope.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Approve Document
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                              >
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reject Document</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to reject this document? This action will mark it as rejected and notify the sender.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRejectDocument(envelope.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Reject Document
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-xs text-center">
                          {envelope.assignment_status === 'completed' ? 'Approved' : 
                           envelope.assignment_status === 'rejected' ? 'Rejected' : 
                           envelope.assignment_status}
                        </Badge>
                      )}
                      
                      <BlockchainSigningButton 
                        envelopeId={envelope.id}
                        variant="outline"
                        size="sm"
                      />
                      
                      {envelope.priority === 'high' && (
                        <Badge variant="destructive" className="text-xs text-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Urgent
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}