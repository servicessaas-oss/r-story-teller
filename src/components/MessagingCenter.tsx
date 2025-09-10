import { MessageSquare } from "lucide-react";
import { RealTimeChat } from "./RealTimeChat";
import { useAuth } from "@/contexts/AuthContext";

interface MessagingCenterProps {
  onCompose?: () => void;
  onOpenEnvelope?: (envelopeId: string) => void;
  onUnarchive?: (envelopeId: string) => void;
  onDownload?: (envelopeId: string) => void;
}

export function MessagingCenter({ 
  onCompose, 
  onOpenEnvelope, 
  onUnarchive, 
  onDownload 
}: MessagingCenterProps = {}) {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-primary">Chat</h2>
        </div>
      </div>

      <RealTimeChat />
    </div>
  );
}