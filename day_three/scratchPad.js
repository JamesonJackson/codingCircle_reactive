import { Observable, asyncScheduler } from 'rxjs';
import { observeOn, subscribeOn } from 'rxjs/operators';
 
const observable = new Observable((observer) => {
  observer.next(1);
  observer.next(2);
  observer.next(3);
  observer.complete();
}).pipe(
  subscribeOn(asyncScheduler)
);
 
console.log('just before subscribe');

const sub = observable.subscribe({
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

sub.unsubscribe()


console.log('just after subscribe');