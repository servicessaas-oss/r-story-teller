-- Fix inconsistent workflow state for envelope b876d00d-d761-462e-af32-c6e21479f606
-- Stage 1 should be completed, Stage 2 should be current and require payment

UPDATE envelopes 
SET 
  workflow_stages = '[
    {
      "stage_number": 1,
      "document_id": "export_license",
      "legal_entity_id": "e8406e0f-1049-4077-a9f4-9793d164f834",
      "legal_entity_name": "Ministry of Trade & Industry",
      "status": "completed",
      "is_current": false,
      "can_start": false,
      "payment_required": true,
      "payment_amount": 15000,
      "payment_status": "completed",
      "payment_completed_at": "2025-09-09T15:44:07.542Z",
      "completed_at": "2025-09-09T15:44:07.542Z"
    },
    {
      "stage_number": 2,
      "document_id": "certificate_of_origin",
      "legal_entity_id": "fb12cb60-9f2a-47fc-90fa-f07841331962",
      "legal_entity_name": "Chamber of Commerce",
      "status": "payment_required",
      "is_current": true,
      "can_start": true,
      "payment_required": true,
      "payment_amount": 7500,
      "payment_status": "pending",
      "assigned_at": "2025-09-09T15:44:07.542Z"
    },
    {
      "stage_number": 3,
      "document_id": "export_declaration",
      "legal_entity_id": "0091e7e1-1c0d-4bf0-a885-eae3e4278f20",
      "legal_entity_name": "Sudan Customs Authority",
      "status": "blocked",
      "is_current": false,
      "can_start": false,
      "payment_required": true,
      "payment_amount": 5000,
      "payment_status": "pending"
    }
  ]'::jsonb,
  current_stage = 2,
  status = 'sent',
  workflow_status = 'in_progress',
  legal_entity_id = 'fb12cb60-9f2a-47fc-90fa-f07841331962'
WHERE id = 'b876d00d-d761-462e-af32-c6e21479f606';