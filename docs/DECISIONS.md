# Durable Decisions

Các quyết định trong file này được coi là đã chốt cho tới khi người dùng chủ động đổi.

## D-001 — Kiến trúc sản phẩm
- Một website chứa nhiều minigame.
- Một repo chung: `momentum448-glitch/Minigame`.
- Thêm từng game như module độc lập.
- Quyết định: CHỐT.

## D-002 — Nền tảng
- Web responsive PC + mobile.
- Mobile-first.
- React + TypeScript + Vite.
- GitHub Pages.
- Chưa cần backend.
- Quyết định: CHỐT.

## D-003 — Game đầu tiên
- Ô ăn quan.
- Art direction dân gian Việt Nam nhưng trình bày hiện đại.
- Quyết định: CHỐT.

## D-004 — Chế độ chơi
- 2 người local.
- Người vs AI.
- AI: Dễ / Vừa / Khó.
- Quyết định: CHỐT.

## D-005 — Tương tác cơ bản
- Chạm ô dân của mình.
- Sau đó chọn hướng trái/phải.
- Quyết định: CHỐT.

## D-006 — Luật chính
- Quan = 10 điểm.
- Có Quan non.
- Quan non không được ăn nếu ô Quan có dưới 5 dân đi kèm.
- Refill 5 ô dân khi bên mình trống.
- Thiếu dân refill thì vay và ghi nợ.
- Kết thúc khi cả hai Quan bị ăn.
- Quyết định: CHỐT.

## D-007 — Animation gameplay
- Trải nghiệm rải quân phải mô phỏng thao tác ngoài đời:
  - cầm toàn bộ quân trong ô;
  - rải từng quân một;
  - bốc tiếp rồi rải tiếp nếu luật yêu cầu;
  - capture/refill cũng có nhịp biểu diễn.
- Không được thay engine luật bằng logic animation.
- Quyết định: CHỐT ngày 2026-09-23.


## D-008 — Animation tempo
- Tốc độ rải mặc định khoảng **500 ms cho mỗi quân** để người chơi theo dõi rõ từng viên.
- Nhịp pickup / bốc tiếp chậm hơn drop một chút; capture có khoảng nghỉ riêng.
- Nếu sau QC thực tế cần đổi, ưu tiên giữ cảm giác rõ ràng ngoài đời hơn là tối đa tốc độ.
- Quyết định: CHỐT ngày 2026-09-23.


## D-009 — Flying pebble path
- Mỗi lần rải/refill phải thấy một viên sỏi **rời vùng tay và bay tới đúng ô đích** trước khi quân được cộng vào ô.
- Quỹ đạo cong nhẹ, có chuyển động xoay và nhịp landing; tổng nhịp vẫn khoảng 500 ms/quân.
- Engine và move trace vẫn là source of truth; quỹ đạo chỉ là lớp biểu diễn.
- Quyết định: CHỐT ngày 2026-09-23.


## D-010 — Game hub entry
- URL gốc của website mở **Kho game**, không mở thẳng một game.
- Mỗi game có route riêng; Ô ăn quan hiện dùng `#/o-an-quan` để tương thích GitHub Pages.
- Trang home hiển thị các game dưới dạng thẻ; game playable có CTA vào chơi, game chưa làm chỉ hiện `Sắp có`.
- Từ game phải có đường quay lại Kho game.
- Các tên game placeholder trên home không mặc định trở thành roadmap đã chốt.
- Quyết định: CHỐT ngày 2026-09-23.


## D-011 — Game 02
- Game thứ hai của kho Minigame là **Cờ Gánh**.
- Cờ Gánh là game playable riêng, không phải placeholder.
- Route: `#/co-ganh`.
- Quyết định: CHỐT ngày 2026-09-24.

