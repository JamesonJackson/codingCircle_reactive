**Day 1**

<details>
  <summary>What is Reactive Programming?</summary>
  
  Reactive programming focuses on propagating changes without having to explicitly specify how the propagation happens. This allows us to state what our code should do, without having to code every step to do it. This results in a more reliable and maintainable approach to building software. 

  The quintessential example of a reactive system? **Spreadsheets!**
  
  We have all used them, but rarely stop to think how shockingly intuitive they are. 
  
  Let’s say we have a value in cell `A1` of the spreadsheet. We can then reference it in other cells and whenever we change A1, every cell depending on A1 will automatically update its own value.
  
  This behavior feels natural to us. 
  
  We didn’t have to tell the computer to update the cells that depend on `A1` or how to do it (step by step). 
  
  These cells just react to the change. 
  
  In a spreadsheet we simply declare our problem, and we don’t worry about how the computer calculates the results. 
  
  This is what reactive programming is aiming for. To simply declare relationships between entities and for the program to evolve as these entities change.

  To think reactively is to think in terms of transforming sets, transforming one or a few sets of events into the set of events that you actually want.
</details>

---
  
<details>
  <summary>
    What is RxJS?
  </summary>
  A JavaScript implementation of the Reactive Extensions, or Rx. 
  
  [reactivex.io](http://reactivex.io/languages.html)

  Rx is a reactive programming model originally created @ Microsoft that allows developers to easily compose asynchronous streams of data by proving a common interface to combine and transform data from wildly different sources; filesystem operations, user interactions and social network updates etc.
</details>
  
---

<details>
  <summary>What is an Observable?</summary>

  The Observable is central to the Rx pattern and RxJS.

  Observables are lazy collections of multiple values over time.

  The fact that Observables are collections/sets is really what makes them powerful!

  Mathematicians have come up with all these awesome things that we can do with collections/sets<br/>
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

  Push vs Pull is a key thing to understand when using Observables.

  Push and pull are two different ways that describe how a data producer communicates with the data consumer.

  **Pull**

  When pulling, the data consumer decides when it get’s data from the data producer. The producer is unaware of when data will be delivered to the consumer.

  Every JS function uses pull. The function is a Producer of data, and the code that calls the function is consuming it by “pulling” out a single return value from its call.

  **Push**

  When pushing, it works the other way around. 

  The data producer decides when the consumer (the subscriber) gets the data.

  Promises are the most common way of pushing data in JS today. 

  A promise (the producer) delivers a resolved value to registered callbacks (the consumers), but unlike functions, it is the promise which is in charge of determining precisely when that value is *pushed* to the callbacks.

  Observables are a new way of pushing data in JS. An Observable is a Producer of multiple values, *pushing* them to subscribers.	
</details>

---

<details>
  <summary>Why Observables?</summary>

  ### Promises Vs Observables
  
  *Single Vs MultiValue*

  Promises are most commonly used to handle HTTP requests. In this model, you make a request and `then` wait for a single response. 

  You can be sure that there won’t be multiple responses to the same request.

  Why? Because Promises actually enforce this semantic. You can create a Promise, which resolves with some value:

  ```
  const numberPromise = new Promise((resolve) => resolve(5));
  numberPromise.then(value => console.log(value));
  ```

  But attempting to resolve Promise again with another value will fail. Promises are always resolved with the first value passed to the resolve function and then ignore further calls to it:

  ```
  const numberPromise = new Promise((resolve) => {
      resolve(5);
      resolve(10);
  });

  numberPromise.then(value => console.log(value));
  ```

  Observables allow you to resolve (or, as we say, “emit”) multiple values. Here is how it would look:

  ```
  const numberObservable = new Observable((observer) => {
      observer.next(5);
      observer.next(10);
  });

  numberObservable.subscribe(value => console.log(value));
  ```

  Note how similar the syntax is — we switched Promise to Observable, replaced resolve function with observer.next call and instead of then used subscribe, which behaves very similarly.

  This behaviour is actually the biggest selling point of Observables. When you think about what are the sources of asynchrony are in the browser, you quickly realize that single request — single response model only works with simple HTTP requests or setTimeout calls. 

  But there are still:
  * setInterval calls,
  * webSockets,
  * DOM events (mouse clicks etc.),
  * any kind of events, for that matter (also in Node.js).

---
  *Lazy Vs Eager*

  Let’s assume for a second that Promises do support emitting multiple values. Let’s rewrite setInterval example to utilize this imaginary Promise:

  ```
  const secondsPromise = new Promise((resolve) => {       
      let i = 0;
      setInterval(() => {
          resolve(i++);
      }, 1000);
  });
  ```

  We have a problem here. Even though no one is listening for these numbers (we are not even logging them here), setInterval is still called immediately at the moment of Promise creation. We are wasting resources, emitting values that no one will listen to. This happens because Promise constructor immediately calls function passed to it. You can test it very simply with following code:

  ```
  const promise = new Promise(() => console.log('I was called!'));
  ```

  This will print "I was called!" to the console immediately. On the contrary test following, Observable based, code:

  ```
  const observable = new Observable(() => console.log('I was called!'));
  ```

  This time nothing happens. This is because while Promises are eager, Observables are lazy. Function passed to Observable constructor gets called only when someone actually subscribes to an Observable:

  ```
  observable.subscribe();
  ```

  This seems like a small change, but let’s come back to our Observable wrapping setInterval:

  ```
  const secondsObservable = new Observable((observer) => {       
      let i = 0;
      setInterval(() => {
          observer.next(i++);
      }, 1000);
  });
  ```

  Thanks to laziness, setInterval is not called at this point and even i variable is not initiated. The function passed to Observable just waits there until someone actually subscribes to an Observable.

  To drive this point home: initialized Promise represents some process that has already started happening (HTTP request is already sent), and we are just waiting for resulting value. That’s because function starting that process gets called at the moment Promise is created. On the other hand, initialized Observable represents process that might start happening — it will start only when we actually subscribe, potentially saving browser resources from being wasted on work that nobody cares about.

---
  
  *Cancellable Vs Not*

  For the sake of our example, let’s assume that Promises are lazy (just remember, they are not). 

  Imagine that in our Promise based example we call `setInterval` only after someone starts listening for results (by calling `then`). 

  But what about the case when someone stops listening at a certain point? 

  As you probably know, `setInterval` returns token, which can in turn be used with the `clearInterval` method to cancel `setInterval` from continuously calling its callback. 

  We should be able to do this so resources are not wasted when no one is listening.

  But, we can't natively. 

  Some Promise libraries do support this. 
  Bluebird Promises support a cancel method, which you can call on the Promise itself, to stop whatever happens inside it. Let’s see how we would use it, to cancel `setInterval`:

  ```
  const secondsPromise = new Promise((resolve, reject, onCancel) => {
      let i = 0; 
      const token = setInterval(() => resolve(i++), 1000);
      onCancel(() => clearInterval(token));
  });
  ```

  Note how we pass the `onCancel` callback, which will be called when a user decides to cancel a Promise. 

  The cancellation itself looks like this:

  ```
  const logSecondsPromise = secondsPromise.then(value => console.log(value));
  logSecondsPromise.cancel();
  ```

  We have now canceled the Promise which has side effect of logging values to the console.

  Observables support cancellation natively:

  ```
  const secondsObservable = new Observable((observer) => {
      let i = 0;
      const token = setInterval(() => observer.next(i++), 1000);
      return () => clearInterval(token);
  });
  ```

  Not many things changed in constructor, compared to cancellable Promise. 

  Instead of passing function to `onCancel`, we just return it.

  Cancelling (or, as we say, “unsubscribing”) Observable will also look similar:

  ```
  const subscription = secondsObservable.subscribe(value => console.log(value));
  subscription.unsubscribe();
  ```

  It might seem that what is happening here is one-to-one equivalent to our cancellable Promise example — `subscribe` returns Observable, which gets can later be unsubscribed from.

  But as a matter of fact subscribe doesn’t return an Observable. This means you cannot chain several subscribe calls like you would chain `then` calls in Promises. 

  `subscribe` returns a Subscription for given Observable. 

  This Subscription has only one method — unsubscribe — which you can call, when you decide you don’t want to listen to a certain Observable anymore.

  Operators do support chaining.

---

  *Multi Vs Unicast*

  But there is yet another problem with our imaginary, lazy Promise. Even if function passed to constructor was called only when someone called *then* on a Promise, what would happen if someone else calls *then* as well, a few moments later? Should we call that function again? Or just share results from first call to every user?

  Because Promises are eager, they naturally implement the second solution — the function passed to the Promise constructor is called only when Promise is created and never again (unless you create a brand new Promise with that function of course). This behavior works well for HTTP requests where you do not want double requests, even if many entities expect the results from that request. But consider this simple Promise which can be used to defer some action one second:

  ```
  const waitOneSecondPromise = new Promise((resolve) => {
      setTimeout(() => resolve(), 1000);
  });
  ```

  Of course real Promise will start counting immediately, but if it was lazy, it would start counting only when someone would actually use it:

  ```
  waitOneSecondPromise.then(doSomething);
  ```
  Function doSomething would be called after one second of waiting. Everything would be great, unless someone else decided to use the same Promise as well:

  ```
  waitOneSecondPromise.then(doSomething);

  // 500ms passes

  waitOneSecondPromise.then(doSomethingElse);
  ```

  That person would naturally expect doSomethingElse to be called exactly one second from the moment it was passed to then, but in that case it would be called after half a second! Why? Because someone else used it before and when he/she used it, function passed to Promise constructor was called, thus calling setTimeout and starting one second countdown. By the time we call then with second function, timer is already halfway in it’s countdown. Since we share timer between both functions, they will be called at the same moment — second function half a second too fast.
  Let’s modify our Promise by logging something in the function:

  ```
  const waitOneSecondPromise = new Promise((resolve) => {
      console.log('I was called!');
      setTimeout(() => resolve(), 1000);
  });
  ```

  In previous example, even though then was called twice, you would see "I was called!" logged only once to the console, proving that there is only one instance of setTimeout clock.

  In this particular case it would be more handy, if a Promise called function passed to the constructor separately for every user calling then. setTimeout would be then called for every user, ensuring that their callback will be called at exactly the moment they would expect. As a matter of fact, this is what Observable does. Let’s rewrite our Promise to an Observable:

  ```
  const waitOneSecondObservable = new Observable((observer) => {
      console.log('I was called');
      setTimeout(() => observer.next(), 1000);
  });
  ```

  Here every call to subscribe will start it’s own clock:

  ```
  waitOneSecondObservable.subscribe(doSomething);

  // 500 ms

  waitOneSecondObservable.subscribe(doSomethingElse);
  ```

  Both doSomething and doSomethingElse functions will be called one second from the moment they were passed to subscribe. If you look in the console, you will see "I was called!" printed to console twice, which shows that function passed to Observable constructor was indeed called twice and two instances of setTimeout timer were created.

  But, as was mentioned, this is not a behaviour you always want. HTTP requests are great example of action that you want to perform only once and then share results between subscribers. Observables don’t do that by default, but in case of RxJS Observables you can make them do that very easily, by using share operator.

  Let’s assume that in the previous example we actually want to call doSomething and doSomethingElse functions at the same time, no matter when they were passed to subscribe . Here’s what it would look like:

  ```
  const sharedWaitOneSecondObservable = 
      waitOneSecondObservable.share();

  sharedWaitOneSecondObservable.subscribe(doSomething);

  // 500 ms passes

  sharedWaitOneSecondObservable.subscribe(doSomethingElse);
  ```

  If Observable shares a result between many subscribers, we say it is “multicast”, since it casts single value to multiple entities. By default Observables are “unicast”, where every result will be passed to single, unique subscriber.
  We thus see that Observable again win in flexibility: Promises (because of their eager nature) are always “multicast”, while Observable is “unicast” by default, but can be easily turned into a “multicast” Observable, if needed.

---

  *AlwaysAsync vs Possibly*

  ```
  const promise = new Promise((resolve) => resolve(5));
  ```

  Note that within this function we call resolve synchronously. Since we already have the desired value, we immediately resolve a Promise with it. 

  Surely this must mean that when someone calls `then` on that `promise`, the callback func will be called immediately (synchronously) as well, right? 

  Well… no. As a matter of fact, the `Promise` constructor ensures that the callback passed to `then` will always be called asynchronously. 

  It’s easy to see that with following code:

  ```
  promise.then(value => console.log(value + '!'));
  console.log('And now we are here...');
  ```

  First, "And now we are here..." is logged and just then "5!" appears in the console, even though `Promise` was already resolved with that number.


  ```
  const observable = new Observable((observer) => observer.next(5));
  observable.subscribe(value => console.log(value + '!'));
  console.log('And now we are here.');
  ```

  This time "5!" appears first and *then* (pun intented) we see "And now we are here...". 

  Of course, we could have deferred emitting a value, for example by wrapping observer.next(5) line in setTimeout. So again we see that Observables offer that flexibility. 

  But, I would argue that this behavior is dangerous, since `subscribe` does not work predictably, but I will just mention that in RxJS there are ways to enforce listening for events in asynchronous ways.
</details>

---

<details>
  <summary>Creating Observables</summary>
  
  ```
  class SimpleObservable<T> {
    private _subscribe: any;

    constructor(subscribe: Function) {
      this._subscribe = subscribe;
    }

    subscribe(observer: {
      onNext: Function;
      onError?: Function;
      onCompleted?: Function;
    }) {
      return this._subscribe(observer);
    }
  }
  ```

  [homemadeObservable](https://codesandbox.io/s/homemadeobservableunicastdemo-tw668)

  [source code](https://github.com/ReactiveX/rxjs/blob/master/src/internal/Observable.ts)
</details>

---

<details>
  <summary>When to use Observables</summary>
  
  * If your action triggers multiple events — use RxJS
  
  * If you have a lot of asynchrony and you are trying to compose it together — use RxJS
  
  * If you run into situations where you want to update something (or a few things) reactively — use RxJS
  
  * If you are handling huge sets of data in arrays and you need to process the sets of data in steps,  you can use RxJS operators as a sort of transducer where it processes those sets of data without    creating intermediate arrays that then need to be garbage collected later.
</details>  






