export function encodeMessage(message) {
    return JSON.stringify(message);
}
export function decodeMessage(raw) {
    try {
        const parsed = JSON.parse(raw);
        const validTypes = ['input', 'snapshot', 'welcome', 'ping', 'pong', 'shoot', 'hit_confirmed'];
        if (parsed.type && validTypes.includes(parsed.type)) {
            return parsed;
        }
        return null;
    }
    catch {
        return null;
    }
}
