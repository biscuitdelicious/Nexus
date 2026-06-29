export const COLORS = {
  bg:        '#050709',   // page background
  surface:   '#161B22',   // cards
  surface2:  '#0D1117',   // tooltip background
  border:    '#1F2933',   // panel borders

  // Text
  text:      '#E6EDF3',   // primary text
  textMuted: '#8B949E',   // labels

  ok:        '#3FB950',   // healthy
  warn:      '#D29922',   // alarm
  critical:  '#F85149',   // incident
  incident:  '#A371F7',   // another color for incident
  info:      '#58A6FF',   // info

  // Only for selected stuff
  accentNeon: '#D4FF00',
};


export const SEVERITY_COLOR = {
  ALARM:    COLORS.warn,
  INCIDENT: COLORS.critical,
  EVENT:    COLORS.textMuted,
  OK:       COLORS.ok,
};
