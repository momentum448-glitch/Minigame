import type { MonsterDefinition } from './types';

export const MONSTER_ROSTER: MonsterDefinition[] = [
  {
    id: 'mam-reu', name: 'Mầm Rêu', glyph: '🌿', stars: 1, role: 'Hỗ trợ',
    maxHp: 5, move: 3, range: 1, damage: 1,
    skillName: 'Mầm Sống', skillCooldown: 2,
    skillDescription: 'Hồi 2 HP cho đồng minh kề bên; tự dùng hồi 1 HP.',
    skillTarget: 'ally',
    passiveName: 'Bám Đất',
    passiveDescription: 'Kết thúc di chuyển trên Cover nhận 1 khiên tạm.',
    evolution1: [
      { id: 'reu-e1-root', name: 'Rễ Dày', description: '+2 HP tối đa và hồi 2 HP.' },
      { id: 'reu-e1-sap', name: 'Nhựa Sống', description: 'Mầm Sống hồi thêm 1 HP.' },
      { id: 'reu-e1-graft', name: 'Tầm Gửi', description: 'Heal đồng minh cho họ +1 damage ở đòn kế.' }
    ],
    evolution2: [
      { id: 'reu-e2-tree', name: 'Tiểu Cổ Thụ', description: 'Đồng minh kề bên trên Cover cứng cáp hơn.' },
      { id: 'reu-e2-reach', name: 'Mầm Hồi Sinh', description: 'Mầm Sống tăng range lên 2.' },
      { id: 'reu-e2-parasite', name: 'Rêu Ký Sinh', description: 'Basic hit đánh dấu mục tiêu để đồng minh hút 1 HP.' }
    ]
  },
  {
    id: 'chon-chop', name: 'Chồn Chớp', glyph: '⚡', stars: 1, role: 'Trinh sát',
    maxHp: 4, move: 4, range: 1, damage: 1,
    skillName: 'Lướt Điện', skillCooldown: 2,
    skillDescription: 'Lướt tới một ô trong 3 hex; nếu dừng cạnh địch gây 1 damage chắc chắn.',
    skillTarget: 'hex',
    passiveName: 'Nhanh Tay',
    passiveDescription: 'Sau khi di chuyển có thể hút thêm một pickup ở ô kề.',
    evolution1: [
      { id: 'chon-e1-speed', name: 'Bốn Chân Sét', description: '+1 MOV.' },
      { id: 'chon-e1-retreat', name: 'Giật Lùi', description: 'Basic hit cho phép lùi 1 ô nếu trống.' },
      { id: 'chon-e1-charge', name: 'Tích Điện', description: 'Nhặt pickup tăng 1 damage đòn kế.' }
    ],
    evolution2: [
      { id: 'chon-e2-bend', name: 'Chớp Kép', description: 'Lướt Điện linh hoạt hơn.' },
      { id: 'chon-e2-thief', name: 'Kẻ Trộm Sao', description: 'EXP orb cho +2 XP, tối đa 1 lần/round.' },
      { id: 'chon-e2-reflex', name: 'Phản Xạ Điện', description: 'Phản 1 damage lên melee hit đầu mỗi round.' }
    ]
  },
  {
    id: 'giap-te', name: 'Giáp Tê', glyph: '🛡️', stars: 2, role: 'Đỡ đòn',
    maxHp: 8, move: 2, range: 1, damage: 2,
    skillName: 'Húc Khiên', skillCooldown: 2,
    skillDescription: 'Đánh 2 damage và đẩy mục tiêu 1 hex nếu ô sau trống.',
    skillTarget: 'enemy',
    passiveName: 'Mai Dày',
    passiveDescription: 'Cover giảm 40% ranged damage thay vì 25%.',
    evolution1: [
      { id: 'te-e1-fort', name: 'Pháo Đài', description: '+2 HP tối đa.' },
      { id: 'te-e1-horn', name: 'Sừng Công Thành', description: 'Húc mục tiêu không đẩy được gây +1 damage.' },
      { id: 'te-e1-thorns', name: 'Da Phản Chấn', description: 'Phản 1 damage melee hit đầu mỗi round.' }
    ],
    evolution2: [
      { id: 'te-e2-anchor', name: 'Bất Động', description: 'Trên Cover không thể bị đẩy/kéo.' },
      { id: 'te-e2-charge', name: 'Húc Dài', description: 'Húc Khiên có thể mở từ range 2 theo đường thẳng.' },
      { id: 'te-e2-guard', name: 'Giáp Hộ Vệ', description: 'Đồng minh kề bên giảm 1 ranged damage.' }
    ]
  },
  {
    id: 'bo-hoa-dao', name: 'Bọ Hỏa Đao', glyph: '🔥', stars: 2, role: 'Sát thủ',
    maxHp: 6, move: 3, range: 1, damage: 3,
    skillName: 'Xé Lửa', skillCooldown: 2,
    skillDescription: 'Chém mục tiêu kề 2 damage rồi xuyên qua phía sau nếu ô trống.',
    skillTarget: 'enemy',
    passiveName: 'Hơi Nóng',
    passiveDescription: 'Di chuyển ít nhất 2 hex trước Basic Attack được +1 damage.',
    evolution1: [
      { id: 'bo-e1-blade', name: 'Lưỡi Đỏ', description: '+1 DMG, -1 HP tối đa.' },
      { id: 'bo-e1-step', name: 'Chân Than', description: 'Xé Lửa linh hoạt hơn sau khi xuyên.' },
      { id: 'bo-e1-burn', name: 'Tro Bám', description: 'Xé Lửa gây Burn 1 ở activation kế.' }
    ],
    evolution2: [
      { id: 'bo-e2-crit', name: 'Đao Bạo Kích', description: 'Basic crit 20% thay vì 10%.' },
      { id: 'bo-e2-fast', name: 'Xuyên Hậu Tuyến', description: 'Xé Lửa CD còn 1.' },
      { id: 'bo-e2-rebirth', name: 'Hỏa Tái Sinh', description: 'Kill đầu hồi 3 HP và làm mới skill.' }
    ]
  },
  {
    id: 'loi-nhan', name: 'Lôi Nhãn', glyph: '👁️', stars: 3, role: 'Xạ thủ',
    maxHp: 6, move: 2, range: 4, damage: 2,
    skillName: 'Tia Xuyên', skillCooldown: 2,
    skillDescription: 'Bắn tuyến thẳng range 4, gây 2 damage mục tiêu đầu và 1 cho mục tiêu sau.',
    skillTarget: 'enemy',
    passiveName: 'Dư Điện',
    passiveDescription: 'Crit làm mục tiêu -1 MOV ở activation kế.',
    evolution1: [
      { id: 'loi-e1-aim', name: 'Mắt Ngắm', description: '+1 RNG.' },
      { id: 'loi-e1-chain', name: 'Điện Chuỗi', description: 'Mục tiêu thứ hai của Tia Xuyên chịu 2 damage.' },
      { id: 'loi-e1-cover', name: 'Phá Công Sự', description: 'Cover chỉ giảm 10% damage của Lôi Nhãn.' }
    ],
    evolution2: [
      { id: 'loi-e2-sky', name: 'Thiên Lôi', description: '+1 DMG khi bắn từ khoảng cách 4+.' },
      { id: 'loi-e2-overload', name: 'Quá Tải', description: 'Tia Xuyên CD 1 nhưng tự mất 1 HP khi dùng.' },
      { id: 'loi-e2-blind', name: 'Mù Sét', description: 'Tia Xuyên khóa Active Skill activation kế.' }
    ]
  },
  {
    id: 'mong-nam', name: 'Mộng Nấm', glyph: '🍄', stars: 3, role: 'Khống chế',
    maxHp: 7, move: 2, range: 3, damage: 2,
    skillName: 'Bào Tử Dính', skillCooldown: 3,
    skillDescription: 'Đặt bào tử trong range 3; địch bước vào bị dừng di chuyển.',
    skillTarget: 'hex',
    passiveName: 'Thân Bào Tử',
    passiveDescription: 'Không bị ảnh hưởng bởi bào tử của chính mình.',
    evolution1: [
      { id: 'nam-e1-poison', name: 'Nấm Độc', description: 'Bẫy thêm 1 damage.' },
      { id: 'nam-e1-wide', name: 'Nấm Dày', description: 'Tạo thêm một bào tử kề ô chọn.' },
      { id: 'nam-e1-heal', name: 'Nấm Lành', description: 'Đồng minh ăn bào tử để hồi 1 HP.' }
    ],
    evolution2: [
      { id: 'nam-e2-web', name: 'Mạng Nấm', description: 'Skill CD còn 2.' },
      { id: 'nam-e2-haze', name: 'Mê Hương', description: 'Địch mắc bẫy bị -1 RNG activation kế.' },
      { id: 'nam-e2-burst', name: 'Bào Tử Nổ', description: 'Bào tử hết hạn gây 1 damage xung quanh.' }
    ]
  },
  {
    id: 'thiet-ngac', name: 'Thiết Ngạc', glyph: '🐊', stars: 4, role: 'Đấu sĩ',
    maxHp: 10, move: 2, range: 1, damage: 4,
    skillName: 'Ngoạm Khóa', skillCooldown: 2,
    skillDescription: 'Gây 3 damage và khóa normal movement của mục tiêu ở activation kế.',
    skillTarget: 'enemy',
    passiveName: 'Ngửi Máu',
    passiveDescription: 'Có con địch <=50% HP thì activation này +1 MOV.',
    evolution1: [
      { id: 'ngac-e1-jaw', name: 'Hàm Máy', description: '+1 DMG.' },
      { id: 'ngac-e1-iron', name: 'Thân Sắt', description: '+2 HP tối đa.' },
      { id: 'ngac-e1-chain', name: 'Xích Hàm', description: 'Ngoạm Khóa có thể kéo từ range 2.' }
    ],
    evolution2: [
      { id: 'ngac-e2-finish', name: 'Kết Liễu', description: '+2 damage Basic lên mục tiêu <=25% HP.' },
      { id: 'ngac-e2-repair', name: 'Tự Hàn', description: 'Sau kill hồi 3 HP.' },
      { id: 'ngac-e2-lock', name: 'Khóa Chặt', description: 'Mục tiêu Ngoạm Khóa khó bị tái định vị.' }
    ]
  },
  {
    id: 'long-lang-kinh', name: 'Long Lăng Kính', glyph: '🐉', stars: 5, role: 'Boss linh hoạt',
    maxHp: 12, move: 2, range: 3, damage: 3,
    skillName: 'Khúc Xạ', skillCooldown: 3,
    skillDescription: '2 damage mục tiêu chính và 1 damage lên tối đa hai địch kề.',
    skillTarget: 'enemy',
    passiveName: 'Lõi Quang Phổ',
    passiveDescription: 'Đổi loại địa hình trong activation nhận 1 khiên tạm.',
    evolution1: [
      { id: 'long-e1-red', name: 'Phổ Đỏ', description: '+1 DMG.' },
      { id: 'long-e1-blue', name: 'Phổ Lam', description: '+1 RNG và +1 MOV.' },
      { id: 'long-e1-green', name: 'Phổ Lục', description: '+3 HP tối đa.' }
    ],
    evolution2: [
      { id: 'long-e2-split', name: 'Tán Sắc', description: 'Khúc Xạ splash tối đa 4 mục tiêu kề.' },
      { id: 'long-e2-focus', name: 'Hội Tụ', description: 'Khúc Xạ mất splash nhưng primary damage thành 5.' },
      { id: 'long-e2-armor', name: 'Quang Giáp', description: 'Dùng Khúc Xạ nhận 2 khiên tạm.' }
    ]
  }
];

export const MONSTER_BY_ID = Object.fromEntries(
  MONSTER_ROSTER.map((monster) => [monster.id, monster])
) as Record<string, MonsterDefinition>;
