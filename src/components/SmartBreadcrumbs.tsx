import { ChevronRight, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbStep {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface SmartBreadcrumbsProps {
  steps: BreadcrumbStep[];
  maxItems?: number;
}

export function SmartBreadcrumbs({ steps, maxItems = 3 }: SmartBreadcrumbsProps) {
  const showEllipsis = steps.length > maxItems;
  const visibleSteps = showEllipsis 
    ? [steps[0], ...steps.slice(-(maxItems - 1))]
    : steps;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink 
            onClick={steps[0]?.onClick}
            className="flex items-center gap-1 cursor-pointer hover:text-primary"
          >
            <Home className="h-3 w-3" />
            {steps[0]?.label}
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {showEllipsis && steps.length > maxItems && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-3 w-3" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
          </>
        )}

        {visibleSteps.slice(1).map((step, index) => {
          const isLast = index === visibleSteps.length - 2;
          
          return (
            <div key={index} className="flex items-center">
              <BreadcrumbSeparator>
                <ChevronRight className="h-3 w-3" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="text-primary font-medium">
                    {step.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink 
                    onClick={step.onClick}
                    className="cursor-pointer hover:text-primary"
                  >
                    {step.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}