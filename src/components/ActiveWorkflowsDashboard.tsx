import React from 'react';
import { WorkflowProgressDashboard } from './WorkflowProgressDashboard';

interface ActiveWorkflowsDashboardProps {
  onCompose: () => void;
}

export function ActiveWorkflowsDashboard({ onCompose }: ActiveWorkflowsDashboardProps) {
  return <WorkflowProgressDashboard onCompose={onCompose} />;
}