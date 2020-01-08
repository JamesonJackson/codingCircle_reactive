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