import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { LegalEntityEmailModal } from "./LegalEntityEmailModal";

interface SendEmailButtonProps {
  legalEntityId?: string;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

export function SendEmailButton({ 
  legalEntityId, 
  variant = "outline", 
  size = "sm",
  className,
  children 
}: SendEmailButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setModalOpen(true)}
      >
        <Mail className="h-4 w-4 mr-2" />
        {children || "Send Email"}
      </Button>
      
      <LegalEntityEmailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        preselectedLegalEntity={legalEntityId}
      />
    </>
  );
}