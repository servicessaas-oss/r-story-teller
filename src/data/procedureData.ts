// Comprehensive procedure data structure for import/export workflows

export interface Good {
  id: string;
  name: string;
  category: string;
  procedure: 'export' | 'import';
  requiredDocuments: RequiredDocument[];
}

export interface RequiredDocument {
  id: string;
  name: string;
  description: string;
  legalEntityId: string;
  legalEntityName: string;
  isRequired: boolean;
  fee?: number; // USD cents
}

export interface Procedure {
  id: string;
  type: 'export' | 'import';
  name: string;
  description: string;
  goods: Good[];
}

// Export Goods and Documents
export const exportGoods: Good[] = [
  {
    id: 'commercial_goods',
    name: 'Commercial goods',
    category: 'Commercial',
    procedure: 'export',
    requiredDocuments: [
      {
        id: 'export_declaration',
        name: 'Export declaration',
        description: 'Paper declaration for customs clearance',
        legalEntityId: 'sca',
        legalEntityName: 'Sudan Customs Authority',
        isRequired: true,
        fee: 5000
      },
      {
        id: 'export_license',
        name: 'Export license',
        description: 'Official export authorization',
        legalEntityId: 'mti',
        legalEntityName: 'Ministry of Trade & Industry',
        isRequired: true,
        fee: 15000
      },
      {
        id: 'certificate_of_origin',
        name: 'Certificate of Origin (COO)',
        description: 'Certificate of origin for exported goods',
        legalEntityId: 'coc',
        legalEntityName: 'Chamber of Commerce',
        isRequired: true,
        fee: 7500
      }
    ]
  },
  {
    id: 'fruits_vegetables',
    name: 'Fruits & vegetables (Sesame)',
    category: 'Agricultural',
    procedure: 'export',
    requiredDocuments: [
      {
        id: 'phyto_sps_certificates',
        name: 'Phytosanitary & SPS certificates',
        description: 'Phytosanitary and SPS certificates for plant products',
        legalEntityId: 'moa',
        legalEntityName: 'Ministry of Agriculture',
        isRequired: true,
        fee: 8000
      },
      {
        id: 'certificate_of_origin_agri',
        name: 'Certificate of Origin (COO)',
        description: 'Certificate of origin for agricultural exports',
        legalEntityId: 'coc',
        legalEntityName: 'Chamber of Commerce',
        isRequired: true,
        fee: 6000
      },
      {
        id: 'export_declaration_agri',
        name: 'Export declaration',
        description: 'Paper declaration for agricultural exports',
        legalEntityId: 'sca',
        legalEntityName: 'Sudan Customs Authority',
        isRequired: true,
        fee: 5000
      }
    ]
  },
  {
    id: 'livestock',
    name: 'Livestock & live young sheep',
    category: 'Livestock',
    procedure: 'export',
    requiredDocuments: [
      {
        id: 'veterinary_health',
        name: 'Veterinary health certificate',
        description: 'Animal health and vaccination records',
        legalEntityId: 'marf',
        legalEntityName: 'Ministry of Animal Resources & Fisheries',
        isRequired: true,
        fee: 12000
      },
      {
        id: 'export_declaration_livestock',
        name: 'Export declaration',
        description: 'Paper declaration for livestock exports',
        legalEntityId: 'sca',
        legalEntityName: 'Sudan Customs Authority',
        isRequired: true,
        fee: 5000
      }
    ]
  },
  {
    id: 'gold',
    name: 'Gold',
    category: 'Minerals',
    procedure: 'export',
    requiredDocuments: [
      {
        id: 'mining_export_license',
        name: 'Export license',
        description: 'Mining export license from Ministry of Minerals',
        legalEntityId: 'ministry_minerals',
        legalEntityName: 'Ministry of Minerals',
        isRequired: true,
        fee: 25000
      },
      {
        id: 'assay_purity_certificate',
        name: 'Assay report (purity certificate)',
        description: 'Purity certificate from Sudan Gold Refinery',
        legalEntityId: 'sudan_gold_refinery',
        legalEntityName: 'Sudan Gold Refinery',
        isRequired: true,
        fee: 15000
      },
      {
        id: 'fx_repatriation_validation',
        name: 'Foreign currency repatriation validation',
        description: 'Central bank validation for FX repatriation',
        legalEntityId: 'cbs',
        legalEntityName: 'Central Bank of Sudan',
        isRequired: true,
        fee: 50000
      },
      {
        id: 'export_declaration_gold',
        name: 'Export declaration',
        description: 'Paper declaration for gold exports',
        legalEntityId: 'sca',
        legalEntityName: 'Sudan Customs Authority',
        isRequired: true,
        fee: 5000
      }
    ]
  },
  {
    id: 'oil',
    name: 'Oil & Petroleum products',
    category: 'Energy',
    procedure: 'export',
    requiredDocuments: [
      {
        id: 'oil_export_license',
        name: 'Export license',
        description: 'Oil export license from Ministry of Energy',
        legalEntityId: 'ministry_energy',
        legalEntityName: 'Ministry of Energy And Oil',
        isRequired: true,
        fee: 30000
      },
      {
        id: 'oil_quality_assay',
        name: 'Quality testing & assay report',
        description: 'Quality testing documentation from national petroleum laboratory',
        legalEntityId: 'sudan_petroleum_lab',
        legalEntityName: 'Sudan National Petroleum Laboratory',
        isRequired: true,
        fee: 20000
      },
      {
        id: 'export_declaration_oil',
        name: 'Export declaration',
        description: 'Paper declaration for oil exports',
        legalEntityId: 'sca',
        legalEntityName: 'Sudan Customs Authority',
        isRequired: true,
        fee: 5000
      }
    ]
  }
];

