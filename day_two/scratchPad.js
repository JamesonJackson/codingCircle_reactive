import { 
  timer, 
  of, 
  interval, 
} from "rxjs";

import {
  switchMap, 
  take, 
  map, 
  mergeMap, 
  concatMap,
} from "rxjs/operators";

// switchMap
timer(0, 1000).pipe(
  switchMap(()=> timer(0, 500)),
  take(10),
);

// map
timer(0, 1000).pipe(map(x => x*2));

// mergeMap
const letters = of('a', 'b', 'c');
letters.pipe(
  mergeMap(x => interval(1000).pipe(map(i => x+i))),
); 

// concatMap - mock click rather than fromEvent
const clicks = of('clickOne', 'clickTwo', 'clickThree');
clicks.pipe(
  concatMap(ev => interval(1000).pipe(take(4)))
);