-- MUG Game Database Schema
-- Fantasy MUG Game with character customization and monetization

-- 유저 프로필 테이블
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 기본 정보
  nickname TEXT UNIQUE,
  avatar_url TEXT,

  -- 게임 데이터
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,

  -- 재화
  gold INTEGER DEFAULT 0,           -- 인게임 골드
  gems INTEGER DEFAULT 0,           -- 프리미엄 재화 (유료)

  -- 프리미엄/VIP
  is_premium BOOLEAN DEFAULT FALSE,
  premium_until TIMESTAMPTZ,

  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- 캐릭터 테이블 (유저당 여러 캐릭터 가능)
CREATE TABLE IF NOT EXISTS public.characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- 캐릭터 정보
  name TEXT NOT NULL,
  is_main BOOLEAN DEFAULT FALSE,

  -- 외형 (SPUM 인덱스 기반)
  body_index INTEGER DEFAULT 0,
  eye_index INTEGER DEFAULT 0,
  hair_index INTEGER DEFAULT -1,
  cloth_index INTEGER DEFAULT -1,
  armor_index INTEGER DEFAULT -1,
  pant_index INTEGER DEFAULT -1,
  helmet_index INTEGER DEFAULT -1,
  back_index INTEGER DEFAULT -1,
  left_weapon_index INTEGER DEFAULT -1,
  right_weapon_index INTEGER DEFAULT -1,
  left_weapon_type TEXT DEFAULT '',
  right_weapon_type TEXT DEFAULT '',

  -- 색상 (Hex)
  body_color TEXT DEFAULT 'FFFFFF',
  eye_color TEXT DEFAULT 'FFFFFF',
  hair_color TEXT DEFAULT 'FFFFFF',
  cloth_color TEXT DEFAULT 'FFFFFF',
  armor_color TEXT DEFAULT 'FFFFFF',
  pant_color TEXT DEFAULT 'FFFFFF',

  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 결제 기록 테이블
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- 결제 정보
  product_id TEXT NOT NULL,           -- 상품 ID (gems_100, premium_month 등)
  product_type TEXT NOT NULL,         -- gems, premium, item
  amount INTEGER NOT NULL,            -- 수량
  price_krw INTEGER NOT NULL,         -- 결제 금액 (원)

  -- 결제 상태
  status TEXT DEFAULT 'pending',      -- pending, completed, refunded, failed
  payment_method TEXT,                -- card, kakao, apple, google
  transaction_id TEXT,                -- 외부 결제 ID

  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 인벤토리 테이블 (아이템 소유)
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  item_id TEXT NOT NULL,              -- 아이템 식별자
  item_type TEXT NOT NULL,            -- equipment, consumable, cosmetic
  quantity INTEGER DEFAULT 1,

  -- 장착 상태
  equipped_on UUID REFERENCES public.characters(id),

  -- 메타데이터
  acquired_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, item_id)
);

-- 상점 상품 테이블
CREATE TABLE IF NOT EXISTS public.shop_products (
  id TEXT PRIMARY KEY,                -- gems_100, premium_month 등

  name_ko TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ko TEXT,
  description_en TEXT,

  product_type TEXT NOT NULL,         -- gems, premium, item_pack

  -- 가격
  price_krw INTEGER NOT NULL,
  price_usd DECIMAL(10,2),

  -- 보상
  gems_amount INTEGER DEFAULT 0,
  gold_amount INTEGER DEFAULT 0,
  premium_days INTEGER DEFAULT 0,
  items JSONB DEFAULT '[]',           -- [{item_id, quantity}]

  -- 표시
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,

  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON public.characters(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.purchases(status);
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON public.inventory(user_id);

-- RLS (Row Level Security) 정책
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- 프로필: 본인만 조회/수정 가능
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 캐릭터: 본인만 조회/수정/삭제 가능
CREATE POLICY "Users can view own characters" ON public.characters
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own characters" ON public.characters
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own characters" ON public.characters
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own characters" ON public.characters
  FOR DELETE USING (auth.uid() = user_id);

-- 구매: 본인만 조회 가능 (삽입은 서버에서만)
CREATE POLICY "Users can view own purchases" ON public.purchases
  FOR SELECT USING (auth.uid() = user_id);

-- 인벤토리: 본인만 조회 가능
CREATE POLICY "Users can view own inventory" ON public.inventory
  FOR SELECT USING (auth.uid() = user_id);

-- 상점: 모든 사용자 조회 가능
ALTER TABLE public.shop_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active products" ON public.shop_products
  FOR SELECT USING (is_active = TRUE);

-- 회원가입 시 자동으로 프로필 생성하는 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거: 새 유저 생성 시 프로필 자동 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거: updated_at 자동 갱신
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_characters_updated_at
  BEFORE UPDATE ON public.characters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 초기 상점 데이터
INSERT INTO public.shop_products (id, name_ko, name_en, product_type, price_krw, price_usd, gems_amount, sort_order) VALUES
  ('gems_100', '보석 100개', '100 Gems', 'gems', 1100, 0.99, 100, 1),
  ('gems_500', '보석 500개 (+50)', 'Gems 500 (+50)', 'gems', 5500, 4.99, 550, 2),
  ('gems_1200', '보석 1200개 (+200)', '1200 Gems (+200)', 'gems', 11000, 9.99, 1400, 3),
  ('gems_3000', '보석 3000개 (+600)', '3000 Gems (+600)', 'gems', 27500, 24.99, 3600, 4),
  ('premium_month', '프리미엄 (30일)', 'Premium (30 days)', 'premium', 9900, 8.99, 0, 10),
  ('premium_year', '프리미엄 (1년)', 'Premium (1 year)', 'premium', 59000, 49.99, 0, 11)
ON CONFLICT (id) DO NOTHING;
