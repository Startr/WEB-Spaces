/**
 * Schedule-checking utilities for room open/close times.
 * No external dependencies — uses Intl.DateTimeFormat for timezone support.
 */

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * Get the current day name and HH:MM time in the given IANA timezone.
 * Falls back to UTC on invalid timezone string.
 */
export function getNowInTimezone(tz) {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      weekday: 'long',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const parts = {};
    formatter.formatToParts(now).forEach(({ type, value }) => {
      parts[type] = value;
    });
    return {
      day: parts.weekday.toLowerCase(),
      time: `${parts.hour.padStart(2, '0')}:${parts.minute.padStart(2, '0')}`,
      date: `${parts.year}-${parts.month}-${parts.day}`,
      dayIndex: DAYS.indexOf(parts.weekday.toLowerCase()),
      timestamp: now,
    };
  } catch {
    // Invalid timezone — fall back to UTC
    return getNowInTimezone('UTC');
  }
}

/**
 * Parse "HH:MM" into total minutes since midnight.
 */
function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Check if a time string (HH:MM) falls within an open/close window.
 */
function isTimeInRange(currentTime, open, close) {
  const now = timeToMinutes(currentTime);
  const start = timeToMinutes(open);
  const end = timeToMinutes(close);
  return now >= start && now < end;
}

/**
 * Check whether a room's schedule indicates it is currently open,
 * and find the next upcoming opening.
 *
 * @param {Object} schedule - The room's schedule object
 * @returns {{ isOpen: boolean, nextOpen: { label: string, time: string, minutesUntil: number } | null }}
 */
export function checkSchedule(schedule) {
  if (!schedule) {
    return { isOpen: true, nextOpen: null };
  }

  const tz = schedule.timezone || 'UTC';
  const now = getNowInTimezone(tz);

  let isOpen = false;

  // Check recurring slots
  if (schedule.recurring) {
    for (const slot of schedule.recurring) {
      if (slot.day.toLowerCase() === now.day && isTimeInRange(now.time, slot.open, slot.close)) {
        isOpen = true;
        break;
      }
    }
  }

  // Check event slots
  if (!isOpen && schedule.events) {
    for (const slot of schedule.events) {
      if (slot.date === now.date && isTimeInRange(now.time, slot.open, slot.close)) {
        isOpen = true;
        break;
      }
    }
  }

  const nextOpen = isOpen ? null : findNextOpen(schedule, now);

  return { isOpen, nextOpen };
}

/**
 * Find the next upcoming open slot from now.
 * Searches events first (date-specific), then recurring (within 7 days).
 *
 * @param {Object} schedule
 * @param {Object} now - Result of getNowInTimezone
 * @returns {{ label: string, time: string, minutesUntil: number } | null}
 */
export function findNextOpen(schedule, now) {
  const candidates = [];
  const nowMinutes = timeToMinutes(now.time);

  // Check event slots
  if (schedule.events) {
    for (const slot of schedule.events) {
      const slotOpenMinutes = timeToMinutes(slot.open);
      if (slot.date === now.date && slotOpenMinutes > nowMinutes) {
        // Today, later
        candidates.push({
          label: `Today`,
          time: formatTime(slot.open),
          minutesUntil: slotOpenMinutes - nowMinutes,
        });
      } else if (slot.date > now.date) {
        // Future date
        const daysAway = Math.round(
          (new Date(slot.date + 'T00:00:00') - new Date(now.date + 'T00:00:00')) / 86400000
        );
        const minutesUntil = daysAway * 1440 + slotOpenMinutes - nowMinutes;
        const dateObj = new Date(slot.date + 'T12:00:00');
        const dayName = DAYS[dateObj.getDay()];
        const label = capitalize(dayName) + ', ' + slot.date;
        candidates.push({
          label,
          time: formatTime(slot.open),
          minutesUntil,
        });
      }
    }
  }

  // Check recurring slots (within next 7 days)
  if (schedule.recurring) {
    for (const slot of schedule.recurring) {
      const slotDayIndex = DAYS.indexOf(slot.day.toLowerCase());
      if (slotDayIndex === -1) continue;

      const slotOpenMinutes = timeToMinutes(slot.open);
      let daysAway = slotDayIndex - now.dayIndex;

      if (daysAway < 0) daysAway += 7;
      if (daysAway === 0 && slotOpenMinutes <= nowMinutes) daysAway = 7;

      const minutesUntil = daysAway * 1440 + slotOpenMinutes - nowMinutes;
      const label = daysAway === 0 ? 'Today' : capitalize(slot.day);

      candidates.push({
        label,
        time: formatTime(slot.open),
        minutesUntil,
      });
    }
  }

  if (candidates.length === 0) return null;

  // Return the soonest
  candidates.sort((a, b) => a.minutesUntil - b.minutesUntil);
  return candidates[0];
}

/**
 * Format a minutes-until value into a human-readable countdown.
 * @param {number} minutes
 * @returns {string}
 */
export function formatCountdown(minutes) {
  if (minutes <= 0) return 'Now';
  if (minutes < 60) return `${Math.floor(minutes)}m`;
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/**
 * Format "HH:MM" (24h) to "H:MM AM/PM".
 * @param {string} timeStr - e.g. "13:00"
 * @returns {string} - e.g. "1:00 PM"
 */
export function formatTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
