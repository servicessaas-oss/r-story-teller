import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Edit, Trash2, Send, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Draft {
  id: string;
  acid_number: string;
  status: string;
  files: any;
  created_at: string;
  updated_at: string;
  total_amount?: number;
  payment_status?: 'pending' | 'completed' | 'failed';
  is_draft: boolean;
}

interface DraftsManagerProps {
  onEditDraft: (draftId: string) => void;
  onCreateNew: () => void;
}

export function DraftsManager({ onEditDraft, onCreateNew }: DraftsManagerProps) {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrafts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('envelopes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_draft', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDrafts((data || []) as Draft[]);
    } catch (error) {
      console.error('Error fetching drafts:', error);
      toast.error('Failed to fetch drafts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    try {
      const { error } = await supabase
        .from('envelopes')
        .delete()
        .eq('id', draftId);

      if (error) throw error;
      
      toast.success('Draft deleted successfully');
      fetchDrafts();
    } catch (error) {
      console.error('Error deleting draft:', error);
      toast.error('Failed to delete draft');
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, [user]);

  const getStatusBadge = (status: string, paymentStatus?: string) => {
    if (status === 'draft') {
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Draft</Badge>;
    }
    if (status === 'pending_payment') {
      return <Badge variant="outline">Pending Payment</Badge>;
    }
    if (status === 'under_review') {
      return <Badge variant="default"><Send className="h-3 w-3 mr-1" />Under Review</Badge>;
    }
    return <Badge variant="default">Completed</Badge>;
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Draft Envelopes</h2>
          <p className="text-muted-foreground">Manage your incomplete document submissions</p>
        </div>
        <Button onClick={onCreateNew}>
          <FileText className="h-4 w-4 mr-2" />
          Create New Envelope
        </Button>
      </div>

      {drafts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No drafts found</h3>
            <p className="text-muted-foreground mb-4">
              You haven't created any draft envelopes yet.
            </p>
            <Button onClick={onCreateNew}>
              <FileText className="h-4 w-4 mr-2" />
              Create New Envelope
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {drafts.map((draft) => (
            <Card key={draft.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">ACID: {draft.acid_number}</CardTitle>
                  {getStatusBadge(draft.status, draft.payment_status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Created: {new Date(draft.created_at).toLocaleDateString()}</span>
                    <span>Modified: {new Date(draft.updated_at).toLocaleDateString()}</span>
                    {draft.total_amount && (
                      <span>Amount: ${(draft.total_amount / 100).toFixed(2)}</span>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Files ({Array.isArray(draft.files) ? draft.files.length : 0})</h4>
                    <div className="space-y-1">
                      {Array.isArray(draft.files) && draft.files.slice(0, 3).map((file: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4" />
                          <span>{file.name}</span>
                          {file.type && (
                            <Badge variant="outline" className="text-xs">{file.type}</Badge>
                          )}
                        </div>
                      ))}
                      {Array.isArray(draft.files) && draft.files.length > 3 && (
                        <div className="text-sm text-muted-foreground">
                          +{draft.files.length - 3} more files
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditDraft(draft.id)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteDraft(draft.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                    {draft.status === 'draft' && (
                      <Button size="sm" className="ml-auto">
                        <Send className="h-4 w-4 mr-2" />
                        Continue to Payment
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}