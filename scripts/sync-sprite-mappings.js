/**
 * all-sprites.json 기준으로 모든 매핑 파일 동기화
 *
 * 사용법: node scripts/sync-sprite-mappings.js
 *
 * all-sprites.json이 Unity에서 내보낸 원본 데이터이며,
 * 모든 개별 매핑 파일은 이 순서를 따라야 함
 */

const fs = require('fs');
const path = require('path');

const BASE_PATH = path.join(__dirname, '../public/data/sprites');
const ALL_SPRITES_PATH = path.join(BASE_PATH, 'all-sprites.json');

// 한글 이름 생성 규칙
const NAME_PATTERNS = [
  // 종족/스타일 prefix
  ['Elf_', '엘프 '],
  ['Orc_', '오크 '],
  ['Undead_', '언데드 '],
  ['New_Elf_', '신규 엘프 '],
  ['New_', '신규 '],
  ['Normal_', '일반 '],
  ['Devil_', '악마 '],
  ['Human_', '인간 '],
  ['Skelton_', '스켈레톤 '],
  ['Zombie_', '좀비 '],

  // 직업 스타일
  ['_Archer_', ' 궁수 '],
  ['_Healer_', ' 힐러 '],
  ['_Knight_', ' 기사 '],
  ['_Rogue_', ' 도적 '],
  ['Weapon_Archer_', '궁수 '],
  ['Weapon_Healer_', '힐러 '],
  ['Weapon_Knight_', '기사 '],
  ['Weapon_Rogue_', '도적 '],
  ['Weapon_Sorcerer', '마법사 지팡이'],
  ['Weapon_Sorceress', '마녀 지팡이'],
  ['Shield_Knight_', '기사 방패 '],
  ['Shield_Sorcerer', '마법사 방패'],
  ['Shield_Sorceress', '마녀 방패'],

  // 장비 타입
  ['Helmet_Sorcerer', '마법사 투구'],
  ['Helmet_Sorceress', '마녀 투구'],
  ['Cloth_Sorcerer', '마법사 옷'],
  ['Cloth_Sorceress', '마녀 옷'],
  ['Pant_Sorcerer', '마법사 바지'],
  ['Pant_Sorceress', '마녀 바지'],
  ['Back_Sorcerer', '마법사 망토'],
  ['Back_Sorceress', '마녀 망토'],
  ['Armor_Sorcerer', '마법사 갑옷'],

  // 장비 prefix
  ['Helmet_m', '모자 '],
  ['Helmet_', '투구 '],
  ['Armor_', '갑옷 '],
  ['Cloth_', '옷 '],
  ['Pant_', '바지 '],
  ['Back_', '망토 '],
  ['Sword_', '검 '],
  ['Axe_', '도끼 '],
  ['Bow_', '활 '],
  ['Shield_', '방패 '],
  ['Spear_', '창 '],
  ['Ward_', '수호 지팡이 '],
  ['Foot_m', '신발 '],
  ['Foot_', '신발 '],
  ['Hair_m', '머리 '],
  ['Hair_', '머리 '],
  ['FaceHair_', '수염 '],
  ['face_acc_m', '얼굴장식 '],
  ['face_cheek', '볼터치'],
  ['face_eyelash', '속눈썹'],
  ['face_lip', '립스틱'],
  ['Orc_Mouse_', '오크 엄니 '],
  ['Normal_Mustache', '일반 콧수염'],

  // 특수
  ['F_SR_', '특수 '],
  ['Soon_', '순 '],
  ['BowBack_', '활집 '],

  // 현대복
  ['dress_', '드레스 '],
  ['suit_', '정장 '],
  ['tee_', '티셔츠 '],
  ['winter', '겨울옷'],
  ['farmer', '농부옷'],
  ['hoodie', '후드티'],

  // 색상 변형
  ['_black', ' 검정'],
  ['_blonde', ' 금발'],
  ['_brown', ' 갈색'],
  ['_color', ' 컬러'],
  ['_c1', ' 색1'],
  ['_c2', ' 색2'],
  ['_g1', ' 금장1'],
  ['_g2', ' 금장2'],
  ['_g', ' 금장'],

  // 눈
  ['Eye_Close', '감은 눈'],
  ['Eye', '눈 '],
];