## D-012 — Cờ Gánh ruleset v0.1
- 16 quân đổi màu, không loại quân khỏi bàn.
- Đi một bước sang giao điểm kề theo đúng đường kẻ.
- Dùng ba cơ chế lõi: **Gánh + Vây + Mở**.
- Gánh chỉ phát sinh khi người chơi chủ động đi vào giữa cặp quân đối phương.
- Vây áp dụng cho cả nhóm liên thông không còn giao điểm trống kề.
- Thế Mở ép đối phương đi vào điểm vừa được tạo nếu đó là nước Gánh hợp lệ bắt buộc.
- Thắng khi không còn quân màu đối phương.
- Không dùng biến thể `chém` hoặc `ăn xong đi tiếp` trong v0.1.
- Chi tiết nguồn và mapping bàn: `docs/CO_GANH_RULES.md`.
- Quyết định: CHỐT ngày 2026-09-24.


## D-013 — Cờ Gánh animation language
- Mục tiêu animation: cân bằng nhưng **nghiêng về rõ ràng** hơn hiệu ứng phô diễn.
- Nhịp di chuyển quân mục tiêu: khoảng **450–550 ms**, lấy mốc làm việc ~500 ms.
- Kiểu di chuyển: **nhấc nhẹ rồi lướt sang điểm đích và đáp xuống**, không bay cong như Ô ăn quan.
- Quân bị Gánh: **flip/lật + đổi màu + glow/pulse** để nhấn mạnh việc đổi phe.
- Nếu nhiều quân bị Gánh trong một nước: hiệu ứng **lần lượt từng quân** thay vì đổi đồng thời.
- Quyết định: CHỐT ngày 2026-09-24.


## D-014 — Cờ Gánh capture timing
- **Vây dùng hiệu ứng riêng** dạng làn sóng qua nhóm bị khóa, không dùng cùng hiệu ứng flip của Gánh.
- Quân bị **Gánh đổi phe lần lượt**, lấy nhịp khoảng **400 ms/quân** để đọc rõ từng quân.
- Sau khi quân di chuyển đáp xuống, nghỉ khoảng **200 ms** trước khi bắt đầu chuỗi Gánh/Vây.
- Engine/state logic không đổi; UI phát sequence từ kết quả đã resolve.
- Quyết định: CHỐT ngày 2026-09-24.


## D-015 — Game 03
- Game thứ ba của Kho game là **Cờ Hùm**.
- Dùng biến thể dân gian **1 Hùm + 15 Trâu**, không dùng Cờ Hùm Tôm.
- Route: `#/co-hum`.
- Quyết định: CHỐT ngày 2026-09-24.

## D-016 — Cờ Hùm ruleset v0.1
- Bàn chính 5×5 giao điểm + Hang Hùm nối giữa cạnh phải.
- Tổng graph 29 node: 25 bàn chính + 4 node Hang bổ sung.
- 15 Trâu ở vành ngoài bàn chính, trừ cửa Hang; Hùm ở đỉnh ngoài của Hang.
- Hùm đi trước.
- Mỗi lượt một quân đi một bước theo đường kẻ tới điểm trống.
- Hùm vồ bằng một cú nhảy qua Trâu sang landing trống trên cùng đường; Trâu bị loại.
- v0.1 dùng **1 capture/lượt**, không multi-jump.
- Cấm lập tức đảo ngược exact nước của cùng bên ở lượt trước.
- Hùm thắng khi ăn hết 15 Trâu.
- Trâu thắng khi Hùm không còn step/capture hợp lệ.
- Đấu AI cho phép người chơi chọn bên Hùm hoặc Trâu.
- Nguồn và các giả định: `docs/CO_HUM_RULES.md`.
- Quyết định: CHỐT ngày 2026-09-24.


## D-017 — Cờ Hùm animation + forbidden move feedback
- Mục tiêu UX: cân bằng nhưng **nghiêng về rõ luật**.
- Tempo di chuyển quân: khoảng **550–650 ms**, lấy mốc triển khai **600 ms**.
- Di chuyển phải thấy quân đi từ từ từ điểm cũ tới điểm mới.
- Nước **Vồ** dùng sequence riêng: Hùm nhảy -> nghỉ khoảng 200 ms -> Trâu rung/trúng đòn -> biến mất -> cập nhật số Trâu.
- Hiệu ứng Vồ phải có marker thị giác rõ, gồm nhãn **VỒ!** và impact ring.
- Nước cấm đi ngược không hiển thị như nước hợp lệ.
- Nếu người chơi thử chạm đúng điểm bị cấm, điểm đó nháy đỏ + hiện `↩ CẤM` + giải thích “Không được đi ngược lại đúng nước mà bên này vừa di chuyển.”
- Input khóa trong toàn bộ move/capture animation; AI dùng cùng animation.
- Quyết định: CHỐT ngày 2026-09-24.


