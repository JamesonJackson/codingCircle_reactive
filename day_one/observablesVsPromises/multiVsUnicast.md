But there is yet another problem with our imaginary, lazy Promise. Even if function passed to constructor was called only when someone called then on a Promise, what would happen if someone else would call then as well, few moments later? Should we call that function again? Or just share results from first call to every user?
Because Promises are eager, they naturally implement second solution — function passed to Promise constructor is called only when Promise is created and never again (unless you create brand new Promise with that function of course). This behavior works well for HTTP requests, where you do not want to double requests, even if many entities expect the results from that request. But consider simple Promise which can be used to defer some action one second:

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
