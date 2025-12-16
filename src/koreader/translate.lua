function translate(text, targetLanguage)
    local url = "https://translate.api.tokisaki.top/translate" -- Cloudflare Worker endpoint
    local headers = {
        ["Content-Type"] = "application/json"
    }
    local body = {
        text = text,
        targetLanguage = targetLanguage
    }

    local response = http.post(url, json.encode(body), headers)
    if response.status == 200 then
        local result = json.decode(response.body)
        return result.translatedText
    else
        return "Translation error: " .. response.body
    end
end