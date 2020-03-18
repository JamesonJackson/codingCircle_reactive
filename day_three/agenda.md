<details>
  <summary>What is a Subject?</summary>
  A special type of Observable that allows values to be multicasted to many Observers. 
  
  Remember: plain Observables are unicast with each subscribed Observer owning an independent execution of the Observable.
</details>

<details>
  <summary>An Observer and an Observable?</summary>

  *Observable*

  Given a Subject, you can subscribe to it and provide an Observer, which will start receiving values normally. 
  
  From the perspective of the Observer, it cannot tell whether the Observable execution is coming from a plain unicast Observable or a Subject.

  Internally, subscribe does not invoke a new execution that delivers values. It simply registers the given Observer in a list of Observers, similarly to how `addListener` usually works in other libraries and languages.

  *Observer*

  A Subject is an object with the methods next(v), error(e), and complete(). To feed a new value to the Subject, just call next(your_value), and it will be multicasted to the Observers registered to listen to the Subject.

  ```
  import { Subject } from 'rxjs';
 
  const subject = new Subject<number>();
 
  subject.subscribe({
    next: (v) => console.log(`observerA: ${v}`)
  });

  subject.subscribe({
    next: (v) => console.log(`observerB: ${v}`)
  });
 
  subject.next(1);
  subject.next(2);
  ```

  ```
  import { Subject, from } from 'rxjs';
  
  const subject = new Subject<number>();
  
  subject.subscribe({
    next: (v) => console.log(`observerA: ${v}`)
  });
  subject.subscribe({
    next: (v) => console.log(`observerB: ${v}`)
  });
  
  const observable = from([1, 2, 3]);
  
  observable.subscribe(subject); // You can subscribe providing a Subject
 
  ```
</details>

<details>
  <summary>Multicasted Observables</summary>

  > "A multicasted Observable uses a Subject under the hood to make multiple Observers see the same Observable execution."

  Under the hood, this is how the multicast operator works: 
  1. Observers subscribe to an underlying Subject
  2. The Subject subscribes to the source Observable. 

  ```
  import { from, Subject } from 'rxjs';
  import { multicast } from 'rxjs/operators';
  
  const source = from([1, 2, 3]);
  const subject = new Subject();
  const multicasted = source.pipe(multicast(subject));
  
  multicasted.subscribe({
    next: (v) => console.log(`observerA: ${v}`)
  });
  multicasted.subscribe({
    next: (v) => console.log(`observerB: ${v}`)
  });
  
  // Under the hood, this is ... `source.subscribe(subject)`:
  multicasted.connect();

  ```

  In the code above
  `multicast` returns an Observable that looks like a normal Observable, but works like a Subject when it comes to subscribing. multicast returns a `ConnectableObservable`, which is simply an Observable with the `connect` method.

  The `connect` method is important to determine exactly when the shared Observable execution will start. Because `connect` does source.subscribe(subject) under the hood, `connect` returns a Subscription, which you can unsubscribe from in order to cancel the shared Observable execution.

  *Reference Counting*

  Calling `connect` manually and handling the Subscription is often cumbersome. Usually, we want to automatically connect when the first Observer arrives, and automatically cancel the shared execution when the last Observer unsubscribes.

  ```
  import { interval, Subject } from 'rxjs';
  import { multicast } from 'rxjs/operators';
  
  const source = interval(500);
  const subject = new Subject();
  const multicasted = source.pipe(multicast(subject));
  let subscription1, subscription2, subscriptionConnect;
  
  subscription1 = multicasted.subscribe({
    next: (v) => console.log(`observerA: ${v}`)
  });
  
  // We should call `connect` here, because the first
  // subscriber to `multicasted` is interested in consuming values
  subscriptionConnect = multicasted.connect();
  
  setTimeout(() => {
    subscription2 = multicasted.subscribe({
      next: (v) => console.log(`observerB: ${v}`)
    });
  }, 600);
  
  setTimeout(() => {
    subscription1.unsubscribe();
  }, 1200);
  
  // We should unsubscribe the shared Observable execution here,
  // because `multicasted` would have no more subscribers after this
  setTimeout(() => {
    subscription2.unsubscribe();
    subscriptionConnect.unsubscribe(); // for the shared Observable execution
  }, 2000);
  ```

  *refCount*

  >refCount makes the multicasted Observable automatically start executing when the first subscriber arrives, and stop executing when the last subscriber leaves.

  ```
  import { interval, Subject } from 'rxjs';
  import { multicast, refCount } from 'rxjs/operators';
  
  const source = interval(500);
  const subject = new Subject();
  const refCounted = source.pipe(multicast(subject), refCount());

  let subscription1, subscription2;
  
  // This calls `connect`, because
  // it is the first subscriber to `refCounted`
  console.log('observerA subscribed');
  subscription1 = refCounted.subscribe({
    next: (v) => console.log(`observerA: ${v}`)
  });
  
  setTimeout(() => {
    console.log('observerB subscribed');
    subscription2 = refCounted.subscribe({
      next: (v) => console.log(`observerB: ${v}`)
    });
  }, 600);
  
  setTimeout(() => {
    console.log('observerA unsubscribed');
    subscription1.unsubscribe();
  }, 1200);
  
  // This is when the shared Observable execution will stop, because
  // `refCounted` would have no more subscribers after this
  setTimeout(() => {
    console.log('observerB unsubscribed');
    subscription2.unsubscribe();
  }, 2000);
  
  ```
