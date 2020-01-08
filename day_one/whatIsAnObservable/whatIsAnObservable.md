<details>

<summary>What is an Observable?</summary>

The Observable is central to the Rx pattern and RxJS.

Observables are lazy collections (sets) of multiple values over time.

The fact that Observables are sets is really what makes them powerful!

In category theory and functional programming we hear terms like monad, monoid, etc. (Mostly when people are just trying to sound smart). But, both of these are just sets with certain props/methods.

Brilliant mathematicians have come up with all these awesome things that we can do with sets
  * map
  * filter
  * combine
  * flatten
  * etc

Based on two patterns:

**Iterator**

```
class Iterator {
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

```

**Observer**

```
interface IListener {
  onNext: Function;
  onError: Function;
  onComplete: Function;
}

class Subject {
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
```

An Observable emits its values in order — like an iterator — but instead of its consumers requesting the next value, the Observable *pushes* values to consumers as they become available. 

It has a similar role to the Producer’s in the Observer pattern: emitting values and pushing them to its listeners.

Push vs Pull is a key thing to understand when using observables.

Push and pull are two different ways that describe how a data producer communicates with the data consumer.

**Pull**

When pulling, the data consumer decides when it get’s data from the data producer. The producer is unaware of when data will be delivered to the consumer.

Every javascript function uses the pull. The function is a Producer of data, and the code that calls the function is consuming it by “pulling” out a single return value from its call.

**Push**

When pushing, it works the other way around. 

The data producer decides when the consumer (the subscriber) gets the data.

Promises are the most common way of push in JavaScript today. 

A promise (the producer) delivers a resolved value to registered callbacks (the consumers), but unlike functions, it is the promise which is in charge of determining precisely when that value is *pushed* to the callbacks.

Observables are a new way of pushing data in JavaScript. An observable is a Producer of multiple values, *pushing* them to subscribers.	

</details>



