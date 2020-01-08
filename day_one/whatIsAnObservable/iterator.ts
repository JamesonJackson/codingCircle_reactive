export class Iterator {
  cursor: number;
  array: any[];

  constructor(arr: any[]) {
    this.cursor = 0;
    this.array = arr;
  }

  next() {
    while (this.hasNext()) {
      const value = this.array[this.cursor++];
      return value;
    }
  }

  hasNext(): boolean {
    const current = this.cursor;
    while (current < this.array.length) return true;
    return false;
  }
}