## D-018 — Game 04
- Game thứ tư của Kho game là **Cờ Lúa Ngô**.
- Route: `#/co-lua-ngo`.
- Bản đầu dùng nhịp **Lúa · Ngô · Khoai · Sắn · Đỗ**, không trộn dị bản Kim · Mộc · Thủy · Hỏa · Thổ.
- Quyết định: CHỐT ngày 2026-09-24.

## D-019 — Cờ Lúa Ngô ruleset v0.1
- 2 người, 8 quân chia 4–4.
- Bàn số hóa 12 giao điểm từ hai hình chữ nhật chồng vuông góc.
- Mỗi lượt chọn 1 quân và đi tối đa 5 bước theo đường kẻ.
- Bước 1–4 chỉ vào điểm trống.
- Bước 5 (Đỗ) có thể vào điểm trống hoặc vào quân đối phương để ăn.
- Không được vượt qua quân.
- Nếu trước bước 5 hết đường trống hợp lệ thì dừng và hết lượt.
- v0.1 không cho lặp lại giao điểm trong cùng lượt; đây là giả định số hóa cần QC vì nguồn không nói rõ.
- Ăn hết quân đối phương thì thắng.
- Chi tiết nguồn và giả định: `docs/CO_LUA_NGO_RULES.md`.
- Quyết định: CHỐT ngày 2026-09-24.


## D-020 — Game 05
- Game thứ năm của Kho game là **Tam Cúc**.
- Bản đầu tập trung biến thể **tay đôi 2 người**, phù hợp local + AI.
- Route: `#/tam-cuc`.
- Quyết định: CHỐT ngày 2026-09-24.

## D-021 — Tam Cúc ruleset v0.1
- Bộ 32 lá, 16 đỏ + 16 đen; mỗi người tay đôi nhận 16 lá và hai bên biết bài nhau.
- Thứ tự: Tướng > Sĩ > Tượng > Xe > Pháo > Mã > Tốt; cùng tên đỏ > đen.
- Gọi 1/2/3 cây.
- Đôi = cùng tên + cùng màu.
- Bộ ba hợp lệ chỉ Tướng–Sĩ–Tượng hoặc Xe–Pháo–Mã cùng màu.
- Người đáp bỏ đúng số cây; có thể Ngửa bài hoặc Chui.
- Lượt đầu v0.1 dùng “cấm Tướng, cấm Sĩ, lấy Tượng cầm đầu”.
- Nếu sức mạnh bằng hệt nhau, cái thắng hòa.
- v0.1 tính thắng bằng tổng số lá ăn được; chưa triển khai Trình làng/Kết/Đè và điểm thưởng truyền thống.
- Chi tiết nguồn/mâu thuẫn/giả định: `docs/TAM_CUC_RULES.md`.
- Quyết định: CHỐT ngày 2026-09-24.


## D-022 — Tam Cúc rules clarity + selected-card feedback
- Luật Tam Cúc phải được giải thích ngay trong game theo cấu trúc dễ học, không chỉ một đoạn mô tả ngắn.
- Phần luật phải làm rõ: mục tiêu, thứ tự sức mạnh, đỏ/đen, flow một lượt, cách tạo đôi/bộ ba, Ngửa bài, Chui, luật lượt đầu, kết thúc và các luật chưa hỗ trợ.
- Lá đã chọn phải có trạng thái thị giác mạnh: nhấc lên, viền/glow rõ, nền khác và badge **✓ ĐÃ CHỌN**.
- Khu hành động phải liệt kê tên chính xác các lá đang được chọn và nhắc số lá cần chọn khi đáp.
- Chỉ thay UX/clarity, không đổi engine/ruleset v0.1.
- Quyết định: CHỐT ngày 2026-09-24.


