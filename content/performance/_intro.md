# React Performance

"There's nothing faster than not doing anything at all." Most React performance work is making React **skip** work it can prove is unnecessary, and React's proof is almost always `Object.is`: the same element, the same props, the same context value. When work can't be skipped, the other options are to make it **interruptible** (concurrent rendering), **load less** of it (code splitting), **move it** off the main thread (Web Workers), or **do less of it** (windowing).

The notes, in the order to read them:

- **Element optimization** and **Optimize context:** skip renders by keeping references stable.
- **Concurrent rendering:** keep typing responsive when a render is slow.
- **Code splitting:** ship a feature's code only when it's used.
- **Expensive calculations:** cache them, or run them in a worker.
- **Optimize rendering:** `memo` on list rows, and what defeats it.
- **Windowing:** render 18 rows instead of 10,000.

Every number here (render lists, render counts, milliseconds to the next frame, rows in the DOM) was recorded by running the product store in Chrome (`examples/product-store/src/lessons/performance`). Timings come from one machine and vary between runs; compare them with each other, not with your own app.

> Measure before and after. The React DevTools Profiler ("Highlight updates when components render") and the browser's Performance panel show where time actually goes, and profile a production build: development React does extra work.
