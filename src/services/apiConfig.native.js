export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// Default to mock on mobile until backend is wired up.
export const USE_MOCK_API = process.env.EXPO_PUBLIC_USE_MOCK_API !== 'false';