## D-023 — Game 06
- Game thứ sáu của Kho game là **Bài Chòi**.
- Dùng hình thức **Hội 9 chòi** làm gameplay số hóa đầu tiên.
- Route: `#/bai-choi`.
- Quyết định: CHỐT ngày 2026-09-24.

## D-024 — Bài Chòi ruleset v0.1
- Dùng bộ 27 con theo hệ hội 9 chòi; mỗi chòi nhận 3 con.
- Có một bộ bài tỳ trùng 27 con, xáo độc lập để Anh Hiệu rút.
- Mỗi lượt: hô thai minh họa -> xướng tên con -> chòi sở hữu con đó được đánh dấu/gõ mõ.
- Chòi đầu tiên đủ 3 con thì **TỚI** và thắng hội.
- Solo: 1 người + 8 chòi máy.
- Local: 2 người + 7 chòi máy.
- Không có AI Dễ/Vừa/Khó vì Bài Chòi v0.1 không có quyết định chiến thuật ở phía chòi; máy không được can thiệp xác suất.
- Câu hô thai trong web là câu mới do dự án biên soạn, không giả là lời cổ truyền chuẩn.
- Nguồn và danh sách 27 con: `docs/BAI_CHOI_RULES.md`.
- Quyết định: CHỐT ngày 2026-09-24.


## D-025 — Bài Chòi sound + mobile cards
- Bài Chòi phải có audio thật, không chỉ chữ mô phỏng âm thanh.
- v0.2 dùng Web Audio tổng hợp trực tiếp trong trình duyệt:
  - trống ngắn khi bắt đầu Hô thai;
  - tiếng mõ khi một chòi trúng;
  - nhịp thắng hội khi TỚI.
- Khi xướng tên con bài, game thử đọc tên bằng Speech Synthesis `vi-VN`; nếu thiết bị không có giọng Việt thì mõ/trống vẫn hoạt động.
- Có nút **Âm thanh Bật/Tắt**, mặc định bật; tương tác Hô thai/Xướng tên là user gesture để mở khóa audio trên mobile.
- Trên mobile, chòi người chơi được ưu tiên toàn chiều ngang và 3 thẻ được phóng lớn; chòi máy vẫn giữ layout gọn.
- Quyết định: CHỐT ngày 2026-09-24.


## D-026 — Bài Chòi voice selector + chant prototype
- Bài Chòi v0.3 phải cho người chơi chọn giọng Speech Synthesis có trên thiết bị; ưu tiên voice `vi-VN`, fallback voice hệ thống.
- Tiếng trống/mõ nâng từ oscillator đơn giản lên tổng hợp có **noise + filter + body oscillator** để transient và thân tiếng rõ hơn.
- Hô thai được phát âm thanh sau nhịp trống.
- Có prototype “diễn xướng thử” cho 3 con: **Ông Ầm, Ba Gà, Cửu Chùa**.
- Prototype chia câu thành nhiều segment với pitch/rate/pause khác nhau để kiểm cảm giác hô có làn điệu; không tuyên bố là hát Bài Chòi thật hay giọng nghệ nhân.
- Các câu còn lại dùng giọng xướng đã chọn ở tempo hô chậm.
- Kiến trúc này là bước đệm cho voice-pack audio render/thu thật; gameplay engine không phụ thuộc nguồn audio.
- Quyết định: CHỐT ngày 2026-09-24.


## D-027 — Bài Chòi pre-rendered neural voice-pack
- Dừng hướng cố biến browser Speech Synthesis thành hát Bài Chòi.
- Ba câu mẫu Ông Ầm / Ba Gà / Cửu Chùa chuyển sang **audio render sẵn** để mọi thiết bị nghe cùng một bản.
- Baseline render dùng Piper neural TTS tiếng Việt `vi_VN-vais1000-medium`, hậu kỳ pitch/tempo/reverb theo segment.
- Audio được tạo bằng GitHub Actions và commit vào `public/audio/bai-choi/`.
- Giữ fallback Speech Synthesis cho quân chưa có voice-pack và cho phần xướng tên.
- Sửa Android voice list bằng retry + `voiceschanged` + refresh trong user gesture + nút **Nạp lại giọng**.
- Nếu thiết bị vẫn không cung cấp danh sách voice, UI phải hiển thị “Giọng mặc định của máy”, không để dropdown rỗng.
- Baseline neural TTS không được gọi là bản thu nghệ nhân; mục tiêu là QC kiến trúc voice-pack trước khi thay bằng audio chất lượng cao hơn.
- Quyết định: CHỐT ngày 2026-09-24.


