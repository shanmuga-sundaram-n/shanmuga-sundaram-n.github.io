---
layout: post
title: "Mastering Backpressure in Reactive Programming: A Deep Dive"
date: 2024-12-28 12:00:00 +0000
categories: [engineering, java]
tags: [reactive-programming, backpressure, project-reactor, rxjava, akka, java, streaming]
description: "Backpressure is the fundamental mechanism that keeps reactive systems from collapsing under load. This deep dive covers what it is, why it matters, and how to implement it correctly across Project Reactor, RxJava, and Akka Streams."
image: "/assets/images/blog/backpressure-reactive.webp"
---

![Mastering Backpressure in Reactive Programming](/assets/images/blog/backpressure-reactive.webp)

Reactive programming is good at handling asynchronous data flows. The trouble starts when a producer emits data faster than a consumer can handle it. Left alone, that mismatch leads to memory blow-ups, a thrashing CPU and failures that spread through the system. Backpressure is how you deal with it.

## What backpressure is

It's the consumer's way of telling the producer "slow down, I can't keep up." Instead of quietly dropping messages or falling over, the system applies flow control.

Think of a pipe. If you push water in faster than it drains, something gives. Backpressure is the relief valve.

## What goes wrong without it

- Unbounded buffers grow until you hit an `OutOfMemoryError`.
- The consumer burns CPU working through a huge queue.
- One slow consumer drags down the whole pipeline.
- Messages get dropped and nobody notices.

That last one is the nastiest, because you find out from a customer.

## Four strategies

### Buffering

Hold the extra items in a bounded buffer and push back upstream when it fills up.

```java
// Project Reactor
Flux.range(1, 1000)
    .onBackpressureBuffer(100) // buffer up to 100 items
    .subscribe(item -> process(item));
```

Use it when you can't lose data and the consumer will catch up eventually. Mind the size, because an unbounded buffer isn't protection at all.

### Dropping

Discard items when the consumer falls behind. It's simple, and fine when losing some data doesn't matter.

```java
// RxJava
Flowable.interval(1, TimeUnit.MILLISECONDS)
    .onBackpressureDrop()
    .observeOn(Schedulers.computation())
    .subscribe(item -> slowProcess(item));
```

This suits real-time metrics or sensor readings, where an old value is worthless anyway.

### Throttling

Slow the producer to a rate the consumer can sustain, instead of buffering or dropping.

```java
// Akka Streams
Source.repeat("event")
    .throttle(10, Duration.ofSeconds(1)) // max 10 elements per second
    .runWith(Sink.foreach(System.out::println), system);
```

It works when you control the producer and want a steady flow instead of bursts.

### Requesting (pull-based)

The consumer asks for a specific number of items. This is the most precise option and the foundation of the Reactive Streams specification.

```java
// Project Reactor
Flux.range(1, 1000)
    .limitRate(10) // pull 10 items at a time
    .subscribe(item -> process(item));
```

Use it when you want fine control and know roughly how much the consumer can take.

## The frameworks

| Framework | Default behaviour | Useful APIs |
|-----------|-------------------|-------------|
| Project Reactor | Error on overflow | `onBackpressureBuffer()`, `limitRate()` |
| RxJava | Depends on the type | `onBackpressureDrop()`, `onBackpressureLatest()` |
| Akka Streams | Propagated automatically | `throttle()`, `buffer()` |

All three implement the Reactive Streams specification, which defines backpressure through the `Publisher` and `Subscriber` contract. That's why the ideas carry over from one library to another.

## Some practical advice

1. Match the strategy to how much the data matters. Financial transactions need buffering. Live metrics can usually be dropped.
2. Always bound your buffers.
3. Test with realistic load. These problems rarely show up at development traffic levels.
4. Measure what your consumer can actually handle before tuning anything.
5. Expose queue depth as a metric, so you see pressure building before it becomes an outage.

## Wrapping up

Backpressure is a normal part of any reactive system under real load. The libraries give you the tools, but choosing between buffer, drop, throttle and request comes down to knowing how much your data matters and how your consumer behaves.
