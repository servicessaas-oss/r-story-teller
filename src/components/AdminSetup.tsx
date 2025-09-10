import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const AdminSetup = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();

  const createLegalEntityAccounts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-legal-entity-accounts');
      
      if (error) throw error;
      
      setResults(data.results || []);
      toast({
        title: "Success",
        description: "Legal entity accounts have been set up",
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
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Admin Setup - Legal Entity Accounts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          This will create authentication accounts for all legal entities in the system.
        </p>
        
        <Button onClick={createLegalEntityAccounts} disabled={loading}>
          {loading ? "Creating Accounts..." : "Create Legal Entity Accounts"}
        </Button>

        {results.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Results:</h3>
            {results.map((result, index) => (
              <div key={index} className="p-2 border rounded text-sm">
                <div className="font-medium">{result.email}</div>
                <div className={`text-xs ${result.status === 'error' ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {result.status}: {result.message}
                </div>
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Legal Entity Login Credentials:</h4>
            <div className="space-y-1 text-sm font-mono">
              <div>customs@sudan.com / Customs2024!</div>
              <div>trade@sudan.com / Trade2024!</div>
              <div>agriculture@sudan.com / Agriculture2024!</div>
              <div>bank@sudan.com / Bank2024!</div>
              <div>chamber@sudan.com / Chamber2024!</div>
              <div>health@sudan.com / Health2024!</div>
              <div>port@sudan.com / Port2024!</div>
              <div>animal-resources@sudan.com / AnimalRes2024!</div>
              <div>energy@sudan.com / Energy2024!</div>
              <div>industry@sudan.com / Industry2024!</div>
              <div>interior@sudan.com / Interior2024!</div>
              <div>minerals@sudan.com / Minerals2024!</div>
              <div>standards@sudan.com / Standards2024!</div>
              <div>gold-refinery@sudan.com / GoldRef2024!</div>
              <div>petroleum-lab@sudan.com / PetroLab2024!</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};