## D-028 — Tạm dừng Bài Chòi sau v0.4
- Tạm dừng hoàn thiện **Bài Chòi** tại mốc **v0.4 pre-rendered voice-pack baseline** để chuyển sang việc khác.
- Gameplay/ruleset hiện tại được giữ nguyên; không quay lại thiết kế lại từ đầu khi tiếp tục.
- Phần chưa hoàn thiện trọng tâm là **chất lượng audio/diễn xướng**.
- Khi quay lại, ưu tiên QC 3 MP3 mẫu, chốt chất giọng rồi mới mở rộng đủ 27 quân.
- Các quyết định D-023 đến D-027 vẫn giữ hiệu lực.
- Quyết định: CHỐT ngày 2026-09-24.


## D-029 — Sảnh game đa danh mục
- Trang khởi đầu đổi từ “Kho game dân gian Việt Nam” thành **Sảnh game / Kho Minigame** trung tính.
- Kiến trúc điều hướng: **Sảnh game → Danh mục → Game**.
- **Dân gian Việt Nam** là một danh mục lớn, không còn là toàn bộ phạm vi website.
- Các danh mục nền tảng: Dân gian Việt Nam, Dân gian thế giới, Game hiện đại, Giải đố & Logic, Chiến thuật, May rủi & Party.
- Một game có thể thuộc **nhiều danh mục**.
- Trang chủ kết hợp:
  - card danh mục;
  - một khu **Game nổi bật / Chơi nhanh**.
- 6 game hiện tại đều thuộc Dân gian Việt Nam; Cờ Gánh/Cờ Hùm/Cờ Lúa Ngô đồng thời thuộc Chiến thuật; Tam Cúc/Bài Chòi đồng thời thuộc May rủi & Party.
- Route game cũ giữ nguyên để không phá link.
- Route danh mục dùng dạng `#/category/<category-id>`.
- Branding hiển thị trên trang chủ đổi sang **Kho Minigame**; repo/project vẫn giữ tên kỹ thuật `Minigame`.
- Quyết định: CHỐT ngày 2026-09-24.


## D-030 — Game 07 cờ quái vật hiện đại
- Game 07 là game hiện đại tự sáng tạo, codename làm việc **Monster Chess**; tên chính thức chưa chốt.
- Không làm chess reskin; mỗi quái là unit riêng với movement/attack/skill/evolution riêng.
- Mục tiêu: tiêu diệt toàn bộ quái đối phương.
- Thời lượng mục tiêu: 3–5 phút/ván.
- Draft trước trận bằng ngân sách sao, ví dụ 10★; tổng sao đội hình <= ngân sách.
- Draft **luân phiên**; loài quái đã được chọn bị khóa cho đối thủ.
- Một round: hai bên luân phiên kích hoạt unit; mỗi quái tối đa 1 action/round.
- Board dùng **hex grid**, quy mô làm việc xấp xỉ 8×8 / ~64 ô; mỗi ván có map ngẫu nhiên.
- Combat có RNG nhỏ nhưng vẫn phải giữ tính chiến thuật/puzzle, không để may rủi lấn át.
- Mỗi quái có tối đa 2 lần tiến hóa trong trận; mỗi lần chọn 1 trong 3 option tăng tiến.
- Vật phẩm/EXP có thể xuất hiện ngẫu nhiên trên map.
- Định hướng chung hỗ trợ cả local PvP và roguelite trên cùng ruleset combat.
- Chi tiết map fairness, RNG combat, EXP/item economy và action-economy balancing sẽ chốt ở vòng discovery tiếp theo.
- Quyết định: CHỐT ngày 2026-09-24.


