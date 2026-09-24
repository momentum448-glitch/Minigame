# BÀI CHÒI — VOICE PACK PIPELINE

Ngày tạo: 2026-09-24.

## Mục tiêu

Tách chất giọng Hô thai khỏi Web Speech / voice cài trên điện thoại.

Game ưu tiên audio render sẵn theo manifest trong `src/BaiChoiGame.tsx`.
Nếu một quân chưa có file voice-pack hoặc file tải lỗi, game fallback sang Speech Synthesis.

## Baseline v0.4

Ba câu:
- Ông Ầm -> `public/audio/bai-choi/ong-am-chant.mp3`
- Ba Gà -> `public/audio/bai-choi/ba-ga-chant.mp3`
- Cửu Chùa -> `public/audio/bai-choi/cuu-chua-chant.mp3`

Workflow:
- `.github/workflows/generate-bai-choi-voice-pack.yml`
- script: `scripts/generate_bai_choi_voice_pack.sh`

Workflow tải Piper Linux + model `vi_VN-vais1000-medium`, render neural TTS, rồi hậu kỳ từng segment bằng pitch/tempo/reverb và normalize thành MP3.

## Nguồn / license

- Piper runtime: upstream `rhasspy/piper`, MIT.
- Vietnamese Piper voice: `vi_VN-vais1000-medium`.
- Model card:
  https://huggingface.co/rhasspy/piper-voices/blob/v1.0.0/vi/vi_VN/vais1000/medium/MODEL_CARD
- Model card nêu VAIS-1000 và liên kết giấy phép CC BY 4.0.

Phải giữ `public/audio/bai-choi/VOICE_PACK_LICENSE.txt` cùng asset khi phát hành.

## Giới hạn

- Đây là neural TTS được hậu kỳ, chưa phải giọng nghệ nhân Bài Chòi.
- Không gọi đây là lời/hát cổ truyền.
- Mục đích của 3 câu là QC một baseline nhất quán trên mọi thiết bị.
- Nếu baseline vẫn chưa đạt, thay file MP3 bằng render/thu giọng chất lượng cao mà không thay engine/gameplay.

## Android voice-list fix

Speech Synthesis vẫn dùng cho xướng tên quân và fallback.
UI:
- retry `getVoices()` nhiều lần sau mount;
- nghe `voiceschanged`;
- gọi refresh lại trong user gesture;
- có nút **Nạp lại giọng**;
- nếu vẫn rỗng, hiển thị **Giọng mặc định của máy** thay vì dropdown trống.
