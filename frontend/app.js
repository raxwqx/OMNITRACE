// Matrix-style boot sequence: plays on every fresh page load.
// First-visit Matrix-style boot sequence. The flag is written immediately so a refresh never replays it.
(function initSystemIntro() {
  const overlay = document.getElementById('system-intro');
  if (!overlay) return;
  // Always play on a fresh page load. Do not let stale browser storage or
  // reduced-motion preferences silently remove the requested Matrix intro.

  const canvas = document.getElementById('matrix-canvas');
  const ctx = canvas?.getContext('2d');
  const terminal = document.getElementById('intro-terminal');
  const progress = document.getElementById('intro-progress');
  const skip = document.getElementById('intro-skip');
  let language = 'tr';
  try { language = localStorage.getItem('omnitrace-language') || 'tr'; } catch (_) { /* Storage may be disabled. */ }
  const lines = language === 'en' ? [
    'Mounting intelligence workspace...', 'Loading public-source modules...',
    'Checking local API connection...', 'Research boundaries: ENABLED', 'Workspace ready. Welcome, analyst.'
  ] : [
    'İstihbarat çalışma alanı hazırlanıyor...', 'Açık kaynak modülleri yükleniyor...',
    'Yerel API bağlantısı kontrol ediliyor...', 'Araştırma sınırları: ETKİN', 'Çalışma alanı hazır. Hoş geldin, analist.'
  ];
  const copy = language === 'en' ? {
    classification: 'SECURE WORKSPACE / INITIALIZING', subtitle: 'OPEN-SOURCE INTELLIGENCE PLATFORM', skip: 'SKIP INITIALIZATION ↗'
  } : {
    classification: 'GÜVENLİ ÇALIŞMA ALANI / BAŞLATILIYOR', subtitle: 'AÇIK KAYNAK İSTİHBARAT PLATFORMU', skip: 'BAŞLATMAYI ATLA ↗'
  };
  overlay.querySelectorAll('[data-intro]').forEach(el => { el.textContent = copy[el.dataset.intro] || el.textContent; });

  let width = 0, height = 0, drops = [], frame = 0, closed = false, start = 0;
  const chars = 'アァカサタナハマヤャラワン012345789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>/{}[]';
  function resize() {
    if (!canvas || !ctx) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = Math.floor(width * ratio); canvas.height = Math.floor(height * ratio);
    canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    drops = Array.from({ length: Math.ceil(width / 17) }, () => Math.random() * (height / 17));
  }
  function draw(now) {
    if (closed || !ctx) return;
    ctx.fillStyle = 'rgba(2, 5, 3, 0.12)'; ctx.fillRect(0, 0, width, height);
    ctx.font = '13px monospace';
    drops.forEach((y, i) => {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillStyle = Math.random() > .975 ? '#e2ffdc' : '#70d94c';
      ctx.fillText(char, i * 17, y * 17);
      if (y * 17 > height && Math.random() > .975) drops[i] = 0;
      else drops[i] = y + .48;
    });
    frame = window.requestAnimationFrame(draw);
  }
  function closeIntro() {
    if (closed) return;
    closed = true;
    window.cancelAnimationFrame(frame);
    overlay.classList.add('intro-hidden');
    window.setTimeout(() => overlay.remove(), 600);
  }
  skip?.addEventListener('click', closeIntro);
  resize();
  window.addEventListener('resize', resize, { passive: true });
  if (ctx) frame = window.requestAnimationFrame(draw);
  start = performance.now();
  let shown = 0;
  function tick(now) {
    if (closed) return;
    const elapsed = now - start;
    const desired = Math.min(lines.length, Math.floor(elapsed / 570) + 1);
    while (shown < desired) {
      const line = document.createElement('div');
      line.className = 'terminal-line' + (shown === 3 ? ' done' : '');
      line.textContent = lines[shown];
      terminal?.appendChild(line);
      shown += 1;
    }
    if (progress) progress.style.width = Math.min(100, elapsed / 3900 * 100) + '%';
    if (elapsed >= 3900) closeIntro();
    else window.requestAnimationFrame(tick);
  }
  window.requestAnimationFrame(tick);
})();

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
let providers = [];
let toastTimer;
let currentLanguage = (() => { try { return localStorage.getItem("omnitrace-language") || "tr"; } catch (_) { return "tr"; } })();
let platformsInitialized = false;
let lastIdentityData = null;

