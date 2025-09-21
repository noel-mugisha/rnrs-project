export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const generateUniqueSlug = (title: string, id?: string): string => {
  const baseSlug = slugify(title);
  const uniqueId = id ? id.slice(-8) : Date.now().toString().slice(-8);
  return `${baseSlug}-${uniqueId}`;
};