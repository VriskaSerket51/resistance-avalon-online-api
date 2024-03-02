import { Roles } from "@/lib/consts";

export function shuffle(array: Array<unknown>) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export function getRoleById(id: number) {
  for (const role of Object.values(Roles)) {
    if (role.id == id) {
      return role;
    }
  }
  return null;
}

export function range(end: number) {
  return [...Array(end)].map((_, i) => {
    return i;
  });
}