function generateKoName(sprite) {
  let name = sprite;

  for (const [pattern, korean] of NAME_PATTERNS) {
    if (name.includes(pattern)) {
      name = name.replace(pattern, korean);
    }
  }

  // 언더스코어 정리
  name = name.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();

  return name;
}

function generateRace(sprite) {
  if (sprite.includes('Elf_') || sprite.includes('New_Elf')) return 'elf';
  if (sprite.includes('Orc_')) return 'orc';
  if (sprite.includes('Undead_') || sprite.includes('Zombie_') || sprite.includes('Skelton_')) return 'undead';
  if (sprite.includes('Human_')) return 'human';
  if (sprite.includes('Devil_')) return 'tiefling';
  return 'common';
}

function generateStyle(sprite) {
  if (sprite.includes('Elf_')) return 'elf';
  if (sprite.includes('Orc_')) return 'orc';
  if (sprite.includes('Undead_')) return 'undead';
  if (sprite.includes('_Knight_') || sprite.includes('Knight_')) return 'knight';
  if (sprite.includes('_Archer_') || sprite.includes('Archer_')) return 'archer';
  if (sprite.includes('_Healer_') || sprite.includes('Healer_')) return 'healer';
  if (sprite.includes('_Rogue_') || sprite.includes('Rogue_')) return 'rogue';
  if (sprite.includes('Sorcerer') || sprite.includes('Sorceress')) return 'mage';
  return 'common';
}

function generateMappingFile(sprites, arrayName, options = {}) {
  const { includeRace = false, includeStyle = false, includeType = false } = options;

  const items = sprites.map((sprite, index) => {
    const item = {
      id: sprite.toLowerCase().replace(/\s+/g, '_'),
      index,
      sprite,
      ko: generateKoName(sprite),
      en: sprite.replace(/_/g, ' ')
    };

    if (includeRace) item.race = generateRace(sprite);
    if (includeStyle) item.style = generateStyle(sprite);

    return item;
  });

  const idToIndex = {};
  items.forEach(item => {
    idToIndex[item.id] = item.index;
  });

  return {
    sprites,
    count: sprites.length,
    nameToIndex: sprites.reduce((acc, name, idx) => { acc[name] = idx; return acc; }, {}),
    [arrayName]: items,
    idToIndex
  };
}

