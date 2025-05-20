/*
  # API Usage Tracking Schema

  1. New Tables
    - `api_keys`: Stores API keys for users
      - `id` (uuid, primary key)
      - `key` (text, unique)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `last_used_at` (timestamptz)
      - `calls_count` (integer)
      - `is_active` (boolean)
    
    - `usage_logs`: Tracks API usage
      - `id` (uuid, primary key)
      - `key_id` (uuid, references api_keys)
      - `timestamp` (timestamptz)
      - `request_type` (text)
      - `status` (text)
      - `response_time` (integer)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read their own data
*/

-- Create API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz,
  calls_count integer DEFAULT 0,
  is_active boolean DEFAULT true
);

-- Create usage logs table
CREATE TABLE IF NOT EXISTS usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id uuid REFERENCES api_keys NOT NULL,
  timestamp timestamptz DEFAULT now(),
  request_type text NOT NULL,
  status text NOT NULL,
  response_time integer NOT NULL
);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own API keys"
  ON api_keys
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own usage logs"
  ON usage_logs
  FOR SELECT
  TO authenticated
  USING (
    key_id IN (
      SELECT id FROM api_keys WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_usage_logs_key_id ON usage_logs(key_id);
CREATE INDEX idx_usage_logs_timestamp ON usage_logs(timestamp);