// Import Goods and Documents
export const importGoods: Good[] = [
  {
    id: 'drugs_medical',
    name: 'Drugs, cosmetics, medical equipment',
    category: 'Medical',
    procedure: 'import',
    requiredDocuments: [
      {
        id: 'import_license_medical',
        name: 'Import license / permit',
        description: 'Official import authorization for medical products',
        legalEntityId: 'mti',
        legalEntityName: 'Ministry of Trade & Industry',
        isRequired: true,
        fee: 20000
      },
      {
        id: 'health_certificate',
        name: 'Health certificates',
        description: 'Medical product safety and compliance',
        legalEntityId: 'moh',
        legalEntityName: 'Ministry of Health',
        isRequired: true,
        fee: 15000
      },
      {
        id: 'customs_declaration_medical',
        name: 'Customs declaration form',
        description: 'Import customs declaration',
        legalEntityId: 'sca',
        legalEntityName: 'Sudan Customs Authority',
        isRequired: true,
        fee: 8000
      }
    ]
  },
  {
    id: 'foodstuffs',
    name: 'Foodstuffs (Wheat)',
    category: 'Food',
    procedure: 'import',
    requiredDocuments: [
      {
        id: 'lc_fx_allocation',
        name: 'Letter of Credit & FX allocation',
        description: 'LC process including FX allocation from Central Bank',
        legalEntityId: 'cbs',
        legalEntityName: 'Central Bank of Sudan',
        isRequired: true,
        fee: 25000
      },
      {
        id: 'sps_verification',
        name: 'SPS verification',
        description: 'SPS verification by Standards and Metrology + Ministry of Agriculture',
        legalEntityId: 'ssmo_moa',
        legalEntityName: 'Standards And Metrology Organization + Ministry of Agriculture',
        isRequired: true,
        fee: 12000
      },
      {
        id: 'customs_declaration_food',
        name: 'Customs declaration',
        description: 'Import customs declaration for foodstuffs',
        legalEntityId: 'sca',
        legalEntityName: 'Sudan Customs Authority',
        isRequired: true,
        fee: 8000
      }
    ]
  },
  {
    id: 'steel_industrial',
    name: 'Steel & Industrial materials',
    category: 'Industrial',
    procedure: 'import',
    requiredDocuments: [
      {
        id: 'lc_fx_allocation_industrial',
        name: 'FX allocation & Letter of Credit',
        description: 'Foreign exchange allocation and LC confirmation',
        legalEntityId: 'cbs',
        legalEntityName: 'Central Bank of Sudan',
        isRequired: true,
        fee: 30000
      },
      {
        id: 'quality_check_ssmo',
        name: 'Quality check',
        description: 'Quality inspection and conformity assessment',
        legalEntityId: 'ssmo',
        legalEntityName: 'Standards And Metrology Organization',
        isRequired: true,
        fee: 20000
      },
      {
        id: 'compliance_validation',
        name: 'Compliance validation',
        description: 'Industrial compliance validation from Ministry',
        legalEntityId: 'ministry_industry',
        legalEntityName: 'Ministry of Industry',
        isRequired: true,
        fee: 15000
      },
      {
        id: 'customs_filing_industrial',
        name: 'Customs filing',
        description: 'Filing documents via clearing agent',
        legalEntityId: 'sca',
        legalEntityName: 'Sudan Customs Authority',
        isRequired: true,
        fee: 10000
      }
    ]
  },
  {
    id: 'vehicles',
    name: 'Vehicles (commercial & personal)',
    category: 'Automotive',
    procedure: 'import',
    requiredDocuments: [
      {
        id: 'vehicle_import_permit',
        name: 'Import license / permit',
        description: 'Vehicle import authorization',
        legalEntityId: 'mti',
        legalEntityName: 'Ministry of Trade & Industry',
        isRequired: true,
        fee: 35000
      },
      {
        id: 'vehicle_standards',
        name: 'Quality & conformity certificates',
        description: 'Vehicle safety and emissions standards',
        legalEntityId: 'ssmo',
        legalEntityName: 'Standards And Metrology Organization',
        isRequired: true,
        fee: 25000
      }
    ]
  },
  {
    id: 'weapons_ammunition',
    name: 'Weapons, ammunition, explosives, fireworks',
    category: 'Restricted',
    procedure: 'import',
    requiredDocuments: [
      {
        id: 'security_permit',
        name: 'Security & special permits',
        description: 'Special authorization for restricted goods',
        legalEntityId: 'moi',
        legalEntityName: 'Ministry of Interior / Defense',
        isRequired: true,
        fee: 100000
      }
    ]
  }
];

