<div align="center">
  <img src="docs/assets/omnitrace-preview.svg" alt="OMNITRACE karanlık istihbarat çalışma alanı önizlemesi" width="100%" />
  <br />
  <h1>OMNITRACE</h1>
  <p><strong>Açık Kaynak İstihbarat ve Siber İnceleme Çalışma Alanı</strong></p>
  <p>Herkese açık sinyalleri takip et. İpuçlarını düzenle. Bağlamı koru. Sonuçları kanıta dayandır.</p>
  <p>
    <a href="https://github.com/raxwqx/OMNITRACE"><img src="https://img.shields.io/badge/version-0.6.0-9cffb5?style=for-the-badge&labelColor=101713" alt="Sürüm 0.6.0" /></a>
    <img src="https://img.shields.io/badge/Python-3.11%2B-9bdcff?style=for-the-badge&logo=python&logoColor=white&labelColor=101713" alt="Python 3.11 veya üzeri" />
    <img src="https://img.shields.io/badge/FastAPI-API-9cffb5?style=for-the-badge&logo=fastapi&logoColor=white&labelColor=101713" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Aray%C3%BCz-T%C3%BCrk%C3%A7e%20%2F%20English-c5a6ff?style=for-the-badge&labelColor=101713" alt="Türkçe ve İngilizce arayüz" />
    <img src="https://img.shields.io/badge/Lisans-MIT-f3d58a?style=for-the-badge&labelColor=101713" alt="MIT Lisansı" />
  </p>
  <p>
    <a href="README.md">English</a> ·
    <a href="#-özellikler">Özellikler</a> ·
    <a href="#-hızlı-başlangıç">Hızlı başlangıç</a> ·
    <a href="#-api-örnekleri">API</a> ·
    <a href="#-güvenlik-ve-sorumlu-kullanım">Sorumlu kullanım</a>
  </p>
</div>

> **Önizleme notu:** Yukarıdaki görsel, mevcut OMNITRACE yerleşimine dayanan örnek bir arayüz tasarımıdır; canlı ekran görüntüsü değildir. Uygulama tarayıcınızda yerel olarak çalışır.

OMNITRACE, **yetkilendirilmiş ve açık kaynaklı OSINT araştırmaları** için modüler bir başlangıç çalışma alanıdır. Kimlik ipuçlarını, IP ve alan adı bağlamını, gösterge incelemesini, analist araçlarını ve araştırma notlarını tek ve iki dilli bir arayüzde bir araya getirir. Amaç insanları sihirli biçimde tanımlamak değil; ipuçlarını yapılandırmak, bağlamı kaydetmek ve belirsizliği görünür tutmaktır.

**Güncel sürüm:** `v0.6.0` · **Platform:** yerel çalışan web uygulaması · **Backend:** FastAPI · **Veritabanı:** varsayılan SQLite, PostgreSQL desteklenir

---

## 🧭 İçindekiler

