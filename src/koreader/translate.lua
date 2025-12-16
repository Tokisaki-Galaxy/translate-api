-- Drop-in replacement for KOReader's origin_translator
-- Keeps UI/menus intact by delegating to the original module and overriding only the network call.

local Translator = require("koreader.origin_translator")
local JSON = require("json")
local socket = require("socket")
local socketutil = require("socketutil")
local http = require("socket.http")
local ltn12 = require("ltn12")

-- Your custom translation backend (Cloudflare Worker).
local CUSTOM_ENDPOINT = "https://translate.api.tokisaki.top/translate"

function Translator:loadPage(text, target_lang, source_lang)
    -- Build JSON body compatible with the Worker backend
    local payload = {
        text = text,
        targetLanguage = target_lang,
    }
    if source_lang and source_lang ~= "" then
        payload.sourceLanguage = source_lang
    end

    local body = JSON.encode(payload)
    local sink = {}

    socketutil:set_timeout()
    local code, headers, status = socket.skip(1, http.request({
        url = CUSTOM_ENDPOINT,
        method = "POST",
        headers = {
            ["Content-Type"] = "application/json",
            ["Content-Length"] = tostring(#body),
        },
        source = ltn12.source.string(body),
        sink = ltn12.sink.table(sink),
    }))
    socketutil:reset_timeout()

    if headers == nil then
        error(status or code or "network unreachable")
    end

    if code ~= 200 then
        logger.warn("translator HTTP status not okay:", status or code)
        return
    end

    local content = table.concat(sink)
    local ok, result = pcall(JSON.decode, content, JSON.decode.simple)
    if not ok or not result then
        logger.warn("translator decode error:", result)
        return
    end

    local translated = result.translatedText or result.translation or result.output
    if not translated then
        logger.warn("translator missing translated text")
        return
    end

    local detected = result.sourceLanguage or source_lang or "auto"

    -- Shape response like Google's structure so downstream code works:
    -- result[1] = { { translated, original_text } }
    -- result[3] = detected source language
    return {
        { { translated, text } },
        nil,
        detected,
    }
end

return Translator