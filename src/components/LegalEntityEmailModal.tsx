import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Paperclip, Send, X, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LegalEntity {
  id: string;
  name: string;
  entity_type: string;
}

interface LegalEntityEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedLegalEntity?: string;
}

export function LegalEntityEmailModal({ 
  open, 
  onOpenChange, 
  preselectedLegalEntity 
}: LegalEntityEmailModalProps) {
  const { toast } = useToast();
  const [legalEntities, setLegalEntities] = useState<LegalEntity[]>([]);
  const [recipient, setRecipient] = useState(preselectedLegalEntity || "");
  const [ccEntities, setCcEntities] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch legal entities from database
  useEffect(() => {
    const fetchLegalEntities = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('legal_entities')
          .select('id, name, entity_type')
          .order('name');
        
        if (error) throw error;
        setLegalEntities(data || []);
      } catch (error) {
        console.error('Error fetching legal entities:', error);
        toast({
          title: "Error",
          description: "Failed to load legal entities",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchLegalEntities();
    }
  }, [open, toast]);

  // Update recipient when preselectedLegalEntity changes
  useEffect(() => {
    if (preselectedLegalEntity) {
      setRecipient(preselectedLegalEntity);
    }
  }, [preselectedLegalEntity]);

  const handleCcToggle = (entityId: string, checked: boolean) => {
    if (checked) {
      setCcEntities(prev => [...prev, entityId]);
    } else {
      setCcEntities(prev => prev.filter(id => id !== entityId));
    }
  };

  const handleFileAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!recipient || !subject.trim() || !content.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in recipient, subject, and content",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      // Convert attachments to base64
      const attachmentData = await Promise.all(
        attachments.map(async (file) => {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              resolve(result.split(',')[1]); // Remove data URL prefix
            };
            reader.readAsDataURL(file);
          });

          return {
            filename: file.name,
            content: base64,
            type: file.type
          };
        })
      );

      // Send email via edge function
      const { error } = await supabase.functions.invoke('send-legal-entity-email', {
        body: {
          recipient_legal_entity_id: recipient,
          cc_legal_entities: ccEntities,
          subject,
          content,
          attachments: attachmentData
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email sent successfully to legal entity",
      });

      // Reset form
      setRecipient(preselectedLegalEntity || "");
      setCcEntities([]);
      setSubject("");
      setContent("");
      setAttachments([]);
      onOpenChange(false);

    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Email to Legal Entity
          </DialogTitle>
          <DialogDescription>
            Send a formal email to legal entities with proper documentation
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Recipient Selection */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Legal Entity *</Label>
            <Select value={recipient} onValueChange={setRecipient} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading entities..." : "Select legal entity"} />
              </SelectTrigger>
              <SelectContent>
                {legalEntities.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id}>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{entity.name}</div>
                        <div className="text-xs text-muted-foreground capitalize">{entity.entity_type.replace(/_/g, ' ')}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* CC Selection */}
          <div className="space-y-3">
            <Label>CC Other Legal Entities</Label>
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 gap-3">
                  {legalEntities
                    .filter(entity => entity.id !== recipient)
                    .map((entity) => (
                      <div key={entity.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={entity.id}
                          checked={ccEntities.includes(entity.id)}
                          onCheckedChange={(checked) => 
                            handleCcToggle(entity.id, checked as boolean)
                          }
                        />
                        <Label htmlFor={entity.id} className="flex-1 cursor-pointer">
                          <div className="font-medium">{entity.name}</div>
                          <div className="text-xs text-muted-foreground capitalize">{entity.entity_type.replace(/_/g, ' ')}</div>
                        </Label>
                      </div>
                    ))
                  }
                </div>
                {ccEntities.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex flex-wrap gap-1">
                      {ccEntities.map(entityId => {
                        const entity = legalEntities.find(e => e.id === entityId);
                        return (
                          <Badge key={entityId} variant="secondary" className="text-xs">
                            {entity?.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Enter email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Message Content *</Label>
            <Textarea
              id="content"
              placeholder="Enter your message content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="resize-none"
            />
          </div>

          {/* Attachments */}
          <div className="space-y-3">
            <Label>Attachments</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Paperclip className="h-4 w-4 mr-2" />
                Add Files
              </Button>
              <input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileAttachment}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
              />
              <span className="text-xs text-muted-foreground">
                PDF, Word, Images, Text files
              </span>
            </div>
            
            {attachments.length > 0 && (
              <Card>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-accent rounded">
                        <div className="flex items-center gap-2">
                          <Paperclip className="h-4 w-4" />
                          <span className="text-sm truncate">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={sending || !recipient || !subject.trim() || !content.trim()}
            >
              {sending ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}