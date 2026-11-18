export type ActivityType = 'HANDS_ON' | 'MINI_HANDS' | 'LECTURE';

export interface ParsedLectureConfig {
  isHandsOn: boolean;
  type: ActivityType;
  typeLabel: string;
  maxCapacity: number;
  isOpen: boolean;
  cleanDescription: string;
}

const CONFIG_REGEX = /<!--CONFIG:(.*?)-->/;

/**
 * Extracts and parses configuration embedded in a lecture's description or title.
 */
export function parseLectureConfig(lecture: {
  id?: string;
  title: string;
  description: string | null;
}): ParsedLectureConfig {
  const isMini = lecture.title.includes('[MINI-HANDS]') || lecture.title.toLowerCase().includes('mini-hands');
  const isHands = lecture.title.includes('[HANDS-ON]') || lecture.title.toLowerCase().includes('hands-on');
  const isHandsOnActivity = isMini || isHands;

  let maxCapacity = isHandsOnActivity ? 20 : 99999;
  let isOpen = !isHandsOnActivity; // Standard lectures are open by default, hands-on start offline
  let cleanDesc = lecture.description || '';

  if (cleanDesc.includes('<!--CONFIG:')) {
    const match = cleanDesc.match(CONFIG_REGEX);
    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1]);
        if (typeof parsed.maxCapacity === 'number') {
          maxCapacity = parsed.maxCapacity;
        }
        if (typeof parsed.isOpen === 'boolean') {
          isOpen = parsed.isOpen;
        }
      } catch (err) {
        console.warn('Failed to parse lecture config JSON:', err);
      }
    }
    cleanDesc = cleanDesc.replace(CONFIG_REGEX, '').trim();
  }

  const type: ActivityType = isMini ? 'MINI_HANDS' : isHands ? 'HANDS_ON' : 'LECTURE';
  const typeLabel = isMini ? 'Mini-Hands' : isHands ? 'Hands-On' : 'Palestra';

  return {
    isHandsOn: isHandsOnActivity,
    type,
    typeLabel,
    maxCapacity,
    isOpen,
    cleanDescription: cleanDesc,
  };
}

/**
 * Strips configuration comments from lecture descriptions for safe display.
 */
export function cleanLectureDescription(description: string | null): string {
  if (!description) return '';
  return description.replace(CONFIG_REGEX, '').trim();
}

/**
 * Embeds updated configuration JSON into the lecture description.
 */
export function buildDescriptionWithConfig(
  baseDescription: string | null,
  config: { maxCapacity: number; isOpen: boolean }
): string {
  const cleaned = cleanLectureDescription(baseDescription);
  const configString = `<!--CONFIG:${JSON.stringify(config)}-->`;
  return cleaned ? `${cleaned}\n${configString}` : configString;
}
