**Promise**
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


**Observable**
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

If you are worried that lack of chaining makes Observables unusable, remember that there is whole world of so-called operators and operators do support chaining.

If on the other hand verbosity of handling this Subscriptions worries you, there exist operators that let you handle them in nice, declarative matter. As a matter of fact, under the hood every operator handles subscriptions in a smart way for you, making sure you do not subscribe to something you don’t need.