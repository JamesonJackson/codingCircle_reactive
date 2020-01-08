**Promises**
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

___

**Observables**

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

*All of these can be handled by Observables(see the trivial example using setInterval)*