</details>


<details>
  <summary>Behavior, Replay, and Async Subjects</summary>

  *BehaviorSubject*

  The BehaviorSubject, which has a notion of "the current value". It stores the latest value emitted to its consumers, and whenever a new Observer subscribes, it will immediately receive the "current value" from the BehaviorSubject.
  
  ```
  import { BehaviorSubject } from 'rxjs';
  const subject = new BehaviorSubject(0); // 0 is the initial value
  
  subject.subscribe({
    next: (v) => console.log(`observerA: ${v}`)
  });
  
  subject.next(1);
  subject.next(2);
  
  subject.subscribe({
    next: (v) => console.log(`observerB: ${v}`)
  });
  
  subject.next(3);
  ```


  *ReplaySubject*

  A ReplaySubject records multiple values from the Observable execution and replays them to new subscribers.

  ```
  import { ReplaySubject } from 'rxjs';
  const subject = new ReplaySubject(3); // buffer 3 values for new subscribers
  
  subject.subscribe({
    next: (v) => console.log(`observerA: ${v}`)
  });
  
  subject.next(1);
  subject.next(2);
  subject.next(3);
  subject.next(4);
  
  subject.subscribe({
    next: (v) => console.log(`observerB: ${v}`)
  });
  
  subject.next(5);
  ```

  You can also specify a window time in milliseconds, besides of the buffer size, to determine how old the recorded values can be. In the following example we use a large buffer size of 100, but a window time parameter of just 500 milliseconds.

  ```
  import { ReplaySubject } from 'rxjs';
  const subject = new ReplaySubject(100, 500 /* windowTime */);
  
  subject.subscribe({
    next: (v) => console.log(`observerA: ${v}`)
  });
  
  let i = 1;
  setInterval(() => subject.next(i++), 200);
  
  setTimeout(() => {
    subject.subscribe({
      next: (v) => console.log(`observerB: ${v}`)
    });
  }, 1000);
  ```

  *AsyncSubject*

  The AsyncSubject is a variant where only the last value of the Observable execution is sent to its observers, and only when the execution completes.

```
  import { AsyncSubject } from 'rxjs';
  const subject = new AsyncSubject();
  
  subject.subscribe({
    next: (v) => console.log(`observerA: ${v}`)
  });
  
  subject.next(1);
  subject.next(2);
  subject.next(3);
  subject.next(4);
  
  subject.subscribe({
    next: (v) => console.log(`observerB: ${v}`)
  });
  
  subject.next(5);
  subject.complete();
```
  >The `AsyncSubject` is similar to the `last` operator, in that it waits for the complete notification in order to deliver a single value.
</details>