function main() {
  console.log('📦 all-sprites.json 기준 매핑 파일 동기화\n');

  // all-sprites.json 읽기
  const allSprites = JSON.parse(fs.readFileSync(ALL_SPRITES_PATH, 'utf8'));

  // 외형 매핑
  const appearancePath = path.join(BASE_PATH, 'appearance');

  // body.json
  const bodyData = generateMappingFile(allSprites.bodyNames, 'bodies', { includeRace: true });
  fs.writeFileSync(path.join(appearancePath, 'body.json'), JSON.stringify(bodyData, null, 2));
  console.log(`✓ body.json - ${allSprites.bodyNames.length}개`);

  // eye.json
  const eyeData = generateMappingFile(allSprites.eyeNames, 'eyes');
  fs.writeFileSync(path.join(appearancePath, 'eye.json'), JSON.stringify(eyeData, null, 2));
  console.log(`✓ eye.json - ${allSprites.eyeNames.length}개`);

  // hair.json
  const hairData = generateMappingFile(allSprites.hairNames, 'hairs', { includeRace: true });
  fs.writeFileSync(path.join(appearancePath, 'hair.json'), JSON.stringify(hairData, null, 2));
  console.log(`✓ hair.json - ${allSprites.hairNames.length}개`);

  // facehair.json
  const facehairData = generateMappingFile(allSprites.facehairNames, 'facehairs');
  fs.writeFileSync(path.join(appearancePath, 'facehair.json'), JSON.stringify(facehairData, null, 2));
  console.log(`✓ facehair.json - ${allSprites.facehairNames.length}개`);

  // 무기 매핑
  const weaponsPath = path.join(BASE_PATH, 'equipment/weapons');

  const swordData = generateMappingFile(allSprites.swordNames, 'swords', { includeStyle: true });
  fs.writeFileSync(path.join(weaponsPath, 'sword.json'), JSON.stringify(swordData, null, 2));
  console.log(`✓ sword.json - ${allSprites.swordNames.length}개`);

  const axeData = generateMappingFile(allSprites.axeNames, 'axes', { includeStyle: true });
  fs.writeFileSync(path.join(weaponsPath, 'axe.json'), JSON.stringify(axeData, null, 2));
  console.log(`✓ axe.json - ${allSprites.axeNames.length}개`);

  const bowData = generateMappingFile(allSprites.bowNames, 'bows', { includeStyle: true });
  fs.writeFileSync(path.join(weaponsPath, 'bow.json'), JSON.stringify(bowData, null, 2));
  console.log(`✓ bow.json - ${allSprites.bowNames.length}개`);

  const shieldData = generateMappingFile(allSprites.shieldNames, 'shields', { includeStyle: true });
  fs.writeFileSync(path.join(weaponsPath, 'shield.json'), JSON.stringify(shieldData, null, 2));
  console.log(`✓ shield.json - ${allSprites.shieldNames.length}개`);

  const spearData = generateMappingFile(allSprites.spearNames, 'spears', { includeStyle: true });
  fs.writeFileSync(path.join(weaponsPath, 'spear.json'), JSON.stringify(spearData, null, 2));
  console.log(`✓ spear.json - ${allSprites.spearNames.length}개`);

  const wandData = generateMappingFile(allSprites.wandNames, 'wands', { includeStyle: true });
  fs.writeFileSync(path.join(weaponsPath, 'wand.json'), JSON.stringify(wandData, null, 2));
  console.log(`✓ wand.json - ${allSprites.wandNames.length}개`);

  const daggerData = generateMappingFile(allSprites.daggerNames, 'daggers', { includeStyle: true });
  fs.writeFileSync(path.join(weaponsPath, 'dagger.json'), JSON.stringify(daggerData, null, 2));
  console.log(`✓ dagger.json - ${allSprites.daggerNames.length}개`);

  // 방어구 매핑
  const armorPath = path.join(BASE_PATH, 'equipment/armor');

  const helmetData = generateMappingFile(allSprites.helmetNames, 'helmets', { includeStyle: true });
  fs.writeFileSync(path.join(armorPath, 'helmet.json'), JSON.stringify(helmetData, null, 2));
  console.log(`✓ helmet.json - ${allSprites.helmetNames.length}개`);

  const armorItemData = generateMappingFile(allSprites.armorNames, 'armors', { includeStyle: true });
  fs.writeFileSync(path.join(armorPath, 'armor.json'), JSON.stringify(armorItemData, null, 2));
  console.log(`✓ armor.json - ${allSprites.armorNames.length}개`);

  const clothData = generateMappingFile(allSprites.clothNames, 'cloths', { includeStyle: true });
  fs.writeFileSync(path.join(armorPath, 'cloth.json'), JSON.stringify(clothData, null, 2));
  console.log(`✓ cloth.json - ${allSprites.clothNames.length}개`);

  const pantData = generateMappingFile(allSprites.pantNames, 'pants', { includeStyle: true });
  fs.writeFileSync(path.join(armorPath, 'pant.json'), JSON.stringify(pantData, null, 2));
  console.log(`✓ pant.json - ${allSprites.pantNames.length}개`);

  const backData = generateMappingFile(allSprites.backNames, 'backs', { includeStyle: true });
  fs.writeFileSync(path.join(armorPath, 'back.json'), JSON.stringify(backData, null, 2));
  console.log(`✓ back.json - ${allSprites.backNames.length}개`);

  console.log('\n✅ 동기화 완료!');
}

main();
