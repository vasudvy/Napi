import { createClient } from 'npm:@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface RequestBody {
  agentId: string;
  apiKey: string;
  action: 'start' | 'message' | 'end';
  payload?: any;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { agentId, apiKey, action, payload } = await req.json() as RequestBody;

    // Validate API key and get user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, eleven_labs_key')
      .eq('api_key', apiKey)
      .single();

    if (userError || !userData) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get agent configuration
    const { data: agentData, error: agentError } = await supabase
      .from('agents')
      .select(`
        id,
        name,
        system_prompt,
        eleven_labs_agent_id,
        agent_tools (
          name,
          description,
          parameters
        )
      `)
      .eq('id', agentId)
      .eq('user_id', userData.id)
      .single();

    if (agentError || !agentData) {
      return new Response(
        JSON.stringify({ error: 'Agent not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Forward request to ElevenLabs with proper configuration
    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/voice-chat/${action}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.eleven_labs_key}`,
        },
        body: JSON.stringify({
          agentId: agentData.eleven_labs_agent_id,
          ...payload,
          systemPrompt: agentData.system_prompt,
          tools: agentData.agent_tools,
        }),
      }
    );

    const elevenLabsData = await elevenLabsResponse.json();

    return new Response(
      JSON.stringify(elevenLabsData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});