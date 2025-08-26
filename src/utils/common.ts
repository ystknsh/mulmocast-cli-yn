export const beatId = (id: string | undefined, index: number) => {
  const key = id ?? `__index__${index}`;
  return key;
};
