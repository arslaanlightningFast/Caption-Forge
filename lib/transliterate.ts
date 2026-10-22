const DEVANAGARI_VOWELS: Record<string, string> = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'अं': 'am', 'अः': 'ah'
}

const DEVANAGARI_MATRAS: Record<string, string> = {
  'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', 'ः': 'h', '्': ''
}

const DEVANAGARI_CONSONANTS: Record<string, string> = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'n',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh',
  'ष': 'sh', 'स': 's', 'ह': 'h', 'क्ष': 'ksh', 'त्र': 'tr', 'ज्ञ': 'gy'
}

const COMMON_HINDI_TO_HINGLISH: Record<string, string> = {
  'सॉफ्टवेयर': 'software',
  'सॉफ्वेयर': 'software',
  'सॉफ़्वेयर': 'software',
  'सोफ्टवेयर': 'software',
  'सॉफ्टवेर': 'software',
  'नहीं': 'nahi',
  'नही': 'nahi',
  'नहि': 'nahi',
  'कि': 'ki',
  'मेरा': 'mera',
  'जो': 'jo',
  'है': 'hai',
  'हैं': 'hain',
  'हूँ': 'hoon',
  'हूं': 'hoon',
  'और': 'aur',
  'से': 'se',
  'में': 'mein',
  'पर': 'par',
  'को': 'ko',
  'का': 'ka',
  'के': 'ke',
  'की': 'ki',
  'यह': 'yeh',
  'वह': 'woh',
  'वो': 'woh',
  'क्या': 'kya',
  'कैसे': 'kaise',
  'क्यों': 'kyun',
  'हाँ': 'haan',
  'था': 'tha',
  'थी': 'thi',
  'थे': 'the',
  'कर': 'kar',
  'रहा': 'raha',
  'रहे': 'rahe',
  'रही': 'rahi',
  'किया': 'kiya',
  'तो': 'toh',
  'भी': 'bhi',
  'ही': 'hi',
  'तुम': 'tum',
  'हम': 'hum',
  'आप': 'aap',
  'ये': 'yeh',
  'इस': 'is',
  'उस': 'us',
  'वीडियो': 'video',
  'विडियो': 'video'
}

export function transliterateToHinglish(text: string): string {
  if (!text) return text
  let result = text

  // 1. Apply exact dictionary mappings first
  for (const [hindi, hinglish] of Object.entries(COMMON_HINDI_TO_HINGLISH)) {
    const regex = new RegExp(hindi, 'g')
    result = result.replace(regex, hinglish)
  }

  // 2. General fallback character-by-character transliteration for any remaining Devanagari text
  let transliterated = ''
  let i = 0
  while (i < result.length) {
    const char = result[i]
    if (DEVANAGARI_CONSONANTS[char]) {
      let cOut = DEVANAGARI_CONSONANTS[char]
      i++
      if (i < result.length && DEVANAGARI_MATRAS[result[i]] !== undefined) {
        cOut += DEVANAGARI_MATRAS[result[i]]
        i++
      } else if (i < result.length && result[i] === '्') {
        i++
        if (i < result.length && DEVANAGARI_CONSONANTS[result[i]]) {
          cOut += DEVANAGARI_CONSONANTS[result[i]]
          i++
        }
      } else {
        cOut += 'a'
      }
      transliterated += cOut
    } else if (DEVANAGARI_VOWELS[char]) {
      transliterated += DEVANAGARI_VOWELS[char]
      i++
    } else if (DEVANAGARI_MATRAS[char]) {
      transliterated += DEVANAGARI_MATRAS[char]
      i++
    } else {
      transliterated += char
      i++
    }
  }

  return transliterated
}
