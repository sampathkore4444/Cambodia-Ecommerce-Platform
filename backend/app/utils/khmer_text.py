from __future__ import annotations

import re
import unicodedata


_KHMER_MAP = {
    "\u1780": "k", "\u1781": "kh", "\u1782": "ko", "\u1783": "kh",
    "\u1784": "ng", "\u1785": "ch", "\u1786": "chh", "\u1787": "j",
    "\u1788": "jh", "\u1789": "ny", "\u178a": "d", "\u178b": "t",
    "\u178c": "th", "\u178d": "t", "\u178e": "n", "\u178f": "ta",
    "\u1790": "tha", "\u1791": "t", "\u1792": "t", "\u1793": "n",
    "\u1794": "b", "\u1795": "p", "\u1796": "ph", "\u1797": "f",
    "\u1798": "m", "\u1799": "y", "\u179a": "r", "\u179b": "l",
    "\u179c": "v", "\u179d": "s", "\u179e": "h", "\u179f": "l",
    "\u17a0": "a", "\u17a1": "q", "\u17a2": "a",
    "\u17a3": "ka", "\u17a4": "kha", "\u17a5": "ko", "\u17a6": "kho",
    "\u17a7": "kh", "\u17a8": "kh", "\u17a9": "kh",
    "\u17aa": "n", "\u17ab": "da", "\u17ac": "do", "\u17ad": "da",
    "\u17ae": "da", "\u17af": "da", "\u17b0": "ta", "\u17b1": "tha",
    "\u17b2": "do", "\u17b3": "ta", "\u17b4": "aa", "\u17b5": "aa",
    "\u17b6": "a", "\u17b7": "i", "\u17b8": "i", "\u17b9": "ei",
    "\u17ba": "ae", "\u17bb": "aa", "\u17bc": "a", "\u17bd": "ao",
    "\u17be": "au", "\u17bf": "a", "\u17c0": "ae", "\u17c1": "e",
    "\u17c2": "ae", "\u17c3": "a", "\u17c4": "ao", "\u17c5": "o",
    "\u17c6": "", "\u17c7": "", "\u17c8": "",
    "\u17cb": "", "\u17cc": "", "\u17cd": "",
    "\u17ce": "", "\u17cf": "", "\u17d0": "",
    "\u17d1": "", "\u17d2": "", "\u17d3": "",
    "\u17d4": ".", "\u17d5": ", ", "\u17d6": " ",
    "\u17d7": "", "\u17d8": "&", "\u17d9": "*",
    "\u17da": "^", "\u17db": "$", "\u17dc": "@",
    "\u17dd": "", "\u17de": "", "\u17df": "",
    "\u17e0": "0", "\u17e1": "1", "\u17e2": "2", "\u17e3": "3",
    "\u17e4": "4", "\u17e5": "5", "\u17e6": "6", "\u17e7": "7",
    "\u17e8": "8", "\u17e9": "9",
}


def transliterate_to_english(khmer_text: str) -> str:
    result = []
    for char in khmer_text:
        if char in _KHMER_MAP:
            result.append(_KHMER_MAP[char])
        elif ord(char) >= 0x1780 and ord(char) <= 0x17FF:
            result.append("?")
        else:
            result.append(char)
    return "".join(result).strip()


def contains_khmer(text: str) -> bool:
    for char in text:
        code = ord(char)
        if 0x1780 <= code <= 0x17FF:
            return True
    return False


def normalize_khmer(text: str) -> str:
    text = re.sub(r"[\u200b\u200c\u200d\ufeff]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def search_query_build(query: str) -> str:
    query = query.strip()
    if not query:
        return ""

    if contains_khmer(query):
        romanized = transliterate_to_english(query)
        normalized_khmer = normalize_khmer(query)
        combined = f"{normalized_khmer} {romanized}".strip()
        return combined

    return query.lower()
