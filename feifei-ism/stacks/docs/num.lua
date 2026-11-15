local TRIM = { ["."] = true, [","] = true, [":"] = true, ["-"] = true, ["/"] = true }

local function num(text)
  return pandoc.Span({ pandoc.Str(text) }, pandoc.Attr("", { "num" }, { ["custom-style"] = "Num" }))
end

local function split(s)
  local out, i = {}, 1
  while true do
    local a, b = s:find("%d[%d%.,:%%/%-]*", i)
    if not a then break end
    while b > a and TRIM[s:sub(b, b)] do b = b - 1 end
    if a > i then table.insert(out, pandoc.Str(s:sub(i, a - 1))) end
    table.insert(out, num(s:sub(a, b)))
    i = b + 1
  end
  if i <= #s then table.insert(out, pandoc.Str(s:sub(i))) end
  return out
end

return {
  traverse = "topdown",
  Header = function(h) return h, false end,
  Link = function(l) return l, false end,
  Code = function(c) return c, false end,
  Span = function(s)
    if s.classes:includes("num") then return s, false end
  end,
  Str = function(el)
    if not el.text:find("%d") then return nil end
    return split(el.text), false
  end,
}
