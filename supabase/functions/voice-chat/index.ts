import { createClient } from 'npm:@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    const apiKey = req.headers.get('X-API-Key');

    if (!apiKey) {
      throw new Error('API key is required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate API key
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('id, user_id')
      .eq('key', apiKey)
      .eq('is_active', true)
      .single();

    if (keyError || !keyData) {
      throw new Error('Invalid API key');
    }

    // Forward request to ElevenLabs
    const elevenLabsResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': Deno.env.get('ELEVENLABS_API_KEY') ?? '',
      },
      body: req.body,
    });

    const responseTime = Date.now() - startTime;

    // Log usage
    await supabase.from('usage_logs').insert({
      api_key_id: keyData.id,
      request_type: 'text-to-speech',
      status: elevenLabsResponse.status.toString(),
      response_time: responseTime
    });

    // Update API key usage
    await supabase.from('api_keys')
      .update({ 
        last_used_at: new Date().toISOString(),
        calls_count: keyData.calls_count + 1
      })
      .eq('id', keyData.id);

    return new Response(
      await elevenLabsResponse.blob(),
      { 
        status: elevenLabsResponse.status,
        headers: {
          ...corsHeaders,
          'Content-Type': elevenLabsResponse.headers.get('Content-Type') ?? 'application/json'
        }
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