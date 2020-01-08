interface IListener {
  onNext: Function;
  onError: Function;
  onComplete: Function;
}

export class Subject {
  private listeners: IListener[];

  constructor() {
    this.listeners = [];
  }

  add(listener: IListener): void {
    this.listeners.push(listener);
  }

  remove(listener: IListener): void {
    const index = this.listeners.indexOf(listener);
    this.listeners.splice(index, 1);
  }

  notify(evt: any): void {
    this.listeners.forEach(listener => listener.onNext(evt));
  }
}