- [Neden OMNITRACE?](#-neden-omnitrace)
- [Özellikler](#-özellikler)
- [Ekranlar ve modüller](#-ekranlar-ve-modüller)
- [Mimari](#-mimari)
- [Hızlı başlangıç](#-hızlı-başlangıç)
- [Docker ve PostgreSQL](#-docker-ve-postgresql)
- [API örnekleri](#-api-örnekleri)
- [Testler](#-testler)
- [Proje yapısı](#-proje-yapısı)
- [Güvenlik ve sorumlu kullanım](#-güvenlik-ve-sorumlu-kullanım)
- [Yol haritası](#-yol-haritası)
- [Katkı](#-katkı)
- [Lisans](#-lisans)

## 🧩 Neden OMNITRACE?

OSINT çalışması tarayıcı sekmelerine, terminal komutlarına, metin dosyalarına ve vaka notlarına dağılabilir. OMNITRACE bu küçük görevlere ortak bir çalışma alanı ve tutarlı bir akış kazandırır:

1. **İpucunu topla** — herkese açık bir kaynaktan veya kullanıcının verdiği göstergeden.
2. **Bağlamı incele** — odaklı ayrıştırma ve sorgu yardımcılarıyla.
3. **Kapsamı ve notları kaydet** — araştırma defterinde.
4. **Sonuçları dışa aktar veya yeniden kullan** — JSON, CSV veya hızlı rapor olarak.
5. **Belirsizliği açık tut.** Bir aday, doğrulanmış bir sonuç değil; bir ipucudur.

### Tasarım ilkeleri

- **Önce pasif:** port tarama, istismar veya rastgele URL getirme yok.
- **Kanıt bilinci:** aday, ayrıştırılmış değer ve doğrulanmış gerçek birbirinden ayrılır.
- **Yerel öncelikli:** arayüz ve analist araçları yerel kullanım için tasarlanmıştır.
- **İki dilli:** Türkçe ve İngilizce arayüz etiketleri.
- **Modüler:** dikkatle kapsamlandırılmış sağlayıcı adaptörleri ve gelecekteki vaka akışları için temel.

## ✨ Özellikler

| Modül | Ne yapar | Önemli sınır |
|---|---|---|
| **Kimlik İstihbaratı** | Sabit sağlayıcı kayıt defterinden olası herkese açık profil URL'leri üretir; platform seçimi ve son arama geçmişini destekler. | URL'ler otomatik kontrol edilmez. Kullanıcı adı benzerliği kimliği kanıtlamaz. |
| **IP İstihbaratı** | IPv4/IPv6 doğrular; genel, özel, loopback ve ayrılmış aralıkları sınıflandırır; herkese açık RDAP kayıtlarına bağlantı verir. | Konum, sahiplik, itibar veya güvenlik hükmü garantisi yoktur. |
| **Alan Adı ve DNS** | Sınırlı A, AAAA, MX, NS ve TXT sorguları; RDAP ve Sertifika Şeffaflığı arama bağlantıları. | DNS ağ erişimi gerektirir; zaman aşımına uğrayabilir veya kayıt döndürmeyebilir. |
| **Pasif alt alan adı keşfi** | Herkese açık Sertifika Şeffaflığı kayıtlarından sertifikalarda listelenen adları toplar. | Keşfedilen sunucuları taramaz. Kayıtlar eksik veya eski olabilir. |
| **E-posta alan adı kontrolü** | E-posta sözdizimini doğrular ve alan adının herkese açık MX kaydı yayımlayıp yayımlamadığını kontrol eder. | Posta kutusunu veya bir kişinin kontrolünü doğrulamaz. |
| **URL inceleyici** | HTTP(S) URL bileşenlerini yerel olarak ayrıştırır ve temel göstergeleri işaretler. | Gönderilen URL bu araç tarafından getirilmez. |
| **Hash tanımlayıcı** | Yaygın onaltılık özet uzunluklarını tanır ve isteğe bağlı dış sorgu bağlantıları sunar. | Uzunluğa dayalı algoritma tahmini belirsiz olabilir; itibar otomatik sorgulanmaz. |
| **Toplu IOC incelemesi** | En fazla 100 IP, alan adı, URL, e-posta ve yaygın hash'i sınıflandırır ve yinelenenleri ayıklar. | Sınıflandırma bir yardımcıdır; tehdit hükmü değildir. |
| **Gösterge İzleme Listesi** | IP, alan adı, URL, e-posta ve hash'leri otomatik tür, isteğe bağlı not ve isteğe bağlı dosya bağlantısıyla kaydeder. Dosya bazında filtreleme, yinelenen algılama ve JSON/CSV dışa aktarma sunar. | Kayıtlı değerler yerel kayıtlardır, hüküm değildir. Dosya bağlantısı yalnızca düzenleme amaçlıdır; ilgi kanıtı değildir. |
| **Araştırma defteri** | Araştırma başlıklarını, kapsamı ve notları yapılandırılmış veritabanında saklar. | Mevcut başlangıç sürümü çok kullanıcılı vaka yönetimi servisi değildir. |
| **Analist Laboratuvarı** | Verileri hazırlamak ve düzenlemek için on tarayıcı-yerel araç. | Çıktılar yine de analist incelemesi ve doğrulaması gerektirir. |
| **Çalışma alanı ayarları** | Matrix yeşili, siber mavi, sinyal moru veya amber vurgular; kompakt yerleşim ve hareket tercihi. | Tercihler yalnızca mevcut tarayıcıda saklanır. |
| **Dışa aktarma** | Kimlik sonuçları JSON/CSV, kopyalanan aday URL'ler, zaman damgalı hızlı raporlar ve gösterge listesi dışa aktarma. | Dışa aktarılan ipuçları doğrulanmamış durumunu korur. |

### v0.6.0 yenilikleri

- **Gösterge İzleme Listesi:** IP, alan adı, URL, e-posta ve hash'leri otomatik tür sınıflandırması, not ve isteğe bağlı dosya bağlantısıyla kaydedin. Aynı değer aynı dosyada ikinci kez eklenmez; farklı dosyalarda ayrı kayıt olarak tutulabilir.
- **Dosya bazında filtreleme ve özet:** kayıtlı göstergeleri türe göre süzün, toplam ve tür sayılarını görün.
- **JSON/CSV dışa aktarma:** izleme listesini rapor veya tablo için indirin.
- **Düzeltildi:** `/api/cases` aynı listeyi istek başına iki kez sorgulamıyor.
- **Düzeltildi:** yalnızca nokta, alt çizgi veya tireden oluşan kullanıcı adları reddediliyor.
- **Düzeltildi:** vaka notları tutarlı biçimde kırpılıyor; gösterge doğrulaması tek yerde.
- **Düzeltildi:** kullanılmayan içe aktarımlar ve değişkenler kaldırıldı; sağlayıcı User-Agent değeri gerçek sürümü bildiriyor.
- **Sağlamlaştırma:** tam MIT lisansı, Dependabot, `SECURITY.md` ve pip önbellekli CI matrisi (Python 3.11–3.13).

### Analist Laboratuvarı: 10 yerel araç

<details>
<summary><strong>Araç listesini aç</strong></summary>

1. Yapıştırılan metinden olası IP, alan adı, URL, e-posta ve hash çıkarıcı.
2. Göstergeleri güvenli paylaşım için defang/refang yardımcısı.
3. UTF-8 destekli Base64 metin kodlama/çözme.
4. URL bileşeni kodlama/çözme.
5. Metnin SHA-256 özeti (dosya hash aracı değildir).
6. Saniye veya milisaniye Unix zaman damgası dönüştürücü.
7. IPv4 CIDR hesaplayıcı: ağ, yayın ve kullanılabilir ana makine sayısı.
8. Kaynak kalitesi kontrol listesi.
9. İpuçlarını kaydetmek için basit ilişki haritalayıcı.
10. Zaman damgalı hızlı rapor oluşturucu.

</details>

## 🖥️ Ekranlar ve modüller

Arayüz, asit yeşili vurgulara sahip koyu, Matrix esintili bir tema kullanır. Başlangıç dizisi her yeni sayfa yüklemesinde oynar ve atlanabilir.

| Ekran | Amaç |
|---|---|
| **Genel Bakış** | Çalışma alanı özeti ve modül giriş noktaları. |
| **Kimlik İstihbaratı** | Desteklenen platformlarda aday profil bağlantıları oluştur ve sonuç listesini dışa aktar. |
| **OSINT Araç Seti** | IP, alan adı, e-posta alan adı, URL, hash ve toplu göstergeleri incele. |
| **Araştırmalar** | Vaka kapsamını ve araştırma notlarını bir arada tut. |
| **Gösterge İzleme Listesi** | Göstergeleri tür, not ve isteğe bağlı dosya bağlantısıyla kaydet; filtrele ve dışa aktar. |
| **Analist Laboratuvarı** | Tarayıcıda çalışan on küçük veri hazırlama aracını kullan. |
| **Ayarlar** | Dili değiştir ve görsel tercihleri ayarla. |

## 🏗️ Mimari

```mermaid
flowchart TD
    A[Tarayıcı arayüzü<br/>HTML · CSS · JavaScript] --> B[FastAPI uygulaması]
    B --> C[Kimlik API'si]
    B --> D[İstihbarat API'si]
    B --> E[Araştırma API'si]
    B --> L[Gösterge İzleme API'si]
    C --> F[Sağlayıcı kayıt defteri<br/>aday URL'ler]
    D --> G[IP ayrıştırma · DNS · RDAP<br/>CT arama · IOC incelemesi]
    E --> H[SQLAlchemy kalıcılığı]
    L --> H
    H --> I[(Yerel varsayılan SQLite)]
    H --> J[(İsteğe bağlı PostgreSQL)]
    A --> K[Analist Laboratuvarı<br/>tarayıcı-yerel araçlar]
```

### Teknoloji yığını

- **Backend:** Python 3.11+, FastAPI, Uvicorn
- **Veri katmanı:** SQLAlchemy; yerel geliştirme için SQLite; Docker dağıtımları için PostgreSQL desteği
- **Ön yüz:** HTML, CSS, saf JavaScript
- **Test:** pytest ve FastAPI `TestClient`
- **Paketleme:** başlatma/test betikleri, Dockerfile, Docker Compose

## 🚀 Hızlı başlangıç

### Seçenek A: başlatma betiği (önerilir)

Python 3.11+ bulunan Kali Linux veya başka bir Linux dağıtımında, sürüm arşivini çıkarın, terminalde `OMNITRACE/` klasörünü açın ve çalıştırın:

```bash
chmod +x ./run.sh ./test.sh
./run.sh
```

Ardından şu adresleri açın:

- **Web uygulaması:** <http://127.0.0.1:8000>
- **Etkileşimli API belgeleri:** <http://127.0.0.1:8000/docs>
- **Sağlık uç noktası:** <http://127.0.0.1:8000/api/health>

Başlatıcı, proje içinde sanal ortam oluşturur, gerekirse bağımlılıkları kurar ve yerel sunucuyu başlatır. OMNITRACE kullanırken terminali açık tutun. Durdurmak için `Ctrl+C`.

### Seçenek B: elle kurulum

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip

cd OMNITRACE
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e '.[dev]'
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

Düzenlenebilir kurulum yerel paketleme politikası tarafından engellenirse bağımlılıkları doğrudan kurun:

```bash
python -m pip install -r requirements.txt
python -m pip install pytest pytest-cov httpx ruff
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

### İlk çalıştırma notları

- Maruz kalma sonuçlarını anlamıyorsanız uygulamayı `127.0.0.1` üzerinde tutun.
- Varsayılan yerel veritabanı SQLite'tır.
- DNS sorguları ve herkese açık kayıt sorguları ağ erişimi gerektirir.
- Uygulamanın mevcut temel akışları için dış OSINT API anahtarı gerekmez.
- Araştırma formlarına parola, sır veya özel kişisel kayıt girmeyin.

## 🐳 Docker ve PostgreSQL

Docker Compose, OMNITRACE'ı PostgreSQL ile birlikte çalıştırır ve uygulamayı başlatmadan önce veritabanı sağlık kontrolünü bekler.

```bash
# Bu geliştirme ortamı için benzersiz bir yerel parola belirleyin.
export POSTGRES_PASSWORD='uzun-bir-yerel-parola'
docker compose up --build
```

<http://127.0.0.1:8000> adresini açın. Varsayılan port bağlaması tasarım gereği yalnızca loopback'tir; bu yerel bir dağıtım yapılandırmasıdır, **sertleştirilmiş herkese açık üretim kurulumu değildir**.

Servisleri durdurmak için:

```bash
docker compose down
```

Yerel veritabanı birimini de silmek için yalnızca saklanan verileri bilinçli olarak silmek istiyorsanız `docker compose down -v` kullanın.

Compose dışında PostgreSQL için `DATABASE_URL` değerini şu biçimde ayarlayın:

```text
postgresql+psycopg://kullanici:parola@host:5432/omnitrace
```

İsteğe bağlı PostgreSQL bağımlılıklarını `python -m pip install -e '.[dev,postgres]'` ile kurun. Kimlik bilgilerini ortam değişkenlerinde veya asla commit edilmeyen yerel bir `.env` dosyasında tutun.

## 🔌 API örnekleri

Önce OMNITRACE'ı başlatın. Aşağıdaki örnekler `127.0.0.1:8000` üzerindeki yerel API'yi kullanır.

### Sağlık kontrolü

```bash
curl http://127.0.0.1:8000/api/health
```

### Kimlik aday araması

```bash
curl -X POST http://127.0.0.1:8000/api/identity/search \
  -H 'Content-Type: application/json' \
  -d '{"username":"ornek_kullanici","platforms":["github","reddit","instagram"]}'
```

Sonuç, aday URL'lerin listesidir. Bu hesapların var olduğunu kontrol etmez.

### IP istihbaratı

```bash
curl -X POST http://127.0.0.1:8000/api/intel/ip \
  -H 'Content-Type: application/json' \
  -d '{"value":"8.8.8.8"}'
```

### Alan adı ve DNS kayıtları

```bash
curl -X POST http://127.0.0.1:8000/api/intel/domain \
  -H 'Content-Type: application/json' \
  -d '{"value":"example.org"}'
```

### URL'yi yerel olarak ayrıştır

```bash
curl -X POST http://127.0.0.1:8000/api/intel/url \
  -H 'Content-Type: application/json' \
  -d '{"value":"https://example.org/path?q=1"}'
```

URL ayrıştırıcı verilen metni inceler. Hedef URL'yi istemez.

### Toplu gösterge incelemesi

```bash
curl -X POST http://127.0.0.1:8000/api/intel/batch \
  -H 'Content-Type: application/json' \
  -d '{"indicators":["8.8.8.8","example.org","https://example.org","d41d8cd98f00b204e9800998ecf8427e"]}'
```

### Gösterge izleme listesi

```bash
# Gösterge ekle (tür otomatik sınıflandırılır)
curl -X POST http://127.0.0.1:8000/api/indicators \
  -H 'Content-Type: application/json' \
  -d '{"value":"8.8.8.8","note":"Çözümleyici IP","case_id":null}'

# Listele ve türe göre filtrele
curl 'http://127.0.0.1:8000/api/indicators?indicator_type=ip'

# Bir dosyaya bağlı göstergeler
curl 'http://127.0.0.1:8000/api/indicators?case_id=1'

# Sil
curl -X DELETE http://127.0.0.1:8000/api/indicators/1
```

### Araştırma notu oluştur ve listele

```bash
curl -X POST http://127.0.0.1:8000/api/cases \
  -H 'Content-Type: application/json' \
  -d '{"title":"Yetkili OSINT çalışması","notes":"Kapsam ve yetkilendirme kaydedildi."}'

curl http://127.0.0.1:8000/api/cases
```

Tam etkileşimli şema için <http://127.0.0.1:8000/docs> adresini ziyaret edin.

## 🧪 Testler

Paketlenmiş test betiğini çalıştırın:

```bash
./test.sh
```

Veya sanal ortamı etkinleştirip çalıştırın:

```bash
python -m pytest -q
```

Test paketi geçici bir SQLite veritabanı kullanır ve uygun yerlerde dış RDAP/Sertifika Şeffaflığı yanıtlarını taklit eder. Canlı OSINT sağlayıcı erişimi gerektirmez. Node.js varsa JavaScript sözdizimi kontrolleri de çalıştırılır.

## 📁 Proje yapısı

```text
OMNITRACE/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── identity.py       # Kimlik aday arama API'si
│   │   │   ├── cases.py          # Araştırma defteri API'si
│   │   │   ├── indicators.py     # Gösterge izleme listesi API'si
│   │   │   └── intel.py          # IP, DNS, e-posta, URL, hash, toplu IOC
│   │   ├── core/                 # Uygulama yapılandırması
│   │   ├── models/               # İstek/yanıt şemaları ve DB modelleri
│   │   ├── services/             # Kimlik, vaka ve gösterge servisleri
│   │   ├── db.py                 # SQLAlchemy motoru ve oturumları
│   │   └── main.py               # FastAPI uygulaması ve statik ön yüz
│   └── tests/                    # API ve servis testleri
├── frontend/
│   ├── index.html                # Uygulama kabuğu ve görünümler
│   ├── styles.css                # Koyu Matrix esintili tema
│   └── app.js                    # Gezinme ve tarayıcı-yerel araçlar
├── docs/assets/
│   └── omnitrace-preview.svg     # README arayüz illüstrasyonu
├── .github/workflows/tests.yml   # CI matrisi
├── .github/dependabot.yml        # Bağımlılık güncellemeleri
├── Dockerfile
├── docker-compose.yml
├── pyproject.toml
├── requirements.txt
├── run.sh                        # Yerel başlatıcı
├── test.sh                       # Test çalıştırıcı
├── CHANGELOG.md
├── SECURITY.md
├── README.md                     # İngilizce
├── README.tr.md                  # Türkçe (bu dosya)
└── LICENSE
```

## 🛡️ Güvenlik ve sorumlu kullanım

OMNITRACE bir araştırma başlangıcıdır, **henüz sertleştirilmiş çok kullanıcılı herkese açık bir servis değildir**. Herhangi bir dağıtımı internete açmadan önce en az şunları ele alın:

- Kimlik doğrulama, yetkilendirme ve kullanıcı bazında vaka izolasyonu ekleyin.
- CSRF korumaları, güvenilen ana makine işleme, CORS ve HTTPS sonlandırmayı gözden geçirin.
- Hız sınırları, denetim günlükleri, yedekleme/geri yükleme, veri saklama kontrolleri ve sır yönetimi ekleyin.
- Entegrasyonları izin listesine alın. Kullanıcı girdisini asla rastgele sunucu tarafı isteğe dönüştürmeyin; bu SSRF riski yaratır.
- Kaynak sağlayıcı koşullarına, API kurallarına, gizlilik gereksinimlerine ve geçerli yasalara uyun.
- Gelecekteki zenginleştirme adaptörleri için kaynak, erişim zamanı, kapsam ve güven düzeyini kaydedin.
- Kullanıcı adı benzerliğini, bir IP adresini veya tek bir herkese açık kaydı kimlik ya da niyet kanıtı saymayın.

### Veri yorumlama kuralları

- **Aday ≠ doğrulanmış hesap.** Oluşturulan profil URL'si mevcut olmayabilir.
- **Herkese açık ≠ doğru.** Herkese açık kayıtlar eski, eksik veya yanıltıcı olabilir.
- **Ayrıştırılmış ≠ güvenli.** Sözdizimsel olarak geçerli bir göstergenin otomatik güvenlik hükmü yoktur.
- **İlişkilendirme ≠ kimlik.** Benzer kullanıcı adları veya ortak altyapı, iki varlığın aynı kişi olduğunu kanıtlamaz.
- **Analist araçları ≠ doğruluk kaynağı.** Karar vermeden önce çıktıları inceleyin ve doğrulayın.

### Gösterge İzleme Listesi verisi

İzleme listesi yalnızca sizin girdiğiniz değerleri ve notları yerel veritabanında saklar. Kaydetmek, bir göstergenin kötü niyetli veya doğru olduğu anlamına gelmez. Dışa aktarılan JSON/CSV dosyaları araştırma verisi içerebilir; paylaşmadan önce gözden geçirin.

## 🗺️ Yol haritası

Tasarım ve testlere tabi planlanan çalışmalar:

- **v0.7:** veritabanı geçişleri, kimlik doğrulama ve kullanıcı kapsamlı araştırmalar.
- **v0.7+:** kanıt grafiği, zaman çizelgesi ve daha zengin HTML/JSON raporları.
- **Gelecek adaptörler:** açık API anahtarları, kaynak kökeni ve hız sınırı işleme ile isteğe bağlı tehdit istihbaratı entegrasyonları.
- **v1.0:** dağıtım sertleştirme, entegrasyon testleri ve operasyonel dokümantasyon.

Yol haritası maddeleri planlardır; mevcut sürümde vaat edilen özellikler değildir.

## 🤝 Katkı

Issue'lar, dikkatli hata bildirimleri, dokümantasyon iyileştirmeleri ve kapsamlı pull request'ler memnuniyetle karşılanır.

1. Sorunu veya önerilen değişikliği açıklayan bir issue açın.
2. Değişiklikleri odaklı tutun; yeni veri toplama veya ağ davranışını belgeleyin.
3. Davranış değişiklikleri için test ekleyin veya güncelleyin.
4. Pull request göndermeden önce `./test.sh` çalıştırın.
5. Test verilerine asla API anahtarı, kişisel veri, araştırma kaydı veya gerçek hassas gösterge eklemeyin.

## 📜 Lisans

[MIT Lisansı](LICENSE) altında yayımlanmıştır.

---

<div align="center">
  <strong>OMNITRACE</strong><br />
  <sub>Sorumlu açık kaynak araştırması için tasarlandı · v0.6.0</sub><br />
  <sub>TR / EN · Yerel öncelikli · Kanıt bilinci</sub>
</div>
