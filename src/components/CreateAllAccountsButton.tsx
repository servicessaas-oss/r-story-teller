import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LegalEntityAccessList } from "./LegalEntityAccessList";
import { AdminSetup } from "./AdminSetup";

export const CreateAllAccountsButton = () => {
  const [accountsCreated, setAccountsCreated] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createAllAccounts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-legal-entity-accounts');
      
      if (error) throw error;
      
      setAccountsCreated(true);
      toast({
        title: "Success",
        description: `Created accounts for ${data.results?.length || 0} legal entities`,
      });
    } catch (error) {
      console.error('Error creating accounts:', error);
      toast({
        title: "Error",
        description: "Failed to create legal entity accounts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!accountsCreated ? (
        <div className="text-center">
          <Button 
            onClick={createAllAccounts} 
            disabled={loading}
            size="lg"
            className="mb-4"
          >
            {loading ? "Creating All Accounts..." : "Create Accounts for All Legal Entities"}
          </Button>
          <p className="text-muted-foreground">
            This will create authentication accounts for all 15 legal entities in the system.
          </p>
        </div>
      ) : (
        <LegalEntityAccessList />
      )}
    </div>
  );
};