<details>
  <summary>Schedulers</summary>

   > rxjs uses the principle of least concurrency as the default scheduling strategy which makes sure that in most cases, we don’t have to think about changing the default.
  
  *What is a scheduler?*

  A scheduler controls when a subscription starts and when notifications are delivered. It consists of three components:

- A Scheduler is a data structure. It knows how to store and queue tasks based on priority or other criteria.
  
- A Scheduler is an execution context. It denotes where and when the task is executed (e.g. immediately, or in another callback mechanism such as setTimeout or process.nextTick, or the animation frame).
  
- A Scheduler has a (virtual) clock. It provides a notion of "time" by a getter method now() on the scheduler. Tasks being scheduled on a particular scheduler will adhere only to the time denoted by that clock.

> A Scheduler lets you define in what execution context will an Observable deliver notifications to its Observer.

```
import { Observable, asyncScheduler } from 'rxjs';
import { observeOn } from 'rxjs/operators';
 
const observable = new Observable((observer) => {
  observer.next(1);
  observer.next(2);
  observer.next(3);
  observer.complete();
}).pipe(
  observeOn(asyncScheduler)
);
 
console.log('just before subscribe');

observable.subscribe({
  next(x) {
    console.log('got value ' + x)
  },
  error(err) {
    console.error('something wrong occurred: ' + err);
  },
  complete() {
     console.log('done');
  }
});

console.log('just after subscribe');
```

*What is happening here?*
`observeOn(asyncScheduler)` introduces a proxy Observer between new Observable and the final Observer. Let's rename some identifiers to make that distinction obvious in the example code:

```
import { Observable, asyncScheduler } from 'rxjs';
import { observeOn } from 'rxjs/operators';
 
const observable = new Observable((proxyObserver) => {
  proxyObserver.next(1);
  proxyObserver.next(2);
  proxyObserver.next(3);
  proxyObserver.complete();
}).pipe(
  observeOn(asyncScheduler)
);
 
const finalObserver = {
  next(x) {
    console.log('got value ' + x)
  },
  error(err) {
    console.error('something wrong occurred: ' + err);
  },
  complete() {
     console.log('done');
  }
};
```

```
const proxyObserver = {
  next(val) {
    asyncScheduler.schedule(
      (x) => finalObserver.next(x),
      0 /* delay */,
      val /* will be the x for the function above */
    );
  },

  // ...
}
```

**IMPORTANT NOTE(S):**
The async Scheduler operates with a setTimeout or setInterval, even if the given delay was zero.

>The `schedule` method of a Scheduler takes a delay argument, which refers to a quantity of time relative to the Scheduler's own internal clock. A Scheduler's clock need not have any relation to the actual wall-clock time. This is how temporal operators like delay operate not on actual time, but on time dictated by the Scheduler's clock. This is specially useful in testing, where a virtual time Scheduler may be used to fake wall-clock time while in reality executing scheduled tasks synchronously.


*Types of schedulers*

- null:By not passing any scheduler, notifications are delivered synchronously and recursively. Use this for constant-time operations or tail recursive operations.

- queueScheduler:Schedules on a queue in the current event frame (trampoline scheduler). Use this for iteration operations.

- asapScheduler:Schedules on the micro task queue, which is the same queue used for promises. Basically after the current job, but before the next job. Use this for asynchronous conversions.

- asyncScheduler:	Schedules work with setInterval. Use this for time-based operations.

- animationFrameScheduler:Schedules task that will happen just before next browser content repaint. Can be used to create smooth browser animations.

*Using schedulers*

The following static creation operators take a Scheduler argument:

`bindCallback`

`bindNodeCallback`

`combineLatest`

`concat`

`empty`

`from`

`fromPromise`

`interval`

`merge`

`of`

`range`

`throw`

`timer`

Use `subscribeOn` to schedule in what context will the subscribe() call happen. By default, a subscribe() call on an Observable will happen synchronously and immediately. However, you may delay or schedule the actual subscription to happen on a given Scheduler.

Use `observeOn` to schedule in what context will notifications be delivered. As we saw in the examples above, instance operator observeOn(scheduler) introduces a mediator Observer between the source Observable and the destination Observer, where the mediator schedules calls to the destination Observer using your given scheduler.

</details>