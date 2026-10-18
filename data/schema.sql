-- ============================================================
-- KALE BOT - SQLite Şeması
-- 30 kritik tablo
-- Node v22.23.3 / node:sqlite
-- ============================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA synchronous = NORMAL;

-- ============================================================
-- 1. USERS - Temel kullanıcı bilgileri
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    userId TEXT PRIMARY KEY,
    username TEXT,
    displayName TEXT,
    isBot INTEGER DEFAULT 0,
    accountCreated INTEGER,
    joinedAt INTEGER,
    messageCount INTEGER DEFAULT 0,
    voiceMinutes INTEGER DEFAULT 0,
    wordCount INTEGER DEFAULT 0,
    characterCount INTEGER DEFAULT 0,
    lastMessage INTEGER,
    lastSeen INTEGER,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. WARNS - Uyarılar
-- ============================================================
CREATE TABLE IF NOT EXISTS warns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    reason TEXT,
    byUser TEXT,
    byUserId TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP,
    acknowledged INTEGER DEFAULT 0
);

-- ============================================================
-- 3. CUSTODY - Gözaltı listesi
-- ============================================================
CREATE TABLE IF NOT EXISTS custody (
    userId TEXT PRIMARY KEY,
    reason TEXT,
    byUser TEXT,
    byUserId TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 4. MODERATION - Moderasyon logları (kick, ban, timeout)
-- ============================================================
CREATE TABLE IF NOT EXISTS moderation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    reason TEXT,
    duration INTEGER,
    byUser TEXT,
    byUserId TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 5. COMMANDS - Komut kullanım logları
-- ============================================================
CREATE TABLE IF NOT EXISTS commands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    command TEXT NOT NULL,
    args TEXT,
    channelId TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 6. MESSAGES - Mesaj logları
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    messageId TEXT,
    userId TEXT NOT NULL,
    channelId TEXT,
    channelName TEXT,
    content TEXT,
    length INTEGER,
    attachments TEXT,
    embeds INTEGER DEFAULT 0,
    stickers TEXT,
    mentions TEXT,
    mentionEveryone INTEGER DEFAULT 0,
    date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 7. VOICE_SESSIONS - Ses oturumları
-- ============================================================
CREATE TABLE IF NOT EXISTS voice_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    channelId TEXT,
    channelName TEXT,
    type TEXT,
    duration INTEGER DEFAULT 0,
    startTime TEXT,
    endTime TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 8. VOICE_PERIODS - Detaylı ses periyotları
-- ============================================================
CREATE TABLE IF NOT EXISTS voice_periods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    channelId TEXT,
    channelName TEXT,
    startTime TEXT,
    endTime TEXT,
    duration INTEGER DEFAULT 0,
    formatted TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 9. ACTIVITY - Günlük aktiflik
-- ============================================================
CREATE TABLE IF NOT EXISTS activity (
    userId TEXT NOT NULL,
    date TEXT NOT NULL,
    messages INTEGER DEFAULT 0,
    voiceMinutes INTEGER DEFAULT 0,
    firstActivity INTEGER,
    lastActivity INTEGER,
    duration INTEGER DEFAULT 0,
    sessions INTEGER DEFAULT 1,
    PRIMARY KEY (userId, date)
);

-- ============================================================
-- 10. JOINS_LEAVES - Katılma/ayrılma kayıtları
-- ============================================================
CREATE TABLE IF NOT EXISTS joins_leaves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    tag TEXT,
    memberCount INTEGER,
    date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 11. NICKNAME_HISTORY - Nick değişim geçmişi
-- ============================================================
CREATE TABLE IF NOT EXISTS nickname_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    oldNick TEXT,
    newNick TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 12. USERNAME_HISTORY - Kullanıcı adı değişim geçmişi
-- ============================================================
CREATE TABLE IF NOT EXISTS username_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    oldUsername TEXT,
    newUsername TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 13. AVATAR_HISTORY - Avatar değişim geçmişi
-- ============================================================
CREATE TABLE IF NOT EXISTS avatar_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    oldAvatar TEXT,
    newAvatar TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 14. STATUS_HISTORY - Durum değişim geçmişi
-- ============================================================
CREATE TABLE IF NOT EXISTS status_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    oldStatus TEXT,
    newStatus TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 15. ACTIVITY_HISTORY - Aktivite değişim geçmişi
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    oldActivity TEXT,
    newActivity TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 16. MENTIONS - Kim kimi mention'ladı
-- ============================================================
CREATE TABLE IF NOT EXISTS mentions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    mentionedUserId TEXT NOT NULL,
    channelId TEXT,
    channelName TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 17. MENTIONED_BY - Kim kimden mention aldı
-- ============================================================
CREATE TABLE IF NOT EXISTS mentioned_by (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    byUserId TEXT NOT NULL,
    byUsername TEXT,
    channelId TEXT,
    channelName TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 18. REACTIONS_GIVEN - Verilen tepkiler
-- ============================================================
CREATE TABLE IF NOT EXISTS reactions_given (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    emoji TEXT,
    messageAuthor TEXT,
    channelId TEXT,
    channelName TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 19. REACTIONS_RECEIVED - Alınan tepkiler
-- ============================================================
CREATE TABLE IF NOT EXISTS reactions_received (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    emoji TEXT,
    fromUserId TEXT,
    fromUsername TEXT,
    channelId TEXT,
    channelName TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 20. LINKS - Paylaşılan linkler
-- ============================================================
CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    url TEXT NOT NULL,
    channelId TEXT,
    channelName TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 21. FILES - Paylaşılan dosyalar
-- ============================================================
CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    name TEXT,
    url TEXT,
    size INTEGER,
    channelId TEXT,
    channelName TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 22. EMOJIS_USED - Kullanılan emojiler
-- ============================================================
CREATE TABLE IF NOT EXISTS emojis_used (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    emoji TEXT,
    channelId TEXT,
    channelName TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 23. ROLE_HISTORY - Rol alım/çıkarım geçmişi
-- ============================================================
CREATE TABLE IF NOT EXISTS role_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    roleId TEXT,
    roleName TEXT,
    type TEXT NOT NULL,
    byUser TEXT,
    byUserId TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 24. INVITES - Davet linkleri
-- ============================================================
CREATE TABLE IF NOT EXISTS invites (
    code TEXT PRIMARY KEY,
    inviterId TEXT,
    inviterTag TEXT,
    channelId TEXT,
    uses INTEGER DEFAULT 0,
    maxUses INTEGER DEFAULT 0,
    maxAge INTEGER DEFAULT 0,
    temporary INTEGER DEFAULT 0,
    createdAt INTEGER,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 25. INVITE_USES - Kim kimi davet etti
-- ============================================================
CREATE TABLE IF NOT EXISTS invite_uses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inviterId TEXT NOT NULL,
    invitedId TEXT NOT NULL,
    invitedTag TEXT,
    invitedIsBot INTEGER DEFAULT 0,
    code TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 26. SETTINGS - Bot ayarları
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 27. APO_SAYAC - Apo sayaç (tek satır)
-- ============================================================
CREATE TABLE IF NOT EXISTS apo_sayac (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    count INTEGER DEFAULT 0,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 28. AUTOMOD_ACTIONS - Otomatik moderasyon kayıtları
-- ============================================================
CREATE TABLE IF NOT EXISTS automod_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    channelId TEXT,
    ruleType TEXT,
    content TEXT,
    action TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 29. SERVER_STATS - Sunucu istatistikleri
-- ============================================================
CREATE TABLE IF NOT EXISTS server_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memberCount INTEGER,
    onlineCount INTEGER,
    boostCount INTEGER,
    channelCount INTEGER,
    roleCount INTEGER,
    date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 30. ERROR_LOGS - Hata kayıtları
-- ============================================================
CREATE TABLE IF NOT EXISTS error_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    command TEXT,
    error TEXT,
    stack TEXT,
    userId TEXT,
    guildId TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- İNDEKSLER (performans için)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_warns_userId ON warns(userId);
CREATE INDEX IF NOT EXISTS idx_moderation_userId ON moderation(userId);
CREATE INDEX IF NOT EXISTS idx_moderation_type ON moderation(type);
CREATE INDEX IF NOT EXISTS idx_commands_userId ON commands(userId);
CREATE INDEX IF NOT EXISTS idx_commands_command ON commands(command);
CREATE INDEX IF NOT EXISTS idx_commands_date ON commands(date);
CREATE INDEX IF NOT EXISTS idx_messages_userId ON messages(userId);
CREATE INDEX IF NOT EXISTS idx_messages_channelId ON messages(channelId);
CREATE INDEX IF NOT EXISTS idx_messages_date ON messages(date);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_userId ON voice_sessions(userId);
CREATE INDEX IF NOT EXISTS idx_voice_periods_userId ON voice_periods(userId);
CREATE INDEX IF NOT EXISTS idx_activity_userId ON activity(userId);
CREATE INDEX IF NOT EXISTS idx_activity_date ON activity(date);
CREATE INDEX IF NOT EXISTS idx_joins_leaves_userId ON joins_leaves(userId);
CREATE INDEX IF NOT EXISTS idx_joins_leaves_type ON joins_leaves(type);
CREATE INDEX IF NOT EXISTS idx_nickname_history_userId ON nickname_history(userId);
CREATE INDEX IF NOT EXISTS idx_username_history_userId ON username_history(userId);
CREATE INDEX IF NOT EXISTS idx_avatar_history_userId ON avatar_history(userId);
CREATE INDEX IF NOT EXISTS idx_status_history_userId ON status_history(userId);
CREATE INDEX IF NOT EXISTS idx_activity_history_userId ON activity_history(userId);
CREATE INDEX IF NOT EXISTS idx_mentions_userId ON mentions(userId);
CREATE INDEX IF NOT EXISTS idx_mentioned_by_userId ON mentioned_by(userId);
CREATE INDEX IF NOT EXISTS idx_reactions_given_userId ON reactions_given(userId);
CREATE INDEX IF NOT EXISTS idx_reactions_received_userId ON reactions_received(userId);
CREATE INDEX IF NOT EXISTS idx_links_userId ON links(userId);
CREATE INDEX IF NOT EXISTS idx_files_userId ON files(userId);
CREATE INDEX IF NOT EXISTS idx_emojis_used_userId ON emojis_used(userId);
CREATE INDEX IF NOT EXISTS idx_role_history_userId ON role_history(userId);
CREATE INDEX IF NOT EXISTS idx_role_history_type ON role_history(type);
CREATE INDEX IF NOT EXISTS idx_invite_uses_inviterId ON invite_uses(inviterId);
CREATE INDEX IF NOT EXISTS idx_invite_uses_invitedId ON invite_uses(invitedId);
CREATE INDEX IF NOT EXISTS idx_automod_actions_userId ON automod_actions(userId);
CREATE INDEX IF NOT EXISTS idx_error_logs_date ON error_logs(date);

-- ============================================================
-- BAŞLANGIÇ VERİLERİ
-- ============================================================

-- Apo sayaç (tek satır)
INSERT OR IGNORE INTO apo_sayac (id, count) VALUES (1, 0);

-- Varsayılan ayarlar
INSERT OR IGNORE INTO settings (key, value) VALUES ('log_mesaj_sil', 'true');
INSERT OR IGNORE INTO settings (key, value) VALUES ('log_mesaj_duzenle', 'true');
INSERT OR IGNORE INTO settings (key, value) VALUES ('log_uye_katil', 'true');
INSERT OR IGNORE INTO settings (key, value) VALUES ('log_uye_ayril', 'true');
INSERT OR IGNORE INTO settings (key, value) VALUES ('log_ses', 'true');
INSERT OR IGNORE INTO settings (key, value) VALUES ('log_rol', 'true');
INSERT OR IGNORE INTO settings (key, value) VALUES ('log_nick', 'true');
INSERT OR IGNORE INTO settings (key, value) VALUES ('log_durum', 'true');
INSERT OR IGNORE INTO settings (key, value) VALUES ('log_aktivite', 'true');
INSERT OR IGNORE INTO settings (key, value) VALUES ('log_profil', 'true');
INSERT OR IGNORE INTO settings (key, value) VALUES ('log_tepki', 'true');
INSERT OR IGNORE INTO settings (key, value) VALUES ('log_komut', 'true');
INSERT OR IGNORE INTO settings (key, value) VALUES ('log_sunucu', 'true');
INSERT OR IGNORE INTO settings (key, value) VALUES ('log_emoji', 'true');
INSERT OR IGNORE INTO settings (key, value) VALUES ('log_kanal', 'true');
INSERT OR IGNORE INTO settings (key, value) VALUES ('log_rol_olustur', 'true');
INSERT OR IGNORE INTO settings (key, value) VALUES ('log_rol_guncelle', 'true');
INSERT OR IGNORE INTO settings (key, value) VALUES ('log_rol_sil', 'true');
INSERT OR IGNORE INTO settings (key, value) VALUES ('log_otomatik_mod', 'true');
INSERT OR IGNORE INTO settings (key, value) VALUES ('log_timeout', 'true');

-- AUTOMOD_LOGS
CREATE TABLE IF NOT EXISTS automod_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    channelId TEXT,
    ruleType TEXT NOT NULL,
    content TEXT,
    action TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- AUTOMOD_KELIMELER
CREATE TABLE IF NOT EXISTS automod_kelimeler (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kelime TEXT UNIQUE NOT NULL,
    eklendigiTarih TEXT DEFAULT CURRENT_TIMESTAMP
);

-- AUTOMOD_IZINLI_KANALLAR
CREATE TABLE IF NOT EXISTS automod_izinli_kanallar (
    channelId TEXT PRIMARY KEY,
    eklenmeTarihi TEXT DEFAULT CURRENT_TIMESTAMP
);

-- RAID_EVENTS
CREATE TABLE IF NOT EXISTS raid_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    katilimciSayisi INTEGER,
    tarih TEXT DEFAULT CURRENT_TIMESTAMP,
    aksiyon TEXT
);

CREATE INDEX IF NOT EXISTS idx_automod_logs_userId ON automod_logs(userId);
CREATE INDEX IF NOT EXISTS idx_automod_logs_ruleType ON automod_logs(ruleType);
CREATE INDEX IF NOT EXISTS idx_automod_logs_date ON automod_logs(date);

-- ============================================================
-- SON
-- ============================================================
