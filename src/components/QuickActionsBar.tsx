import { Button } from "@/components/ui/button";
import { 
  Plus, 
  MessageCircle, 
  Search, 
  Archive, 
  Send, 
  FileText, 
  Building2,
  Package 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface QuickActionsBarProps {
  onNewEnvelope: () => void;
  onStartChat: () => void;
  onSearch: () => void;
  onViewDashboard: () => void;
  onViewInbox: () => void;
  onViewEntities: () => void;
  currentSection: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: any;
  onClick: () => void;
  variant?: "default" | "secondary" | "action" | "outline";
  shortcut?: string;
}

export function QuickActionsBar({ 
  onNewEnvelope, 
  onStartChat, 
  onSearch, 
  onViewDashboard,
  onViewInbox,
  onViewEntities,
  currentSection 
}: QuickActionsBarProps) {
  const actions: QuickAction[] = [
    {
      id: 'new-envelope',
      label: 'New Envelope',
      icon: Plus,
      onClick: onNewEnvelope,
      variant: 'action',
      shortcut: 'N'
    },
    {
      id: 'start-chat',
      label: 'Chat',
      icon: MessageCircle,
      onClick: onStartChat,
      variant: currentSection === 'messages' ? 'default' : 'secondary',
      shortcut: 'C'
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      onClick: onSearch,
      variant: 'outline',
      shortcut: '/'
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Package,
      onClick: onViewDashboard,
      variant: currentSection === 'dashboard' ? 'default' : 'outline',
      shortcut: 'D'
    },
    {
      id: 'inbox',
      label: 'Inbox',
      icon: FileText,
      onClick: onViewInbox,
      variant: currentSection === 'inbox' ? 'default' : 'outline',
      shortcut: 'I'
    },
    {
      id: 'entities',
      label: 'Legal Entities',
      icon: Building2,
      onClick: onViewEntities,
      variant: currentSection === 'legal-entities' ? 'default' : 'outline',
      shortcut: 'L'
    }
  ];

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant || "outline"}
              size="sm"
              onClick={action.onClick}
              className="flex items-center gap-2"
            >
              <action.icon className="h-3 w-3" />
              <span className="hidden sm:inline">{action.label}</span>
              <kbd className="hidden lg:inline-flex h-4 px-1 text-xs font-mono bg-muted text-muted-foreground rounded border">
                {action.shortcut}
              </kbd>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}