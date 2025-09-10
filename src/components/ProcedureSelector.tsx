import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Package, FileText, DollarSign } from "lucide-react";
import { procedures, getGoodsByProcedure, getDocumentsByGoods, calculateTotalFees, type Good, type RequiredDocument } from "@/data/procedureData";

interface ProcedureSelectorProps {
  onProceed: (procedureType: 'export' | 'import', selectedGoods: Good[], requiredDocuments: RequiredDocument[], totalFees: number) => void;
}

export function ProcedureSelector({ onProceed }: ProcedureSelectorProps) {
  const [selectedProcedure, setSelectedProcedure] = useState<'export' | 'import' | null>(null);
  const [selectedGoodIds, setSelectedGoodIds] = useState<string[]>([]);

  const handleProcedureSelect = (procedureType: 'export' | 'import') => {
    setSelectedProcedure(procedureType);
    setSelectedGoodIds([]);
  };

  const handleGoodToggle = (goodId: string) => {
    setSelectedGoodIds(prev => 
      prev.includes(goodId) 
        ? prev.filter(id => id !== goodId)
        : [...prev, goodId]
    );
  };

  const handleProceed = () => {
    if (!selectedProcedure || selectedGoodIds.length === 0) return;

    const allGoods = getGoodsByProcedure(selectedProcedure);
    const selectedGoods = allGoods.filter(good => selectedGoodIds.includes(good.id));
    const requiredDocuments = getDocumentsByGoods(selectedGoodIds);
    const totalFees = calculateTotalFees(requiredDocuments);

    onProceed(selectedProcedure, selectedGoods, requiredDocuments, totalFees);
  };

  const availableGoods = selectedProcedure ? getGoodsByProcedure(selectedProcedure) : [];
  const requiredDocuments = getDocumentsByGoods(selectedGoodIds);
  const totalFees = calculateTotalFees(requiredDocuments);
  const canProceed = selectedProcedure && selectedGoodIds.length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Procedure Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Select Procedure Type</CardTitle>
          <CardDescription>Choose whether you're importing or exporting goods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {procedures.map((procedure) => (
              <Card 
                key={procedure.id}
                className={`cursor-pointer transition-all ${
                  selectedProcedure === procedure.type 
                    ? 'ring-2 ring-primary border-primary bg-primary/5' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handleProcedureSelect(procedure.type)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{procedure.name}</CardTitle>
                      <CardDescription className="mt-1">{procedure.description}</CardDescription>
                    </div>
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-sm text-muted-foreground">
                    {procedure.goods.length} goods categories available
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Goods Selection */}
      {selectedProcedure && (
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Select Goods</CardTitle>
            <CardDescription>
              Choose the goods you're {selectedProcedure === 'export' ? 'exporting' : 'importing'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableGoods.map((good) => (
                <Card 
                  key={good.id}
                  className={`cursor-pointer transition-all ${
                    selectedGoodIds.includes(good.id)
                      ? 'ring-2 ring-primary border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => handleGoodToggle(good.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Checkbox 
                            checked={selectedGoodIds.includes(good.id)}
                            onChange={() => handleGoodToggle(good.id)}
                          />
                          <h4 className="font-medium text-sm">{good.name}</h4>
                        </div>
                        <Badge variant="secondary" className="text-xs mb-2">
                          {good.category}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {good.requiredDocuments.length} required document{good.requiredDocuments.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Required Documents Preview */}
      {selectedGoodIds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Required Documents & Legal Entities
            </CardTitle>
            <CardDescription>
              Documents you'll need to provide and entities that will process them
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requiredDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{doc.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {doc.legalEntityName}
                      </Badge>
                      {doc.isRequired && (
                        <Badge variant="secondary" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                  </div>
                  {doc.fee && (
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-primary font-medium">
                        <DollarSign className="h-4 w-4" />
                        ${(doc.fee / 100).toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground">Processing fee</p>
                    </div>
                  )}
                </div>
              ))}
              
              {totalFees > 0 && (
                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Processing Fees</span>
                    <div className="flex items-center gap-1 text-lg font-bold text-primary">
                      <DollarSign className="h-5 w-5" />
                      ${(totalFees / 100).toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Button */}
      {canProceed && (
        <div className="flex justify-end">
          <Button
            onClick={handleProceed}
            variant="action"
            size="lg"
            className="gap-2"
          >
            Continue to Document Upload
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}