## D-031 — Game 07 map/combat/economy foundation
- Board v0.1 dùng **hexagon bán kính 4 = 61 ô**.
- Map mỗi ván được random nhưng phải có khung fairness đối xứng/cân bằng; item/EXP được phép random có kiểm soát.
- Terrain nền v0.1 gồm **Ground / Blocker / Cover**.
- Combat mặc định có **10% miss + 10% crit**, phần còn lại là hit thường.
- RNG phải nhỏ và đọc được; không để may rủi lấn át quyết định chiến thuật.
- EXP là **riêng từng quái**.
- Tối đa **5 quái/đội** dù ngân sách sao có thể cho phép nhiều unit rẻ hơn.
- Item/EXP nhỏ trên bản đồ dùng **auto-pickup**, không tốn action riêng.
- Các chi tiết còn mở: crit multiplier, cover/LOS formula, skill economy, EXP threshold, item chủ động.
- Quyết định: CHỐT ngày 2026-09-24.


## D-032 — Game 07 activation/skill/combat/evolution flow
- Một activation cho phép **optional Move -> 1 Main Action**.
- Main Action là Basic Attack / Active Skill / kích hoạt Artifact / Wait.
- Không có move sau attack mặc định.
- Active Skill dùng **cooldown theo activation của chính quái**, không dùng mana chung.
- Round 1 coin flip người kích hoạt trước; từ round sau **đổi quyền đi trước mỗi round**.
- Blocker chặn LOS; Cover không chặn LOS.
- Cover giảm **25% ranged damage**; melee bỏ qua Cover.
- Combat mặc định dùng một roll: **10% miss / 80% normal / 10% crit**.
- Crit mặc định = **150% damage**, làm tròn lên.
- EXP riêng từng quái:
  - gây damage: +1 XP tối đa một lần mỗi activation;
  - kill: +2 XP;
  - EXP orb: +1 XP.
- Evolution I tại **3 XP**, Evolution II tại **7 XP tổng**.
- Evolution được chọn ở đầu activation kế tiếp sau khi đủ mốc; mỗi tier chọn 1 trong 3 option.
- Pickup nhỏ auto-use; Artifact mạnh giữ tối đa 1/quái và tốn Main Action để kích hoạt.
- Quyết định: CHỐT ngày 2026-09-25.


## D-033 — Monster Chess prototype v0.1
- Game 07 có prototype playable tại `#/monster-chess`.
- Prototype đầu tập trung **local PvP + core rules**, chưa làm art cuối.
- Engine tách riêng tại `src/monsterchess/`.
- UI map dùng SVG hex 61 ô.
- Draft 10★, tối đa 5 unit, species lock, Pass.
- Battle thực thi Move -> Main Action, skill cooldown, LOS/Cover, pickups, Artifact, EXP/Evolution và wipe-all victory.
- 8 quái roster v0.1 đã có Basic/Active/Passive metadata; Active Skill được triển khai ở mức prototype gameplay.
- Game được gắn vào cả danh mục **Game hiện đại** và **Chiến thuật**.
- Art hiện dùng glyph/emoji placeholder; không coi là visual direction cuối.
- Balance của star/stat/skill/evolution chưa khóa, phải dựa trên QC/playtest.
- Deploy #41 success, commit `5a607adc62a2d7a59b99eba639c39cfbf6007063`, 55/55 tests pass.
- Quyết định: CHỐT ngày 2026-09-25.


## D-034 — Tạm dừng Monster Chess sau prototype v0.1
- Tạm dừng Game 07 **Monster Chess** tại mốc **prototype v0.1 playable** để chuyển sang việc khác.
- Giữ nguyên ruleset và prototype hiện tại; không dựng lại từ đầu khi tiếp tục.
- D-030 → D-033 vẫn có hiệu lực.
- Balance của roster/stat/star/cooldown/evolution chưa khóa và phải dựa trên QC/playtest sau này.
- Chưa có browser/mobile QC tương tác trực tiếp sau deploy #41.
- Khi quay lại, ưu tiên QC gameplay/cân bằng trước animation, art cuối và roguelite.
- Deploy kỹ thuật mốc lưu: workflow #41, commit `5a607adc62a2d7a59b99eba639c39cfbf6007063`, 55/55 tests pass.
- Quyết định: CHỐT ngày 2026-09-26.


