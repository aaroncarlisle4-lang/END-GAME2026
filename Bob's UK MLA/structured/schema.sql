-- Dahnert condition profiles
CREATE TABLE IF NOT EXISTS dahnert_conditions (
    id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name                    TEXT NOT NULL,
    slug                    TEXT NOT NULL,
    chapter                 TEXT,
    definition              TEXT,
    dominant_finding        TEXT,
    distribution            TEXT,
    demographics            JSONB,
    discriminating_features TEXT[],
    other_features          JSONB,
    clinical                JSONB,
    source_file             TEXT,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (slug, chapter)
);

-- Dahnert DDx finding clusters
CREATE TABLE IF NOT EXISTS dahnert_ddx (
    id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    finding        TEXT NOT NULL,
    slug           TEXT NOT NULL,
    chapter        TEXT,
    cluster_type   TEXT DEFAULT 'differential'
                   CHECK (cluster_type IN ('differential','framework','mixed')),
    differentials  JSONB,
    criteria       JSONB,
    context        TEXT,
    quality_score  FLOAT,
    source_file    TEXT,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (slug, chapter)
);

CREATE INDEX IF NOT EXISTS idx_dahnert_conditions_slug ON dahnert_conditions (slug);
CREATE INDEX IF NOT EXISTS idx_dahnert_ddx_slug        ON dahnert_ddx (slug);
CREATE INDEX IF NOT EXISTS idx_dahnert_ddx_type        ON dahnert_ddx (cluster_type);
CREATE INDEX IF NOT EXISTS idx_dahnert_conditions_demographics
    ON dahnert_conditions USING GIN (demographics);
CREATE INDEX IF NOT EXISTS idx_dahnert_ddx_differentials
    ON dahnert_ddx USING GIN (differentials);
CREATE INDEX IF NOT EXISTS idx_dahnert_ddx_criteria
    ON dahnert_ddx USING GIN (criteria);