export const procedures: Procedure[] = [
  {
    id: 'export',
    type: 'export',
    name: 'Export Procedure',
    description: 'Process for exporting goods from Sudan',
    goods: exportGoods
  },
  {
    id: 'import',
    type: 'import',
    name: 'Import Procedure',
    description: 'Process for importing goods into Sudan',
    goods: importGoods
  }
];

export const getAllGoods = (): Good[] => [...exportGoods, ...importGoods];

export const getGoodsByProcedure = (procedureType: 'export' | 'import'): Good[] => {
  return procedureType === 'export' ? exportGoods : importGoods;
};

export const getDocumentsByGoods = (selectedGoodIds: string[]): RequiredDocument[] => {
  const allGoods = getAllGoods();
  const documents: RequiredDocument[] = [];
  
  selectedGoodIds.forEach(goodId => {
    const good = allGoods.find(g => g.id === goodId);
    if (good) {
      documents.push(...good.requiredDocuments);
    }
  });

  // Remove duplicates based on document ID
  return documents.filter((doc, index, self) => 
    index === self.findIndex(d => d.id === doc.id)
  );
};

// Mapping from string IDs to actual database UUIDs
const LEGAL_ENTITY_ID_MAP: Record<string, string> = {
  'sca': '0091e7e1-1c0d-4bf0-a885-eae3e4278f20', // Sudan Customs Authority
  'mti': 'e8406e0f-1049-4077-a9f4-9793d164f834', // Ministry of Trade & Industry
  'moh': '486b0256-acb3-4a9d-afb4-e84fc92def4c', // Ministry of Health
  'cbs': 'e6dc78fc-3df6-4860-ad43-94a1fe7b47c5', // Central Bank of Sudan
  'coc': 'fb12cb60-9f2a-47fc-90fa-f07841331962', // Chamber of Commerce
  'moa': 'f7675be3-c463-427b-9cf0-bb0ff41fdc34', // Ministry of Agriculture
  'marf': 'c200c7ae-ab24-4a5c-9ec1-1178552a2e76', // Ministry of Animal Resources & Fisheries
  'ministry_minerals': '6735074a-36c6-459c-8063-b55d8a5c926f', // Ministry of Minerals
  'sudan_gold_refinery': '4fc20f1e-b35e-4d0a-9489-ca826ba2e4f1', // Sudan Gold Refinery
  'ministry_energy': 'df71d66b-b3cd-43aa-b260-147d1eeab7e6', // Ministry of Energy And Oil
  'sudan_petroleum_lab': '9df31cf3-7492-4b0d-9045-e9ca9f0b33e3', // Sudan National Petroleum Laboratory
  'ssmo': 'e88af4eb-d112-41a9-8b52-dd2c06c7ac5e', // Standards And Metrology Organization
  'ministry_industry': 'c1c5f453-9142-4a47-9386-62eac0470b6a', // Ministry of Industry
  'moi': 'fd88690b-22d7-426b-9b15-774ca5b4a6c2', // Ministry of Interior / Defense
  'ssmo_moa': 'e88af4eb-d112-41a9-8b52-dd2c06c7ac5e', // Standards And Metrology Organization (for combined operations)
};

export const mapLegalEntityIdToUUID = (stringId: string): string => {
  return LEGAL_ENTITY_ID_MAP[stringId] || stringId;
};

export const calculateTotalFees = (documents: RequiredDocument[]): number => {
  return documents.reduce((total, doc) => total + (doc.fee || 0), 0);
};