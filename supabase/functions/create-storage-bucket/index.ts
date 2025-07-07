// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/supabase-functions

import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Admin key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    // Create the recordings bucket if it doesn't exist
    const { data: bucketData, error: bucketError } =
      await supabaseAdmin.storage.createBucket("recordings", {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: [
          "audio/webm",
          "audio/mp3",
          "audio/mpeg",
          "audio/wav",
        ],
      });

    if (bucketError && !bucketError.message.includes("already exists")) {
      throw bucketError;
    }

    return new Response(
      JSON.stringify({
        message: "Storage bucket created successfully",
        bucket: "recordings",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (err) {
    const error = err as Error;
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

interface RequestEvent {
  request: Request;
}

interface ErrorResponse {
  message: string;
}

declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response>) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};
