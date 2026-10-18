// ============================================================
// MELEZYA BOT - SQLite Veritabanı Modülü
// node:sqlite (Node 22.13+)
// ============================================================

const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'kale.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db = null;

function getDB() {
    if (db) return db;

    if (!fs.existsSync(__dirname)) {
        fs.mkdirSync(__dirname, { recursive: true });
    }

    db = new DatabaseSync(DB_PATH);

    db.exec('PRAGMA journal_mode = WAL');
    db.exec('PRAGMA foreign_keys = ON');
    db.exec('PRAGMA synchronous = NORMAL');

    try {
        const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
        db.exec(schema);
        console.log('✅ SQLite veritabanı hazır:', DB_PATH);
    } catch (e) {
        console.error('❌ Schema yüklenemedi:', e.message);
        throw e;
    }

    return db;
}

// ============================================================
// AYARLAR
// ============================================================

function loadSettings() {
    const database = getDB();
    const rows = database.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    rows.forEach(row => {
        settings[row.key] = row.value === 'true';
    });
    return settings;
}

function setSetting(key, value) {
    const database = getDB();
    database.prepare(`
        INSERT INTO settings (key, value, updatedAt) 
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET value = ?, updatedAt = CURRENT_TIMESTAMP
    `).run(key, String(value), String(value));
}

function getSetting(key) {
    const database = getDB();
    const row = database.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return row ? row.value : null;
}

// ============================================================
// APO SAYAÇ
// ============================================================

function getApoCount() {
    const database = getDB();
    const row = database.prepare('SELECT count FROM apo_sayac WHERE id = 1').get();
    return row ? row.count : 0;
}

function incrementApoCount() {
    const database = getDB();
    database.prepare('UPDATE apo_sayac SET count = count + 1, updatedAt = CURRENT_TIMESTAMP WHERE id = 1').run();
    return getApoCount();
}

// ============================================================
// KULLANICI
// ============================================================

function ensureUser(userId, username, displayName, isBot = false) {
    const database = getDB();
    database.prepare(`
        INSERT INTO users (userId, username, displayName, isBot, accountCreated, joinedAt, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(userId) DO UPDATE SET
            username = excluded.username,
            displayName = excluded.displayName,
            updatedAt = CURRENT_TIMESTAMP
    `).run(userId, username || '', displayName || '', isBot ? 1 : 0, Date.now(), Date.now());
}

function getUser(userId) {
    const database = getDB();
    return database.prepare('SELECT * FROM users WHERE userId = ?').get(userId);
}

function incrementUserMessages(userId, wordCount = 0, characterCount = 0) {
    const database = getDB();
    database.prepare(`
        UPDATE users 
        SET messageCount = messageCount + 1,
            wordCount = wordCount + ?,
            characterCount = characterCount + ?,
            lastMessage = ?,
            updatedAt = CURRENT_TIMESTAMP
        WHERE userId = ?
    `).run(wordCount, characterCount, Date.now(), userId);
}

function incrementUserVoice(userId, minutes) {
    const database = getDB();
    database.prepare(`
        UPDATE users 
        SET voiceMinutes = voiceMinutes + ?,
            updatedAt = CURRENT_TIMESTAMP
        WHERE userId = ?
    `).run(minutes, userId);
}

// ============================================================
// UYARILAR
// ============================================================

