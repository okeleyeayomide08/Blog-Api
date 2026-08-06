export const generateSlug = (text) => {
  if (!text) return "";

  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Removes punctuation and special characters
    .replace(/[\s_]+/g, "-") // Replaces spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Trims trailing or leading hyphens
};
