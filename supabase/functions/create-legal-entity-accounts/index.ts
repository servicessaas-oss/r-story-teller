import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LegalEntityAccount {
  email: string;
  password: string;
  full_name: string;
  legal_entity_id: string;
}

const legalEntityAccounts: LegalEntityAccount[] = [
  {
    email: "customs@sudan.com",
    password: "Customs2024!",
    full_name: "Sudan Customs Authority",
    legal_entity_id: "0091e7e1-1c0d-4bf0-a885-eae3e4278f20"
  },
  {
    email: "trade@sudan.com", 
    password: "Trade2024!",
    full_name: "Ministry of Trade & Industry",
    legal_entity_id: "e8406e0f-1049-4077-a9f4-9793d164f834"
  },
  {
    email: "agriculture@sudan.com",
    password: "Agriculture2024!", 
    full_name: "Ministry of Agriculture",
    legal_entity_id: "f7675be3-c463-427b-9cf0-bb0ff41fdc34"
  },
  {
    email: "bank@sudan.com",
    password: "Bank2024!",
    full_name: "Central Bank of Sudan", 
    legal_entity_id: "e6dc78fc-3df6-4860-ad43-94a1fe7b47c5"
  },
  {
    email: "chamber@sudan.com",
    password: "Chamber2024!",
    full_name: "Chamber of Commerce",
    legal_entity_id: "fb12cb60-9f2a-47fc-90fa-f07841331962"
  },
  {
    email: "health@sudan.com",
    password: "Health2024!",
    full_name: "Ministry of Health",
    legal_entity_id: "486b0256-acb3-4a9d-afb4-e84fc92def4c"
  },
  {
    email: "port@sudan.com",
    password: "Port2024!",
    full_name: "Port Sudan",
    legal_entity_id: "ec83fc5f-cce4-4ec5-8e08-c50b7e1a01b9"
  },
  {
    email: "animal-resources@sudan.com",
    password: "AnimalRes2024!",
    full_name: "Ministry of Animal Resources & Fisheries",
    legal_entity_id: "c200c7ae-ab24-4a5c-9ec1-1178552a2e76"
  },
  {
    email: "energy@sudan.com",
    password: "Energy2024!",
    full_name: "Ministry of Energy And Oil",
    legal_entity_id: "df71d66b-b3cd-43aa-b260-147d1eeab7e6"
  },
  {
    email: "industry@sudan.com",
    password: "Industry2024!",
    full_name: "Ministry of Industry",
    legal_entity_id: "c1c5f453-9142-4a47-9386-62eac0470b6a"
  },
  {
    email: "interior@sudan.com",
    password: "Interior2024!",
    full_name: "Ministry of Interior / Defense",
    legal_entity_id: "fd88690b-22d7-426b-9b15-774ca5b4a6c2"
  },
  {
    email: "minerals@sudan.com",
    password: "Minerals2024!",
    full_name: "Ministry of Minerals",
    legal_entity_id: "6735074a-36c6-459c-8063-b55d8a5c926f"
  },
  {
    email: "standards@sudan.com",
    password: "Standards2024!",
    full_name: "Standards And Metrology Organization",
    legal_entity_id: "e88af4eb-d112-41a9-8b52-dd2c06c7ac5e"
  },
  {
    email: "gold-refinery@sudan.com",
    password: "GoldRef2024!",
    full_name: "Sudan Gold Refinery",
    legal_entity_id: "4fc20f1e-b35e-4d0a-9489-ca826ba2e4f1"
  },
  {
    email: "petroleum-lab@sudan.com",
    password: "PetroLab2024!",
    full_name: "Sudan National Petroleum Laboratory",
    legal_entity_id: "9df31cf3-7492-4b0d-9045-e9ca9f0b33e3"
  }
];

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const results = [];

    // First, get all existing users to match with our legal entity accounts
    const { data: allUsers } = await supabaseAdmin.auth.admin.listUsers();

    for (const account of legalEntityAccounts) {
      try {
        // Check if user already exists
        const existingUser = allUsers?.users?.find(user => user.email === account.email);
        
        if (existingUser) {
          console.log(`Updating existing user: ${account.email}`);
          
          // Update user metadata first
          const { error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(
            existingUser.id,
            {
              user_metadata: {
                full_name: account.full_name,
                role: 'legal_entity'
              }
            }
          );

          if (updateUserError) {
            console.warn(`Could not update user metadata for ${account.email}:`, updateUserError);
          }

          // Force update the profile with correct data
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
              id: existingUser.id,
              email: account.email,
              full_name: account.full_name,
              role: 'legal_entity',
              legal_entity_id: account.legal_entity_id
            }, { 
              onConflict: 'id',
              ignoreDuplicates: false 
            });

          if (profileError) {
            console.error(`Profile update error for ${account.email}:`, profileError);
            throw profileError;
          }

          results.push({
            email: account.email,
            status: 'updated',
            message: `Profile synced: role=legal_entity, legal_entity_id=${account.legal_entity_id}`
          });

        } else {
          console.log(`Creating new user: ${account.email}`);
          
          // Create new user
          const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: account.email,
            password: account.password,
            email_confirm: true,
            user_metadata: {
              full_name: account.full_name,
              role: 'legal_entity'
            }
          });

          if (authError) throw authError;

          // Create profile for new user
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
              id: newUser.user.id,
              email: account.email,
              full_name: account.full_name,
              role: 'legal_entity',
              legal_entity_id: account.legal_entity_id
            }, { onConflict: 'id' });

          if (profileError) throw profileError;

          results.push({
            email: account.email,
            status: 'created',
            message: 'User and profile created successfully'
          });
        }
      } catch (error) {
        console.error(`Error processing ${account.email}:`, error);
        results.push({
          email: account.email,
          status: 'error',
          message: error.message
        });
      }
    }

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error in create-legal-entity-accounts function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);