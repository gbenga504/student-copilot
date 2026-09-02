export function omit<T extends object, K extends keyof T>(
  obj: T,
  paths: K[],
): Omit<T, K> {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !paths.includes(key as K)),
  ) as Omit<T, K>;
}

export function pick<T extends object, K extends keyof T>(
  obj: T,
  paths: K[],
): Pick<T, K> {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => paths.includes(key as K)),
  ) as Pick<T, K>;
}

export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