const translations = {
  en: {
    brandSubtitle: "INTELLIGENCE WORKSPACE", workspace: "WORKSPACE", overview: "Overview",
    identity: "Identity Intelligence", investigations: "Investigations", coreSystems: "Core systems",
    checkingStatus: "Checking status…", publicResearchOnly: "PUBLIC-SOURCE RESEARCH ONLY",
    topEyebrow: "CYBER INTELLIGENCE / WORKSPACE", localInstance: "LOCAL INSTANCE",
    openSourceIntel: "OPEN-SOURCE INTELLIGENCE", heroLine1: "See the signals.", heroLine2: "Connect the context.",
    heroDescription: "A focused workspace for public-source research, identity leads and investigation notes.",
    startSearch: "Start an identity search", signalSourceContext: "SIGNAL / SOURCE / CONTEXT",
    workspaceSnapshot: "WORKSPACE SNAPSHOT", operationalOverview: "Operational overview", liveLocalData: "Live local data",
    platformCatalog: "PLATFORM CATALOG", candidateSources: "Candidate profile sources", investigationCases: "INVESTIGATION CASES",
    savedLocalDatabase: "Saved in local database", verifiedIdentities: "VERIFIED IDENTITIES", noIdentityClaims: "No identity claims are inferred",
    availableModules: "AVAILABLE MODULES", researchTools: "Research tools", identityModuleDescription: "Generate candidate public profile links across supported platforms.",
    openModule: "Open module ↗", caseNotebook: "Investigation notebook", caseModuleDescription: "Create cases and keep scope and research notes together.",
    threatIntel: "Threat intelligence", threatModuleDescription: "IOC enrichment connectors are planned for a future release.", roadmap: "ROADMAP",
    identityEyebrow: "IDENTITY INTELLIGENCE / 01", publicProfileDiscovery: "Public profile discovery",
    identityIntro: "Generate a structured list of possible profile URLs. Results are leads, not proof of identity or account existence.",
    usernameLabel: "Username", noPrivateInfo: "Do not enter passwords or private information", generateLeads: "Generate leads",
    usernameAllowed: "Allowed: letters, numbers, dots, underscores and hyphens.", platformCoverage: "Platform coverage", selectAll: "Select all", clear: "Clear",
    loadingPlatforms: "Loading platform catalog…", researchOutput: "RESEARCH OUTPUT", candidateProfiles: "Candidate profiles",
    identityWarning: "ⓘ Links have not been checked. An identical username on two services does not establish that the accounts belong to the same person.",
    casesEyebrow: "INVESTIGATION WORKSPACE / 02", caseIntro: "Keep a clear record of investigation scope, authorization and notes.",
    caseTitle: "Case title", notes: "Notes", notesOptional: "Optional, max 5000 characters", savedSQLite: "Saved to this instance's configured database.",
    createCase: "Create case +", yourWork: "YOUR WORK", savedInvestigations: "Saved investigations", refresh: "Refresh", loadingCases: "Loading cases…",
    footerResponsible: "OMNITRACE / BUILT FOR RESPONSIBLE RESEARCH", footerPublicSources: "Public sources only · v0.5.1",
    usernamePlaceholder: "example_user", caseTitlePlaceholder: "e.g. Authorized lab exercise", notesPlaceholder: "Scope, objective, source notes…",
    apiOnline: "API online", apiUnavailable: "API unavailable", platformLoadError: "Could not load platform list: {error}",
    selectPlatform: "Select at least one platform.", preparing: "Preparing…", resultCount: "{count} candidates",
    generated: "Generated {count} candidate links for \"{query}\". No profiles were automatically verified.",
    searchFailed: "Search failed: {error}", caseSaved: "Investigation case saved.", caseSaveFailed: "Could not save case: {error}",
    noCases: "No cases yet. Create your first investigation above.", noNotes: "No notes added.", casesLoadFailed: "Could not load cases: {error}",
    notChecked: "NOT CHECKED", results: "{count} results", exportJson: "Export JSON ↓", exportCsv: "Export CSV ↓", copyLinks: "Copy links",
    recentActivity: "RECENT ACTIVITY", recentIdentitySearches: "Recent identity searches", loadingHistory: "Loading search history…", noHistory: "No identity searches recorded yet.",
    historyLoadFailed: "Could not load search history: {error}", historyCount: "{count} candidate links", copiedLinks: "Candidate links copied.", copyFailed: "Could not copy links: {error}",
    osintTools: "OSINT Toolkit", osintToolsDescription: "Inspect IPs, domains, email syntax, URLs, hashes and bulk indicators.",
    intelEyebrow: "OSINT TOOLKIT / 02", intelIntro: "Passive utilities for public indicators. Network lookups are bounded; URLs are never fetched by the URL analyzer.",
    ipRdapTitle: "IP Network Registry", ipRdapDesc: "Retrieve public RDAP allocation and registry metadata for a global IP.", subdomainTitle: "Passive Subdomain Discovery", subdomainDesc: "Collect names from public certificate-transparency records without probing hosts.", enrich: "Enrich", discover: "Discover", ipIntel: "IP Intelligence", ipDesc: "Classify IPv4/IPv6 and open its public RDAP record.", ipAddress: "IP address",
    domainIntel: "Domain & DNS", domainDesc: "Query public A, AAAA, MX, NS and TXT records.", domainName: "Domain name",
    emailIntel: "Email Domain Check", emailDesc: "Check address syntax and public MX records, not mailbox existence.", emailAddress: "Email address",
    urlIntel: "URL Inspector", urlDesc: "Parse scheme, host, port and query indicators locally.", urlAddress: "HTTP(S) URL",
    hashIntel: "Hash Identifier", hashDesc: "Identify common digest-length candidates and provide public lookup links.", fileHash: "File hash", identifyHash: "Identify hash",
    batchIntel: "Bulk IOC Triage", batchDesc: "Classify up to 100 IPs, domains, URLs, email addresses or hashes.", onePerLine: "One indicator per line", triage: "Triage indicators",
    analyze: "Analyze", lookup: "Look up", inspect: "Inspect", analysisOutput: "ANALYSIS OUTPUT", latestResult: "Latest result", copyOutput: "Copy output",
    intelSafety: "Passive-first: this toolkit does not scan ports, exploit systems, fetch arbitrary URLs, verify email mailboxes, or infer a person's identity. Use only for lawful research.",
    intelDone: "Analysis complete.", intelFailed: "Analysis failed: {error}", outputCopied: "Analysis output copied.",
    analystLab: "Analyst Lab", settings: "Settings", labEyebrow: "ANALYST LAB / 03", labTitle: "Analyst Lab", labIntro: "Ten local-first utilities for evidence preparation, indicator extraction and repeatable analysis. Processing stays in your browser unless a tool explicitly says otherwise.",
    iocExtractTitle: "01 / IOC Extractor", iocExtractDesc: "Extract likely IPs, domains, URLs, emails and hashes from pasted text.", extractIndicators: "Extract indicators", defangTitle: "02 / Defang & Refang", defangDesc: "Make indicators safer to share, or restore their standard spelling.", defangOption: "Defang", refangOption: "Refang", transform: "Transform", base64Title: "03 / Base64 utility", base64Desc: "Encode or decode text locally using UTF-8 support.", encode: "Encode", decode: "Decode", runTool: "Run utility", urlCodecTitle: "04 / URL codec", urlCodecDesc: "Encode or decode URL components without visiting a URL.", shaTitle: "05 / SHA-256 text digest", shaDesc: "Calculate a SHA-256 digest of text locally. This does not hash a file.", calculateHash: "Calculate SHA-256", timestampTitle: "06 / Timestamp converter", timestampDesc: "Convert Unix seconds or milliseconds into a readable UTC date.", convertTime: "Convert timestamp", cidrTitle: "07 / IPv4 CIDR calculator", cidrDesc: "Calculate network, broadcast and usable host count locally.", calculateNetwork: "Calculate network", sourceScoreTitle: "08 / Source assessment", sourceScoreDesc: "A transparent checklist to assess source quality, not a truth detector.", sourcePrimary: "Primary source or original record", sourceCorroborated: "Independently corroborated", sourceRecent: "Date and context are clear", sourceMethod: "Collection method is documented", sourceBias: "Potential bias and limitations noted", assessSource: "Assess source", relationshipTitle: "09 / Relationship mapper", relationshipDesc: "Record a simple lead relationship in a readable, exportable format.", addRelationship: "Add relationship", reportTitle: "10 / Quick report builder", reportDesc: "Create a timestamped research note and export it as a text report.", buildReport: "Build report", downloadReport: "Download report", labNotice: "These helpers run locally in the browser. Extracted indicators and relationship notes are leads, not verified facts. Avoid pasting passwords, private records or sensitive personal data.", settingsEyebrow: "WORKSPACE / PREFERENCES", settingsTitle: "Workspace settings", settingsIntro: "Personalize the accent, density and motion preferences for this browser.", appearanceTitle: "Appearance", accentColor: "Accent color", compactMode: "Compact layout", disableMotion: "Disable extra animations", saveSettings: "Save preferences", settingsLocal: "Preferences are saved in this browser only.",
    sourceAssessmentResult: "Source assessment: {score}/5 checks completed. This is a process checklist, not a credibility verdict.", indicatorsFound: "Extracted {count} unique indicators.", noIndicators: "No likely indicators found.", copied: "Copied to clipboard.", relationshipAdded: "Relationship added.", reportBuilt: "Report built.", settingsSaved: "Preferences saved.", invalidInput: "Please check the input and try again.", networkInvalid: "Enter a valid IPv4 CIDR such as 192.0.2.0/24.",
    socialCategory: "Social", developerCategory: "Developer", creatorCategory: "Creator", professionalCategory: "Professional", manualSearch: "Manual search required"
  },
  tr: {
    brandSubtitle: "İSTİHBARAT ÇALIŞMA ALANI", workspace: "ÇALIŞMA ALANI", overview: "Genel Bakış",
    identity: "Kimlik İstihbaratı", investigations: "Araştırmalar", coreSystems: "Çekirdek sistemler",
    checkingStatus: "Durum kontrol ediliyor…", publicResearchOnly: "YALNIZCA AÇIK KAYNAK ARAŞTIRMASI",
    topEyebrow: "SİBER İSTİHBARAT / ÇALIŞMA ALANI", localInstance: "YEREL OTURUM",
    openSourceIntel: "AÇIK KAYNAK İSTİHBARATI", heroLine1: "Sinyalleri gör.", heroLine2: "Bağlamı birleştir.",
    heroDescription: "Açık kaynak araştırmaları, olası kimlik izleri ve inceleme notları için odaklanmış bir çalışma alanı.",
    startSearch: "Kimlik aramasını başlat", signalSourceContext: "SİNYAL / KAYNAK / BAĞLAM",
    workspaceSnapshot: "ÇALIŞMA ALANI ÖZETİ", operationalOverview: "Sistem genel görünümü", liveLocalData: "Canlı yerel veriler",
    platformCatalog: "PLATFORM KATALOĞU", candidateSources: "Olası profil kaynakları", investigationCases: "ARAŞTIRMA DOSYALARI",
    savedLocalDatabase: "Yerel veritabanına kaydedildi", verifiedIdentities: "DOĞRULANMIŞ KİMLİKLER", noIdentityClaims: "Kimlik hakkında çıkarım yapılmaz",
    availableModules: "KULLANILABİLİR MODÜLLER", researchTools: "Araştırma araçları", identityModuleDescription: "Desteklenen platformlarda olası herkese açık profil bağlantıları oluşturur.",
    openModule: "Modülü aç ↗", caseNotebook: "Araştırma defteri", caseModuleDescription: "Dosyalar oluşturun; kapsamı ve araştırma notlarını birlikte tutun.",
    threatIntel: "Tehdit istihbaratı", threatModuleDescription: "IOC zenginleştirme bağlantıları gelecek sürümler için planlanıyor.", roadmap: "YOL HARİTASI",
    identityEyebrow: "KİMLİK İSTİHBARATI / 01", publicProfileDiscovery: "Herkese açık profil keşfi",
    identityIntro: "Olası profil URL'lerinin düzenli bir listesini oluşturun. Sonuçlar yalnızca araştırma ipucudur; kimliği veya hesabın varlığını kanıtlamaz.",
    usernameLabel: "Kullanıcı adı", noPrivateInfo: "Parola veya özel bilgi girmeyin", generateLeads: "İpuçlarını oluştur",
    usernameAllowed: "Kabul edilenler: harfler, rakamlar, noktalar, alt çizgi ve tire.", platformCoverage: "Platform kapsamı", selectAll: "Tümünü seç", clear: "Temizle",
    loadingPlatforms: "Platform kataloğu yükleniyor…", researchOutput: "ARAŞTIRMA ÇIKTISI", candidateProfiles: "Olası profiller",
    identityWarning: "ⓘ Bağlantılar kontrol edilmedi. İki hizmette aynı kullanıcı adının bulunması, hesapların aynı kişiye ait olduğunu göstermez.",
    casesEyebrow: "ARAŞTIRMA ÇALIŞMA ALANI / 02", caseIntro: "Araştırmanın kapsamını, yetkilendirmesini ve notlarını açıkça kaydedin.",
    caseTitle: "Dosya başlığı", notes: "Notlar", notesOptional: "İsteğe bağlı, en fazla 5000 karakter", savedSQLite: "Bu oturumun SQLite veritabanına kaydedilir.",
    createCase: "Dosya oluştur +", yourWork: "ÇALIŞMALARINIZ", savedInvestigations: "Kaydedilen araştırmalar", refresh: "Yenile", loadingCases: "Dosyalar yükleniyor…",
    footerResponsible: "OMNITRACE / SORUMLU ARAŞTIRMA İÇİN TASARLANDI", footerPublicSources: "Yalnızca açık kaynaklar · v0.5.1",
    usernamePlaceholder: "ornek_kullanici", caseTitlePlaceholder: "örn. Yetkili laboratuvar çalışması", notesPlaceholder: "Kapsam, amaç, kaynak notları…",
    apiOnline: "API çevrimiçi", apiUnavailable: "API kullanılamıyor", platformLoadError: "Platform listesi yüklenemedi: {error}",
    selectPlatform: "En az bir platform seçin.", preparing: "Hazırlanıyor…", resultCount: "{count} aday",
    generated: "\"{query}\" için {count} olası profil bağlantısı oluşturuldu. Hiçbir profil otomatik olarak doğrulanmadı.",
    searchFailed: "Arama başarısız: {error}", caseSaved: "Araştırma dosyası kaydedildi.", caseSaveFailed: "Dosya kaydedilemedi: {error}",
    noCases: "Henüz dosya yok. Yukarıdan ilk araştırmanızı oluşturun.", noNotes: "Not eklenmemiş.", casesLoadFailed: "Dosyalar yüklenemedi: {error}",
    notChecked: "KONTROL EDİLMEDİ", results: "{count} sonuç", exportJson: "JSON dışa aktar ↓", exportCsv: "CSV dışa aktar ↓", copyLinks: "Bağlantıları kopyala",
    recentActivity: "SON ETKİNLİKLER", recentIdentitySearches: "Son kimlik araştırmaları", loadingHistory: "Araştırma geçmişi yükleniyor…", noHistory: "Henüz kimlik araştırması kaydedilmedi.",
    historyLoadFailed: "Araştırma geçmişi yüklenemedi: {error}", historyCount: "{count} aday bağlantı", copiedLinks: "Aday bağlantılar kopyalandı.", copyFailed: "Bağlantılar kopyalanamadı: {error}",
    osintTools: "OSINT Araç Seti", osintToolsDescription: "IP, alan adı, e-posta biçimi, URL, hash ve toplu göstergeleri inceleyin.",
    intelEyebrow: "OSINT ARAÇ SETİ / 02", intelIntro: "Herkese açık göstergeler için pasif araçlar. Ağ sorguları zaman aşımıyla sınırlandırılır; URL aracı adresi ziyaret etmez.",
    ipRdapTitle: "IP Ağ Kayıt Bilgileri", ipRdapDesc: "Genel erişime açık RDAP tahsis ve kayıt verilerini getirir.", subdomainTitle: "Pasif Alt Alan Adı Keşfi", subdomainDesc: "Sunucuları taramadan herkese açık sertifika şeffaflığı kayıtlarından adları toplar.", enrich: "Zenginleştir", discover: "Keşfet", ipIntel: "IP İstihbaratı", ipDesc: "IPv4/IPv6 adresini sınıflandırın ve herkese açık RDAP kaydına ulaşın.", ipAddress: "IP adresi",
    domainIntel: "Alan Adı ve DNS", domainDesc: "Herkese açık A, AAAA, MX, NS ve TXT kayıtlarını sorgulayın.", domainName: "Alan adı",
    emailIntel: "E-posta Alan Adı Kontrolü", emailDesc: "Adres biçimini ve herkese açık MX kayıtlarını kontrol eder, posta kutusunu doğrulamaz.", emailAddress: "E-posta adresi",
    urlIntel: "URL İnceleyici", urlDesc: "Şema, ana makine, port ve sorgu göstergelerini yerel olarak ayrıştırır.", urlAddress: "HTTP(S) adresi",
    hashIntel: "Hash Tanımlayıcı", hashDesc: "Yaygın özet uzunluklarını sınıflandırır ve herkese açık sorgu bağlantıları sunar.", fileHash: "Dosya hash değeri", identifyHash: "Hash'i tanımla",
    batchIntel: "Toplu IOC İncelemesi", batchDesc: "En fazla 100 IP, alan adı, URL, e-posta adresi veya hash'i sınıflandırın.", onePerLine: "Her satıra bir gösterge", triage: "Göstergeleri incele",
    analyze: "Analiz et", lookup: "Sorgula", inspect: "İncele", analysisOutput: "ANALİZ ÇIKTISI", latestResult: "Sonuç", copyOutput: "Çıktıyı kopyala",
    intelSafety: "Önce pasif analiz: bu araç port taramaz, sistemleri istismar etmez, rastgele URL'leri ziyaret etmez, e-posta kutularını doğrulamaz veya kişi kimliği çıkarımı yapmaz. Yalnızca yasal araştırma için kullanın.",
    intelDone: "Analiz tamamlandı.", intelFailed: "Analiz başarısız: {error}", outputCopied: "Analiz çıktısı kopyalandı.",
    analystLab: "Analist Laboratuvarı", settings: "Ayarlar", labEyebrow: "ANALİST LABORATUVARI / 03", labTitle: "Analist Laboratuvarı", labIntro: "Kanıt hazırlama, gösterge çıkarımı ve tekrarlanabilir analiz için tarayıcıda çalışan on araç. Bir araç özellikle belirtmedikçe işlem tarayıcınızda kalır.",
    iocExtractTitle: "01 / IOC Çıkarıcı", iocExtractDesc: "Metinden olası IP, alan adı, URL, e-posta ve hash değerlerini çıkarır.", extractIndicators: "Göstergeleri çıkar", defangTitle: "02 / Defang ve Refang", defangDesc: "Göstergeleri paylaşım için güvenli biçime getirir veya standart yazımına döndürür.", defangOption: "Defang (güvenli yazım)", refangOption: "Refang (normal yazım)", transform: "Dönüştür", base64Title: "03 / Base64 aracı", base64Desc: "UTF-8 desteğiyle metni yerel olarak kodlar veya çözer.", encode: "Kodla", decode: "Çöz", runTool: "Aracı çalıştır", urlCodecTitle: "04 / URL kodlayıcı", urlCodecDesc: "Bir adresi ziyaret etmeden URL bileşenlerini kodlar veya çözer.", shaTitle: "05 / SHA-256 metin özeti", shaDesc: "Metnin SHA-256 özetini tarayıcıda hesaplar. Dosya hash'i hesaplamaz.", calculateHash: "SHA-256 hesapla", timestampTitle: "06 / Zaman damgası dönüştürücü", timestampDesc: "Unix saniye veya milisaniyesini okunabilir UTC tarihine çevirir.", convertTime: "Zamanı dönüştür", cidrTitle: "07 / IPv4 CIDR hesaplayıcı", cidrDesc: "Ağ adresi, yayın adresi ve kullanılabilir ana makine sayısını hesaplar.", calculateNetwork: "Ağı hesapla", sourceScoreTitle: "08 / Kaynak değerlendirme", sourceScoreDesc: "Kaynak kalitesi için şeffaf kontrol listesi; doğruluk dedektörü değildir.", sourcePrimary: "Birincil kaynak veya özgün kayıt", sourceCorroborated: "Bağımsız kaynakla doğrulanmış", sourceRecent: "Tarih ve bağlam açık", sourceMethod: "Toplama yöntemi belgelenmiş", sourceBias: "Olası yanlılık ve sınırlamalar not edilmiş", assessSource: "Kaynağı değerlendir", relationshipTitle: "09 / İlişki haritalayıcı", relationshipDesc: "Basit araştırma ilişkilerini okunabilir ve dışa aktarılabilir biçimde kaydeder.", addRelationship: "İlişki ekle", reportTitle: "10 / Hızlı rapor oluşturucu", reportDesc: "Zaman damgalı araştırma notu oluşturur ve metin raporu olarak dışa aktarır.", buildReport: "Raporu oluştur", downloadReport: "Raporu indir", labNotice: "Bu yardımcılar tarayıcıda yerel çalışır. Çıkarılan göstergeler ve ilişki notları doğrulanmış gerçekler değil, araştırma ipuçlarıdır. Parola, özel kayıt veya hassas kişisel veri yapıştırmayın.", settingsEyebrow: "ÇALIŞMA ALANI / TERCİHLER", settingsTitle: "Çalışma alanı ayarları", settingsIntro: "Bu tarayıcı için vurgu rengini, yoğunluğu ve animasyon tercihlerini kişiselleştirin.", appearanceTitle: "Görünüm", accentColor: "Vurgu rengi", compactMode: "Kompakt düzen", disableMotion: "Ek animasyonları kapat", saveSettings: "Tercihleri kaydet", settingsLocal: "Tercihler yalnızca bu tarayıcıda saklanır.",
    sourceAssessmentResult: "Kaynak değerlendirmesi: {score}/5 kontrol tamamlandı. Bu bir süreç kontrol listesidir, güvenilirlik hükmü değildir.", indicatorsFound: "{count} benzersiz gösterge çıkarıldı.", noIndicators: "Olası gösterge bulunamadı.", copied: "Panoya kopyalandı.", relationshipAdded: "İlişki eklendi.", reportBuilt: "Rapor oluşturuldu.", settingsSaved: "Tercihler kaydedildi.", invalidInput: "Girdiyi kontrol edip yeniden deneyin.", networkInvalid: "192.0.2.0/24 gibi geçerli bir IPv4 CIDR girin.",
    socialCategory: "Sosyal", developerCategory: "Geliştirici", creatorCategory: "İçerik üretici", professionalCategory: "Profesyonel", manualSearch: "Elle arama gerekli"
  }
};