## D-035 — Game 08
- Game tiếp theo của Kho Minigame là **Cờ cá ngựa**.
- Chưa khóa ruleset vì luật Việt Nam có nhiều dị bản; phải chốt số xúc xắc, xuất quân, lượt thưởng, cản/đá, vào chuồng và luật phụ trước khi code.
- Route dự kiến: `#/co-ca-ngua`.
- Dự kiến thuộc **Dân gian Việt Nam** và **May rủi & Party**.
- Quyết định: CHỐT ngày 2026-09-26.


## D-036 — Cờ cá ngựa foundation
- Game 08 hỗ trợ **Local 2–4 người + đấu AI**.
- Dùng **2 xúc xắc**.
- Mặt 6 có quyền xuất quân và tạo lượt thưởng; chi tiết cách tính với 1/2 viên ra 6 còn phải chốt chính xác.
- Mặt 1 có luật đặc biệt do người dùng chọn: nếu không có vật cản thì có thể **bay tới chuồng tiếp theo**; vị trí đích chính xác còn phải chốt trước khi code.
- Cản/đá:
  - không vượt qua quân cản;
  - đi đúng ô đối phương thì đá quân đó về chuồng;
  - không đá quân mình;
  - không có nước hợp lệ thì mất lượt.
- Đích dùng thứ tự **6–5–4–3**.
- v0.1 không dùng thầu mạ/sập hầm hoặc luật thưởng/phạt giao kèo.
- Animation phải có xúc xắc lắc/nảy, ngựa đi từng ô, hiệu ứng đá và leo chuồng.
- Các chi tiết chưa chốt không được tự suy diễn khi implement.
- Quyết định: CHỐT ngày 2026-09-26.


## D-037 — Cờ cá ngựa ruleset v0.1
- Dùng **2 xúc xắc**, xử lý từng viên riêng; có thể áp dụng hai viên lên hai ngựa khác nhau hoặc nối tiếp cùng một ngựa.
- Mỗi mặt **6** có thể dùng để xuất quân và đồng thời tạo **1 viên xúc xắc tung bù** sau khi xử lý lô hiện tại.
- 6+4 -> tung bù 1 viên; 6+6 -> tung bù 2 viên; 6 trong lượt bù tiếp tục sinh lượt bù.
- Mặt **1** của ngựa đang ở đường đua có thể:
  - đi 1 ô bình thường; hoặc
  - bay tới **cửa chuồng kế tiếp phía trước** nếu không có quân cản giữa đường.
- Engine v0.1 dùng đường đua **56 ô**, 4 cửa chuồng cách nhau 14 ô.
- Cản/đá: không vượt quân, không vào ô quân mình, đáp đúng ô địch thì đá về sân.
- Phải đi đúng số để hoàn thành vòng và tới cửa chuồng mình.
- Leo chuồng 1→6: mỗi lần chỉ lên một bậc kế tiếp khi xúc xắc đúng số bậc kế tiếp.
- Thắng khi 4 ngựa chiếm đủ bậc **3,4,5,6**.
- v0.1 không dùng thầu mạ/sập hầm.
- Chi tiết tại `docs/CO_CA_NGUA_RULES.md`.
- Quyết định: CHỐT ngày 2026-09-26.


## D-038 — Cờ cá ngựa playable v0.1
- Cờ cá ngựa Game 08 đã có bản playable tại `#/co-ca-ngua`.
- Hỗ trợ Local 2–4 người và 1 người đấu 1–3 AI.
- AI có ba mức Dễ / Vừa / Khó ở mức heuristic v0.1.
- Bàn UI dùng SVG vòng đua 56 ô + 4 dãy chuồng 1→6.
- Người chơi chọn từng viên xúc xắc; nếu mặt 1 có cả đi 1 và bay, phải cho người chơi chọn rõ, không auto quyết định.
- Animation đi thường phát từng ô khoảng 190 ms/ô; mặt 1 bay dùng nhịp riêng.
- Game thuộc cả **Dân gian Việt Nam** và **May rủi & Party**.
- Deploy #46 success, run `36248901658`, commit `bb650b41957ff8b84d902677bdbaad70c7c05dd3`.
- 68/68 tests pass; riêng Cờ cá ngựa 13 tests.
- Chưa có browser/mobile interaction QC sau deploy; không coi visual/gameplay QC là hoàn tất.
- Quyết định: CHỐT ngày 2026-09-26.