function addWarn(userId, reason, byUser, byUserId) {
    const database = getDB();
    const result = database.prepare(`
        INSERT INTO warns (userId, reason, byUser, byUserId, date)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(userId, reason, byUser, byUserId);
    return result.lastInsertRowid;
}

function getWarns(userId) {
    const database = getDB();
    return database.prepare('SELECT * FROM warns WHERE userId = ? ORDER BY date DESC').all(userId);
}

function getWarnCount(userId) {
    const database = getDB();
    const row = database.prepare('SELECT COUNT(*) as count FROM warns WHERE userId = ?').get(userId);
    return row ? row.count : 0;
}

function removeWarn(warnId) {
    const database = getDB();
    database.prepare('DELETE FROM warns WHERE id = ?').run(warnId);
}

function clearWarns(userId) {
    const database = getDB();
    database.prepare('DELETE FROM warns WHERE userId = ?').run(userId);
}

// ============================================================
// GÖZALTI
// ============================================================

function addCustody(userId, reason, byUser, byUserId) {
    const database = getDB();
    database.prepare(`
        INSERT INTO custody (userId, reason, byUser, byUserId, date)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(userId) DO UPDATE SET
            reason = excluded.reason,
            byUser = excluded.byUser,
            byUserId = excluded.byUserId,
            date = CURRENT_TIMESTAMP
    `).run(userId, reason, byUser, byUserId);
}

function removeCustody(userId) {
    const database = getDB();
    database.prepare('DELETE FROM custody WHERE userId = ?').run(userId);
}

function getCustodyList() {
    const database = getDB();
    return database.prepare('SELECT * FROM custody ORDER BY date DESC').all();
}

function isInCustody(userId) {
    const database = getDB();
    const row = database.prepare('SELECT userId FROM custody WHERE userId = ?').get(userId);
    return !!row;
}

// ============================================================
// MODERASYON
// ============================================================

function addModeration(userId, type, reason, duration, byUser, byUserId) {
    const database = getDB();
    database.prepare(`
        INSERT INTO moderation (userId, type, reason, duration, byUser, byUserId, date)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(userId, type, reason || '', duration || 0, byUser || '', byUserId || '');
}

// ============================================================
// KOMUT LOGU
// ============================================================

function addCommandLog(userId, command, args, channelId) {
    const database = getDB();
    database.prepare(`
        INSERT INTO commands (userId, command, args, channelId, date)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(userId, command, args || '', channelId || '');
}

// ============================================================
// MESAJ LOGU
// ============================================================

function addMessageLog(userId, messageId, channelId, channelName, content, attachments, mentions) {
    const database = getDB();
    database.prepare(`
        INSERT INTO messages (messageId, userId, channelId, channelName, content, length, attachments, mentions, date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
        messageId,
        userId,
        channelId,
        channelName,
        content || '',
        (content || '').length,
        JSON.stringify(attachments || []),
        JSON.stringify(mentions || [])
    );
}

function searchMessages(userId, kelime) {
    const database = getDB();
    return database.prepare(`
        SELECT * FROM messages 
        WHERE userId = ? AND content LIKE ? 
        ORDER BY date DESC LIMIT 200
    `).all(userId, `%${kelime}%`);
}

// ============================================================
// SES
// ============================================================

function addVoiceSession(userId, channelId, channelName, type, duration, startTime, endTime) {
    const database = getDB();
    database.prepare(`
        INSERT INTO voice_sessions (userId, channelId, channelName, type, duration, startTime, endTime, date)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(userId, channelId, channelName, type, duration || 0, startTime || '', endTime || '');
}

function addVoicePeriod(userId, channelId, channelName, startTime, endTime, duration, formatted) {
    const database = getDB();
    database.prepare(`
        INSERT INTO voice_periods (userId, channelId, channelName, startTime, endTime, duration, formatted, date)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(userId, channelId, channelName, startTime, endTime, duration, formatted || '');
}

function updateActivity(userId, date, messages, voiceMinutes) {
    const database = getDB();
    database.prepare(`
        INSERT INTO activity (userId, date, messages, voiceMinutes, firstActivity, lastActivity)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(userId, date) DO UPDATE SET
            messages = messages + ?,
            voiceMinutes = voiceMinutes + ?,
            lastActivity = ?
    `).run(userId, date, messages || 0, voiceMinutes || 0, Date.now(), Date.now(), messages || 0, voiceMinutes || 0, Date.now());
}

// ============================================================
// KATILMA / AYRILMA
// ============================================================

function addJoinLeave(userId, type, tag, memberCount) {
    const database = getDB();
    database.prepare(`
        INSERT INTO joins_leaves (userId, type, tag, memberCount, date)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(userId, type, tag || '', memberCount || 0);
}

// ============================================================
// GEÇMİŞ KAYITLARI
// ============================================================

function addNicknameHistory(userId, oldNick, newNick) {
    const database = getDB();
    database.prepare(`
        INSERT INTO nickname_history (userId, oldNick, newNick, date)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `).run(userId, oldNick || '', newNick || '');
}

function addUsernameHistory(userId, oldUsername, newUsername) {
    const database = getDB();
    database.prepare(`
        INSERT INTO username_history (userId, oldUsername, newUsername, date)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `).run(userId, oldUsername || '', newUsername || '');
}

function addAvatarHistory(userId, oldAvatar, newAvatar) {
    const database = getDB();
    database.prepare(`
        INSERT INTO avatar_history (userId, oldAvatar, newAvatar, date)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `).run(userId, oldAvatar || '', newAvatar || '');
}

function addStatusHistory(userId, oldStatus, newStatus) {
    const database = getDB();
    database.prepare(`
        INSERT INTO status_history (userId, oldStatus, newStatus, date)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `).run(userId, oldStatus || '', newStatus || '');
}

function addActivityHistory(userId, oldActivity, newActivity) {
    const database = getDB();
    database.prepare(`
        INSERT INTO activity_history (userId, oldActivity, newActivity, date)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `).run(userId, oldActivity || '', newActivity || '');
}

// ============================================================
// MENTION / TEPKİ
// ============================================================

function addMention(userId, mentionedUserId, channelId, channelName) {
    const database = getDB();
    database.prepare(`
        INSERT INTO mentions (userId, mentionedUserId, channelId, channelName, date)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(userId, mentionedUserId, channelId, channelName);
}

function addMentionedBy(userId, byUserId, byUsername, channelId, channelName) {
    const database = getDB();
    database.prepare(`
        INSERT INTO mentioned_by (userId, byUserId, byUsername, channelId, channelName, date)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(userId, byUserId, byUsername || '', channelId, channelName);
}

function addReactionGiven(userId, emoji, messageAuthor, channelId, channelName) {
    const database = getDB();
    database.prepare(`
        INSERT INTO reactions_given (userId, emoji, messageAuthor, channelId, channelName, date)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(userId, emoji, messageAuthor || '', channelId, channelName);
}

function addReactionReceived(userId, emoji, fromUserId, fromUsername, channelId, channelName) {
    const database = getDB();
    database.prepare(`
        INSERT INTO reactions_received (userId, emoji, fromUserId, fromUsername, channelId, channelName, date)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(userId, emoji, fromUserId, fromUsername || '', channelId, channelName);
}

// ============================================================
// LİNK / DOSYA / EMOJİ
// ============================================================

function addLink(userId, url, channelId, channelName) {
    const database = getDB();
    database.prepare(`
        INSERT INTO links (userId, url, channelId, channelName, date)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(userId, url, channelId, channelName);
}

function addFile(userId, name, url, size, channelId, channelName) {
    const database = getDB();
    database.prepare(`
        INSERT INTO files (userId, name, url, size, channelId, channelName, date)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(userId, name || '', url || '', size || 0, channelId, channelName);
}

function addEmojiUsed(userId, emoji, channelId, channelName) {
    const database = getDB();
    database.prepare(`
        INSERT INTO emojis_used (userId, emoji, channelId, channelName, date)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(userId, emoji, channelId, channelName);
}

function addRoleHistory(userId, roleId, roleName, type, byUser, byUserId) {
    const database = getDB();
    database.prepare(`
        INSERT INTO role_history (userId, roleId, roleName, type, byUser, byUserId, date)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(userId, roleId, roleName || '', type, byUser || '', byUserId || '');
}

// ============================================================
// DAVET
// ============================================================

function saveInvite(code, inviterId, inviterTag, channelId, uses, maxUses, maxAge, temporary, createdAt) {
    const database = getDB();
    database.prepare(`
        INSERT INTO invites (code, inviterId, inviterTag, channelId, uses, maxUses, maxAge, temporary, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(code) DO UPDATE SET
            uses = excluded.uses,
            updatedAt = CURRENT_TIMESTAMP
    `).run(code, inviterId, inviterTag || '', channelId, uses || 0, maxUses || 0, maxAge || 0, temporary ? 1 : 0, createdAt || Date.now());
}

function addInviteUse(inviterId, invitedId, invitedTag, invitedIsBot, code) {
    const database = getDB();
    database.prepare(`
        INSERT INTO invite_uses (inviterId, invitedId, invitedTag, invitedIsBot, code, date)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(inviterId, invitedId, invitedTag || '', invitedIsBot ? 1 : 0, code || '');
}

function getTopInviters(limit = 10) {
    const database = getDB();
    return database.prepare(`
        SELECT inviterId, COUNT(*) as count 
        FROM invite_uses 
        WHERE invitedIsBot = 0
        GROUP BY inviterId 
        ORDER BY count DESC 
        LIMIT ?
    `).all(limit);
}

// ============================================================
// SUNUCU İSTATİSTİK / HATA
// ============================================================

function addServerStats(memberCount, onlineCount, boostCount, channelCount, roleCount) {
    const database = getDB();
    database.prepare(`
        INSERT INTO server_stats (memberCount, onlineCount, boostCount, channelCount, roleCount, date)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(memberCount, onlineCount, boostCount, channelCount, roleCount);
}

function addErrorLog(command, error, stack, userId, guildId) {
    const database = getDB();
    database.prepare(`
        INSERT INTO error_logs (command, error, stack, userId, guildId, date)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(command || '', error || '', stack || '', userId || '', guildId || '');
}

// ============================================================
// OTOMATİK MODERASYON - KELİMELER
// ============================================================

function getAutomodKelimeler() {
    const database = getDB();
    return database.prepare('SELECT kelime FROM automod_kelimeler ORDER BY kelime ASC').all().map(r => r.kelime);
}

function addAutomodKelime(kelime) {
    const database = getDB();
    try {
        database.prepare('INSERT OR IGNORE INTO automod_kelimeler (kelime) VALUES (?)').run(kelime.toLowerCase().trim());
        return true;
    } catch (e) {
        return false;
    }
}

function removeAutomodKelime(kelime) {
    const database = getDB();
    const result = database.prepare('DELETE FROM automod_kelimeler WHERE kelime = ?').run(kelime.toLowerCase().trim());
    return result.changes > 0;
}

function automodKelimeVarMi(kelime) {
    const database = getDB();
    const row = database.prepare('SELECT kelime FROM automod_kelimeler WHERE kelime = ?').get(kelime.toLowerCase().trim());
    return !!row;
}

// ============================================================
// OTOMATİK MODERASYON - İZİNLİ KANALLAR
// ============================================================

function getAutomodIzinliKanallar() {
    const database = getDB();
    return database.prepare('SELECT channelId FROM automod_izinli_kanallar').all().map(r => r.channelId);
}

function addAutomodIzinliKanal(channelId) {
    const database = getDB();
    try {
        database.prepare('INSERT OR IGNORE INTO automod_izinli_kanallar (channelId) VALUES (?)').run(channelId);
        return true;
    } catch (e) {
        return false;
    }
}

function removeAutomodIzinliKanal(channelId) {
    const database = getDB();
    const result = database.prepare('DELETE FROM automod_izinli_kanallar WHERE channelId = ?').run(channelId);
    return result.changes > 0;
}

function automodKanalIzinliMi(channelId) {
    const database = getDB();
    const row = database.prepare('SELECT channelId FROM automod_izinli_kanallar WHERE channelId = ?').get(channelId);
    return !!row;
}

// ============================================================
// OTOMATİK MODERASYON - LOG
// ============================================================

function addAutomodLog(userId, channelId, ruleType, content, action) {
    const database = getDB();
    database.prepare(`
        INSERT INTO automod_logs (userId, channelId, ruleType, content, action, date)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(userId, channelId || '', ruleType, content || '', action || '');
}

function getAutomodLogs(limit = 50) {
    const database = getDB();
    return database.prepare('SELECT * FROM automod_logs ORDER BY date DESC LIMIT ?').all(limit);
}

function getAutomodLogsByUser(userId, limit = 50) {
    const database = getDB();
    return database.prepare('SELECT * FROM automod_logs WHERE userId = ? ORDER BY date DESC LIMIT ?').all(userId, limit);
}

// ============================================================
// RAID EVENT
// ============================================================

function addRaidEvent(katilimciSayisi, aksiyon) {
    const database = getDB();
    database.prepare(`
        INSERT INTO raid_events (katilimciSayisi, aksiyon, tarih)
        VALUES (?, ?, CURRENT_TIMESTAMP)
    `).run(katilimciSayisi || 0, aksiyon || '');
}

function getRaidEvents(limit = 20) {
    const database = getDB();
    return database.prepare('SELECT * FROM raid_events ORDER BY tarih DESC LIMIT ?').all(limit);
}

// ============================================================
// İSTATİSTİK
// ============================================================

function getTopMessageUsers(limit = 10) {
    const database = getDB();
    return database.prepare(`
        SELECT userId, messageCount FROM users 
        WHERE isBot = 0 
        ORDER BY messageCount DESC 
        LIMIT ?
    `).all(limit);
}

function getTopVoiceUsers(limit = 10) {
    const database = getDB();
    return database.prepare(`
        SELECT userId, voiceMinutes FROM users 
        WHERE isBot = 0 
        ORDER BY voiceMinutes DESC 
        LIMIT ?
    `).all(limit);
}

function getTotalUsers() {
    const database = getDB();
    const row = database.prepare('SELECT COUNT(*) as count FROM users WHERE isBot = 0').get();
    return row ? row.count : 0;
}

function getTotalMessages() {
    const database = getDB();
    const row = database.prepare('SELECT COUNT(*) as count FROM messages').get();
    return row ? row.count : 0;
}

function getLogStats() {
    const database = getDB();
    const tables = [
        'users', 'messages', 'commands', 'voice_sessions', 'voice_periods',
        'warns', 'moderation', 'automod_logs', 'raid_events', 'joins_leaves',
        'links', 'files', 'emojis_used', 'mentions', 'mentioned_by',
        'reactions_given', 'reactions_received', 'role_history',
        'nickname_history', 'username_history', 'avatar_history',
        'status_history', 'activity_history', 'error_logs'
    ];
    const stats = {};
    for (const table of tables) {
        try {
            const row = database.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
            stats[table] = row ? row.count : 0;
        } catch (e) {
            stats[table] = 0;
        }
    }
    return stats;
}

// ============================================================
// EXPORT
// ============================================================

module.exports = {
    getDB,
    loadSettings,
    setSetting,
    getSetting,
    getApoCount,
    incrementApoCount,
    ensureUser,
    getUser,
    incrementUserMessages,
    incrementUserVoice,
    addWarn,
    getWarns,
    getWarnCount,
    removeWarn,
    clearWarns,
    addCustody,
    removeCustody,
    getCustodyList,
    isInCustody,
    addModeration,
    addCommandLog,
    addMessageLog,
    searchMessages,
    addVoiceSession,
    addVoicePeriod,
    updateActivity,
    addJoinLeave,
    addNicknameHistory,
    addUsernameHistory,
    addAvatarHistory,
    addStatusHistory,
    addActivityHistory,
    addMention,
    addMentionedBy,
    addReactionGiven,
    addReactionReceived,
    addLink,
    addFile,
    addEmojiUsed,
    addRoleHistory,
    saveInvite,
    addInviteUse,
    getTopInviters,
    addServerStats,
    addErrorLog,
    getAutomodKelimeler,
    addAutomodKelime,
    removeAutomodKelime,
    automodKelimeVarMi,
    getAutomodIzinliKanallar,
    addAutomodIzinliKanal,
    removeAutomodIzinliKanal,
    automodKanalIzinliMi,
    addAutomodLog,
    getAutomodLogs,
    getAutomodLogsByUser,
    addRaidEvent,
    getRaidEvents,
    getTopMessageUsers,
    getTopVoiceUsers,
    getTotalUsers,
    getTotalMessages,
    getLogStats
};