function t(key, values = {}) {
  let value = translations[currentLanguage][key] || translations.en[key] || key;
  for (const [name, replacement] of Object.entries(values)) value = value.replaceAll(`{${name}}`, String(replacement));
  return value;
}
function applyLanguage() {
  document.documentElement.lang = currentLanguage;
  $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  $$('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  $('#language-toggle').textContent = currentLanguage === 'en' ? 'TR' : 'EN';
  $('#language-toggle').setAttribute('aria-label', currentLanguage === 'en' ? 'Türkçeye geç' : 'Switch to English');
  const activeView = $('.nav-item.active')?.dataset.view || 'overview';
  const titleKeys = { overview: 'overview', identity: 'identity', intel: 'osintTools', cases: 'investigations', lab: 'analystLab', settings: 'settings' };
  $('#page-title').textContent = t(titleKeys[activeView] || 'overview');
  if (providers.length) renderPlatformOptions();
  if ($('#identity-results') && !$('#identity-results').classList.contains('hidden')) {
    $$('.not-checked').forEach(el => el.textContent = t('notChecked'));
  }
}
$('#language-toggle').addEventListener('click', () => {
  currentLanguage = currentLanguage === 'en' ? 'tr' : 'en';
  try { localStorage.setItem('omnitrace-language', currentLanguage); } catch (_) { /* Language still changes for this page. */ }
  applyLanguage();
  if (!$(`#view-cases`).classList.contains('hidden')) loadCases();
  loadIdentityHistory();
});

function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}
async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = Array.isArray(data.detail) ? data.detail.map(x => x.msg).join(', ') : data.detail;
    throw new Error(detail || `Request failed (${response.status})`);
  }
  return data;
}
function showView(view) {
  $$('.view').forEach(el => el.classList.toggle('hidden', el.id !== `view-${view}`));
  $$('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.view === view));
  const titles = { overview: 'overview', identity: 'identity', intel: 'osintTools', cases: 'investigations', lab: 'analystLab', settings: 'settings' };
  $('#page-title').textContent = t(titles[view] || 'overview');
  if (view === 'cases') loadCases();
}
$$('[data-view]').forEach(button => button.addEventListener('click', () => showView(button.dataset.view)));
$$('[data-goto]').forEach(button => button.addEventListener('click', () => showView(button.dataset.goto)));

async function loadHealth() {
  try {
    const [health, platformData, cases] = await Promise.all([
      api('/api/health'), api('/api/identity/platforms'), api('/api/cases')
    ]);
    $('#system-status').textContent = `${health.status} · ${t('apiOnline')}`;
    providers = platformData.platforms;
    $('#platform-count').textContent = providers.length;
    $('#case-count').textContent = cases.count;
    renderPlatformOptions();
    loadIdentityHistory();
  } catch (error) {
    $('#system-status').textContent = t('apiUnavailable');
    $('#platform-options').textContent = t('platformLoadError', { error: error.message });
  }
}
function renderPlatformOptions() {
  const container = $('#platform-options');
  const selected = new Set($$('#platform-options input:checked').map(input => input.value));
  container.innerHTML = providers.map(p => `
    <label class="platform-option">
      <input type="checkbox" value="${escapeHtml(p.key)}" ${!platformsInitialized || selected.has(p.key) ? 'checked' : ''}>
      <span>${escapeHtml(p.name)}</span>
    </label>`).join('');
  platformsInitialized = true;
}
$('#select-all').addEventListener('click', () => $$('#platform-options input').forEach(x => x.checked = true));
$('#clear-all').addEventListener('click', () => $$('#platform-options input').forEach(x => x.checked = false));

$('#identity-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = $('#username').value.trim().replace(/^@+/, '');
  const platforms = $$('#platform-options input:checked').map(x => x.value);
  const message = $('#identity-message');
  const results = $('#identity-results');
  if (!platforms.length) {
    message.textContent = t('selectPlatform');
    message.classList.remove('hidden');
    return;
  }
  const button = $('#search-button');
  button.disabled = true;
  button.innerHTML = `${t('preparing')} <span>↗</span>`;
  try {
    const data = await api('/api/identity/search', {
      method: 'POST', body: JSON.stringify({ username, platforms }),
    });
    lastIdentityData = data;
    $('#result-count').textContent = t('resultCount', { count: data.count });
    $('#results-list').innerHTML = data.results.map(item => `
      <article class="result-card">
        <div class="platform-badge">${escapeHtml(item.platform_name.slice(0, 1).toUpperCase())}</div>
        <div class="result-main">
          <strong>${escapeHtml(item.platform_name)}</strong>
          ${item.url ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.url)} ↗</a>` : `<span class="muted">${escapeHtml(item.note)}</span>`}
        </div>
        <div class="result-status"><span class="category-tag">${escapeHtml(t(`${item.category || 'social'}Category`))}</span><span class="not-checked">${t('notChecked')}</span></div>
      </article>`).join('');
    message.textContent = t('generated', { count: data.count, query: data.query });
    message.classList.remove('hidden');
    results.classList.remove('hidden');
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    loadIdentityHistory();
  } catch (error) {
    message.textContent = t('searchFailed', { error: error.message });
    message.classList.remove('hidden');
  } finally {
    button.innerHTML = `<span data-i18n="generateLeads">${t('generateLeads')}</span> <span>↗</span>`;
  }
});


function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
function exportIdentityJson() {
  if (!lastIdentityData) return;
  downloadFile(`omnitrace-identity-${lastIdentityData.query}.json`, JSON.stringify({
    product: 'OMNITRACE', exported_at: new Date().toISOString(), query: lastIdentityData.query,
    verified_accounts: 0, warning: lastIdentityData.message, results: lastIdentityData.results,
  }, null, 2), 'application/json;charset=utf-8');
}
function csvCell(value) {
  let text = String(value ?? '');
  if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
function exportIdentityCsv() {
  if (!lastIdentityData) return;
  const rows = [['platform', 'category', 'candidate_url', 'status', 'note'], ...lastIdentityData.results.map(item => [item.platform_name, item.category, item.url || '', item.status, item.note])];
  const csv = '\ufeff' + rows.map(row => row.map(csvCell).join(',')).join('\r\n');
  downloadFile(`omnitrace-identity-${lastIdentityData.query}.csv`, csv, 'text/csv;charset=utf-8');
}
$('#export-json').addEventListener('click', exportIdentityJson);
$('#export-csv').addEventListener('click', exportIdentityCsv);
$('#copy-results').addEventListener('click', async () => {
  if (!lastIdentityData) return;
  const text = lastIdentityData.results.map(item => item.url).filter(Boolean).join('\n');
  try {
    await navigator.clipboard.writeText(text);
    toast(t('copiedLinks'));
  } catch (error) {
    toast(t('copyFailed', { error: error.message }));
  }
});
$('#refresh-identity-history').addEventListener('click', loadIdentityHistory);
async function loadIdentityHistory() {
  const container = $('#identity-history');
  if (!container) return;
  try {
    const data = await api('/api/identity/history?limit=10');
    if (!data.searches.length) {
      container.innerHTML = `<div class="empty-state">${t('noHistory')}</div>`;
      return;
    }
    container.innerHTML = data.searches.map(item => `
      <article class="case-card history-card">
        <h4>@${escapeHtml(item.username)}</h4>
        <time>${escapeHtml(new Date(item.created_at).toLocaleString(currentLanguage === 'tr' ? 'tr-TR' : 'en-US'))}</time>
        <p>${t('historyCount', { count: item.result_count })}</p>
        <p class="muted">${escapeHtml(item.platforms.join(', '))}</p>
        <button type="button" class="text-button reuse-search" data-username="${escapeHtml(item.username)}">${currentLanguage === 'tr' ? 'Kullanıcı adını yeniden kullan ↗' : 'Reuse username ↗'}</button>
      </article>`).join('');
    $$('.reuse-search').forEach(button => button.addEventListener('click', () => {
      $('#username').value = button.dataset.username;
      showView('identity');
      $('#username').focus();
    }));
  } catch (error) {
    container.innerHTML = `<div class="empty-state">${t('historyLoadFailed', { error: escapeHtml(error.message) })}</div>`;
  }
}

$('#case-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = $('#case-title').value.trim();
  const notes = $('#case-notes').value.trim();
  try {
    await api('/api/cases', { method: 'POST', body: JSON.stringify({ title, notes }) });
    $('#case-form').reset();
    toast(t('caseSaved'));
    await loadCases();
  } catch (error) {
    toast(t('caseSaveFailed', { error: error.message }));
  }
});
$('#refresh-cases').addEventListener('click', loadCases);
async function loadCases() {
  const container = $('#case-list');
  try {
    const data = await api('/api/cases');
    $('#case-count').textContent = data.count;
    if (!data.cases.length) {
      container.innerHTML = `<div class="empty-state">${t('noCases')}</div>`;
      return;
    }
    container.innerHTML = data.cases.map(item => `
      <article class="case-card">
        <h4>${escapeHtml(item.title)}</h4>
        <time>${escapeHtml(new Date(item.created_at).toLocaleString(currentLanguage === 'tr' ? 'tr-TR' : 'en-US'))}</time>
        ${item.notes ? `<p>${escapeHtml(item.notes)}</p>` : `<p class="muted">${t('noNotes')}</p>`}
      </article>`).join('');
  } catch (error) {
    container.innerHTML = `<div class="empty-state">${t('casesLoadFailed', { error: escapeHtml(error.message) })}</div>`;
  }
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}


let lastIntelOutput = null;
$$('[data-intel-form]').forEach(form => form.addEventListener('submit', async event => {
  event.preventDefault();
  const endpoint = form.dataset.endpoint;
  const button = form.querySelector('button[type="submit"]');
  const originalText = button.textContent;
  const formData = new FormData(form);
  const payload = endpoint === 'batch'
    ? { indicators: String(formData.get('indicators') || '').split(/\r?\n/).map(v => v.trim()).filter(Boolean) }
    : { value: String(formData.get('value') || '').trim() };
  button.disabled = true;
  button.textContent = currentLanguage === 'tr' ? 'İşleniyor…' : 'Working…';
  try {
    const result = await api(`/api/intel/${endpoint}`, { method: 'POST', body: JSON.stringify(payload) });
    lastIntelOutput = result;
    $('#intel-output').textContent = JSON.stringify(result, null, 2);
    $('#intel-status').textContent = t('intelDone');
    const links = [];
    const collectLinks = obj => {
      if (!obj || typeof obj !== 'object') return;
      if (typeof obj.url === 'string' && obj.url.startsWith('https://')) links.push({ name: obj.name || obj.url, url: obj.url });
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string' && value.startsWith('https://') && ['rdap_url', 'certificate_search_url'].includes(key)) links.push({ name: key.replaceAll('_', ' '), url: value });
        else if (value && typeof value === 'object') collectLinks(value);
      }
    };
    collectLinks(result);
    const uniqueLinks = [...new Map(links.map(item => [item.url, item])).values()];
    $('#intel-links').innerHTML = uniqueLinks.map(item => `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.name)} ↗</a>`).join('');
    $('#intel-output-panel').classList.remove('hidden');
    $('#intel-output-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    $('#intel-output-panel').classList.remove('hidden');
    $('#intel-status').textContent = t('intelFailed', { error: error.message });
    $('#intel-output').textContent = '';
    $('#intel-links').innerHTML = '';
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}));
$('#copy-intel-output').addEventListener('click', async () => {
  if (!lastIntelOutput) return;
  try { await navigator.clipboard.writeText(JSON.stringify(lastIntelOutput, null, 2)); toast(t('outputCopied')); }
  catch (error) { toast(error.message); }
});

applyLanguage();
loadHealth();


// Analyst Lab: local-first utilities. No arbitrary URLs are fetched by these helpers.
const labRelationships = [];
function labSet(id, value) { const el = document.getElementById(id); if (el) el.textContent = value; }
function labValue(id) { return document.getElementById(id)?.value || ''; }
function labDownload(name, content, type='text/plain;charset=utf-8') { downloadFile(name, content, type); }
async function labCopy(id) { const text = document.getElementById(id)?.textContent || ''; if (!text) return; try { await navigator.clipboard.writeText(text); toast(t('copied')); } catch (_) { toast(t('invalidInput')); } }
function setupAnalystLab() {
  const iocRun = $('#lab-ioc-run');
  iocRun?.addEventListener('click', () => {
    const text = labValue('lab-ioc-input');
    const patterns = [
      ['url', /\bhttps?:\/\/[^\s<>"']+/gi],
      ['email', /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi],
      ['ipv4', /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g],
      ['hash', /\b(?:[a-f0-9]{32}|[a-f0-9]{40}|[a-f0-9]{64}|[a-f0-9]{128})\b/gi],
      ['domain', /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}\b/gi]
    ];
    const found = new Map();
    patterns.forEach(([type, regex]) => { for (const match of text.matchAll(regex)) { const value=match[0].replace(/[),.;]+$/,''); const key=value.toLowerCase(); if (!found.has(key)) found.set(key,{type,value}); } });
    const output = [...found.values()]; labSet('lab-ioc-output', output.length ? output.map(x=>`${x.type.padEnd(8)} ${x.value}`).join('\n') : t('noIndicators'));
    toast(t('indicatorsFound',{count:output.length}));
  });
  $('#lab-ioc-copy')?.addEventListener('click',()=>labCopy('lab-ioc-output'));
  $('#lab-defang-run')?.addEventListener('click',()=>{
    let value=labValue('lab-defang-input');
    if (labValue('lab-defang-mode')==='defang') value=value.replace(/https:\/\//gi,'hxxps://').replace(/http:\/\//gi,'hxxp://').replace(/\./g,'[.]').replace(/@/g,'[@]');
    else value=value.replace(/hxxps:\/\//gi,'https://').replace(/hxxp:\/\//gi,'http://').replace(/\[\.\]/g,'.').replace(/\[@\]/g,'@');
    labSet('lab-defang-output',value);
  });
  $('#lab-base64-run')?.addEventListener('click',()=>{ try { const v=labValue('lab-base64-input'); const out=labValue('lab-base64-mode')==='encode'?btoa(unescape(encodeURIComponent(v))):decodeURIComponent(escape(atob(v.trim()))); labSet('lab-base64-output',out); } catch (_) { labSet('lab-base64-output',t('invalidInput')); } });
  $('#lab-url-run')?.addEventListener('click',()=>{ try { const v=labValue('lab-url-input'); labSet('lab-url-output',labValue('lab-url-mode')==='encode'?encodeURIComponent(v):decodeURIComponent(v)); } catch (_) { labSet('lab-url-output',t('invalidInput')); } });
  $('#lab-sha-run')?.addEventListener('click',async()=>{ try { const bytes=new TextEncoder().encode(labValue('lab-sha-input')); const digest=await crypto.subtle.digest('SHA-256',bytes); labSet('lab-sha-output',[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('')); } catch (_) { labSet('lab-sha-output',t('invalidInput')); } });
  $('#lab-timestamp-run')?.addEventListener('click',()=>{ const raw=labValue('lab-timestamp-input').trim(); const n=Number(raw); const ms=raw.length>11?n:n*1000; const date=new Date(ms); labSet('lab-timestamp-output',Number.isFinite(n)&&Number.isFinite(date.getTime())?`UTC: ${date.toISOString()}\nLocal: ${date.toString()}\nInput interpreted as ${raw.length>11?'milliseconds':'seconds'}.`:t('invalidInput')); });
  $('#lab-cidr-run')?.addEventListener('click',()=>{
    const raw=labValue('lab-cidr-input').trim(); const match=raw.match(/^(\d{1,3}(?:\.\d{1,3}){3})\/(\d{1,2})$/);
    if(!match){labSet('lab-cidr-output',t('networkInvalid'));return;}
    const oct=match[1].split('.').map(Number), prefix=Number(match[2]);
    if(oct.some(x=>x<0||x>255)||prefix<0||prefix>32){labSet('lab-cidr-output',t('networkInvalid'));return;}
    const ip=oct.reduce((a,x)=>(a<<8n)+BigInt(x),0n), mask=prefix===0?0n:((0xffffffffn << BigInt(32-prefix))&0xffffffffn), network=ip&mask, broadcast=network|(~mask&0xffffffffn);
    const fmt=n=>[24n,16n,8n,0n].map(shift=>Number((n>>shift)&255n)).join('.');
    const total=2**(32-prefix), usable=prefix>=31?total:Math.max(0,total-2);
    labSet('lab-cidr-output',`Network: ${fmt(network)}/${prefix}\nNetmask: ${fmt(mask)}\nBroadcast: ${fmt(broadcast)}\nTotal addresses: ${total.toLocaleString()}\nUsable hosts (traditional): ${usable.toLocaleString()}`);
  });
  $('#lab-source-run')?.addEventListener('click',()=>{const score=$$('.source-check:checked').length;labSet('lab-source-output',t('sourceAssessmentResult',{score}));});
  $('#lab-rel-run')?.addEventListener('click',()=>{
    const a=labValue('lab-rel-a').trim(), rel=labValue('lab-rel-type').trim(), b=labValue('lab-rel-b').trim();
    if(!a||!rel||!b){toast(t('invalidInput'));return;}
    labRelationships.push({from:a,relationship:rel,to:b,created_at:new Date().toISOString()});
    const output=$('#lab-rel-output'); output.replaceChildren();
    labRelationships.forEach((item,i)=>{const row=document.createElement('div');row.className='relationship-row';row.textContent=`${i+1}. ${item.from}  → [${item.relationship}] →  ${item.to}`;output.appendChild(row);}); toast(t('relationshipAdded'));
  });
  $('#lab-rel-export')?.addEventListener('click',()=>labDownload('omnitrace-relationships.json',JSON.stringify(labRelationships,null,2),'application/json'));
  $('#lab-report-run')?.addEventListener('click',()=>{const title=labValue('lab-report-title').trim()||'Untitled research note';const body=labValue('lab-report-body').trim();const report=`OMNITRACE RESEARCH NOTE\nTitle: ${title}\nCreated (UTC): ${new Date().toISOString()}\n\n${body}\n\nLimitations: Findings are preliminary and should be independently corroborated.\n`;labSet('lab-report-output',report);toast(t('reportBuilt'));});
  $('#lab-report-download')?.addEventListener('click',()=>{const report=labValue('lab-report-output');if(report)labDownload('omnitrace-research-report.txt',report);else toast(t('invalidInput'));});
}
function applyPreferences() {
  let prefs={}; try{prefs=JSON.parse(localStorage.getItem('omnitrace-preferences')||'{}');}catch(_){}
  const accent=prefs.accent||'green'; document.documentElement.dataset.accent=accent;
  document.body.classList.toggle('compact-mode',!!prefs.compact);
  document.body.classList.toggle('motion-reduced',!!prefs.reduceMotion);
  // Reduced-motion preference affects decorative UI transitions, not the requested startup intro.
  if($('#theme-accent'))$('#theme-accent').value=accent;
  if($('#compact-mode'))$('#compact-mode').checked=!!prefs.compact;
  if($('#disable-motion'))$('#disable-motion').checked=!!prefs.reduceMotion;
}
$('#save-settings')?.addEventListener('click',()=>{
  const prefs={accent:labValue('theme-accent'),compact:$('#compact-mode').checked,reduceMotion:$('#disable-motion').checked};
  try{localStorage.setItem('omnitrace-preferences',JSON.stringify(prefs));}catch(_){}
  applyPreferences();toast(t('settingsSaved'));
});
setupAnalystLab(); applyPreferences();