## D-039 — Cờ cá ngựa v0.2 visual/animation direction
- Bàn v0.2 đổi sang **bàn vuông kiểu Cờ cá ngựa Việt Nam**, ưu tiên bố cục truyền thống quen mắt hơn board vòng tròn v0.1.
- Xúc xắc phải là **khối lập phương có animation lăn/quay thật** trước khi dừng đúng kết quả engine.
- Hoạt ảnh mặt 1 bay dùng **lift + arc + trail + target highlight + landing**.
- Hoạt ảnh đá theo phong cách **vui nhộn, wow effect**, gồm impact rõ và quân bị đá bay về sân.
- Tempo dùng chiến lược **normal move nhanh, special action nổi bật**.
- Không đổi ruleset D-037; v0.2 chủ yếu là presentation/UX/animation.
- Quyết định: CHỐT ngày 2026-09-26.


## D-040 — Cờ cá ngựa v0.2 deployed
- v0.2 giữ nguyên ruleset D-037, đổi mạnh lớp presentation/animation.
- Board chuyển sang **vuông kiểu Việt Nam**, engine vẫn dùng 56 track index cũ.
- Geometry UI tách riêng tại `src/cacngua/geometry.ts`.
- Dice tách thành `src/cacngua/Dice3D.tsx`, render cube 6 mặt CSS 3D và có throw/roll animation trước khi hiện kết quả.
- Fly mặt 1 dùng SVG motion path + trail; kick dùng impact ring/comic burst + victim arc về sân.
- Normal move ~175 ms/ô; fly ~820 ms; kick ~780 ms.
- Input vẫn khóa trong action animation; AI dùng cùng presentation flow.
- Deploy #52 success, run `36251905009`, source commit `c357536da4e79c352921a0c7827e73d613506aff`.
- 73/73 tests pass; Cờ cá ngựa có 13 engine tests + 5 geometry tests.
- Chưa có browser/mobile interaction QC sau deploy vì Desktop Commander offline.
- Quyết định: CHỐT ngày 2026-09-26.


## D-041 — Dice3D Android/WebView compatibility hotfix
- Screenshot QC trên Android cho thấy cube v0.2 có thể hiển thị sai physical face: cả hai dice nhìn như mặt 1.
- Không đổi RNG/engine xúc xắc.
- Dice3D đổi chiến lược render:
  - front face luôn là giá trị engine thực tế;
  - các face còn lại chỉ phục vụ thể tích trong animation;
  - không xoay cube sang physical face theo kết quả nữa.
- Giữ animation throw/roll 3D, rồi snap về front result face.
- Thêm badge số nhỏ làm fallback nhận diện trên WebView.
- Deploy #54 success, run `36252593872`, source commit `57ae65ad3dfe14d3a7f957c284385742218d0810`.
- Quyết định: CHỐT ngày 2026-09-26.


## D-042 — Dice3D settled-state compatibility redesign
- Screenshot QC sau D-041 xác nhận engine/badge ra đúng **5 + 3** nhưng pip trên cube đứng yên vẫn render sai trên Android/WebView.
- Rolling state vẫn giữ full CSS 3D cube để đáp ứng yêu cầu “lăn thật”.
- Settled state **không dùng six-face cube** nữa:
  - render một mặt pip 2D chính xác;
  - thêm top/right faces dạng 2.5D để vẫn nhìn như khối lập phương;
  - do đó kết quả sau khi dừng không phụ thuộc browser 3D backface.
- Badge số nhỏ tiếp tục làm fallback.
- Không đổi RNG, bonus-six logic hay engine.
- Deploy #56 success, run `36254634287`, source commit `8be04a6a3e8883b79fbef7ff1aabca7f6547eb3c`.
- Quyết định: CHỐT ngày 2026-09-26.
