-- Run this in: Supabase Dashboard → SQL Editor → New Query

CREATE TABLE IF NOT EXISTS predictions (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at          TIMESTAMPTZ DEFAULT now(),
  is_demo             BOOLEAN DEFAULT false,

  -- Applicant input features
  input_data          JSONB NOT NULL,

  -- Prediction outputs
  risk_score          INTEGER NOT NULL,          -- 0–100
  default_probability FLOAT NOT NULL,            -- 0.0–1.0
  risk_category       TEXT NOT NULL,             -- Low | Medium | High | Critical
  recommendation      TEXT NOT NULL,             -- Approve | Review | Reject
  shap_values         JSONB,                     -- Top SHAP contributions

  -- Metadata
  model_version       TEXT DEFAULT '1.0'
);

-- Index for fast user history queries
CREATE INDEX IF NOT EXISTS idx_predictions_user_created
  ON predictions(user_id, created_at DESC);

-- Row Level Security
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own predictions"
  ON predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own predictions"
  ON predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
