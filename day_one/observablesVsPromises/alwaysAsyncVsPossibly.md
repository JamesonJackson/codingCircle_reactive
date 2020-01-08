**Promise**

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

---

**Observable**
```
const observable = new Observable((observer) => observer.next(5));
observable.subscribe(value => console.log(value + '!'));
console.log('And now we are here.');
```

This time "5!" appears first and *then* (pun intented) we see "And now we are here...". 

Of course, we could have deferred emitting a value, for example by wrapping observer.next(5) line in setTimeout. So again we see that Observables offer that flexibility. 

But, I would argue that this behavior is dangerous, since `subscribe` does not work predictably, but I will just mention that in RxJS there are ways to enforce listening for events in asynchronous ways.