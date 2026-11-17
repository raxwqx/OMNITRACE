# Security Policy / Güvenlik Politikası

## Supported versions / Desteklenen sürümler

Security fixes are applied to the latest release on the `main` branch.

Güvenlik düzeltmeleri `main` dalındaki en son sürüme uygulanır.

## Reporting a vulnerability / Güvenlik açığı bildirme

Please **do not** open a public issue for a security problem. Do not attach
real investigation records, API keys, personal data, or sensitive indicators.

Güvenlik sorunları için lütfen **herkese açık issue açma**. Gerçek araştırma
kaydı, API anahtarı, kişisel veri veya hassas gösterge ekleme.

Use GitHub private vulnerability reporting:

- <https://github.com/raxwqx/OMNITRACE/security/advisories/new>

Please include:

- affected version or commit,
- steps to reproduce,
- expected and actual behavior,
- impact assessment,
- a minimal proof of concept without sensitive data.

Lütfen şunları ekle:

- etkilenen sürüm veya commit,
- yeniden üretme adımları,
- beklenen ve gerçek davranış,
- etki değerlendirmesi,
- hassas veri içermeyen en küçük kanıt.

## Scope / Kapsam

Relevant reports include server-side request forgery (SSRF) in provider
integrations, path traversal, SQL injection, cross-site scripting, unsafe
deserialization, authentication/authorization gaps, and unintended outbound
network activity.

İlgili bildirimler arasında sağlayıcı entegrasyonlarında SSRF, yol aşımı
(path traversal), SQL enjeksiyonu, XSS, güvensiz serileştirme, kimlik
doğrulama/yetkilendirme eksikleri ve istenmeyen dış ağ etkinliği yer alır.

## Research boundaries / Araştırma sınırları

OMNITRACE is a passive, public-source research helper. It does not scan ports,
exploit systems, crack passwords, verify mailbox ownership, or fetch arbitrary
user-supplied URLs. Only use it for lawful, authorized research.

OMNITRACE pasif, açık kaynaklı araştırma yardımcısıdır. Port taramaz,
sistemleri istismar etmez, parola kırmaz, posta kutusu sahipliğini doğrulamaz
veya kullanıcının verdiği rastgele URL'leri getirmez. Yalnızca yasal ve
yetkilendirilmiş araştırmalar için kullanın.
