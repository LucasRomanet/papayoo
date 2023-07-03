const MIN_NAME_LENGTH = 1;
const MAX_NAME_LENGTH = 32;

const TAG_MIN = 1;
const TAG_MAX = 9999;
const TAG_DIGITS = 4;

const MIN_PLAYER_TO_START = process.env.NODE_ENV === 'development' ? 1 : 3;

module.exports = { MIN_NAME_LENGTH, MAX_NAME_LENGTH, TAG_MIN, TAG_MAX, TAG_DIGITS, MIN_PLAYER_TO_START }