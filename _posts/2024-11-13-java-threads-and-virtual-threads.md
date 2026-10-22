---
layout: post
title: "Exploring Threads and Virtual Threads in Java: A Comprehensive Guide"
date: 2024-11-13 12:00:00 +0000
categories: [engineering, java]
tags: [java, concurrency, virtual-threads, project-loom, performance]
description: "A deep dive into traditional Java threads vs virtual threads (Project Loom), how they work internally, when to use each, and why virtual threads are a game changer for I/O-bound applications."
image: "/assets/images/blog/java-virtual-threads.webp"
---

![Java Threads and Virtual Threads](/assets/images/blog/java-virtual-threads.webp)

Virtual threads arrived as a preview in Java 19 (Project Loom) and became final in Java 21. They're the biggest change to Java concurrency in a long time, so here is how I think about them next to the threads we've always had.

## Platform threads

A regular Java thread is a thin wrapper over an operating system thread. One Java thread maps to one kernel thread, each with its own stack, and the OS decides when it runs.

That's fine until you have a lot of them. Each thread costs a good chunk of memory, and the OS spends time switching between them. If a thread is blocked waiting for a database or an HTTP call, it still holds all of that. A few thousand threads is about where things start to hurt.

## Virtual threads

A virtual thread is scheduled by the JVM, not the OS. The JVM runs them on a small pool of carrier threads, which are ordinary platform threads. Their stacks live on the heap and grow only as needed, so they're cheap. You can have millions.

The important part is what happens on a blocking call. When a virtual thread waits on I/O, it unmounts from its carrier, and that carrier immediately picks up another virtual thread. When the I/O completes, the virtual thread is mounted again, maybe on a different carrier, and carries on.

| | Platform threads | Virtual threads |
|---|---|---|
| Scheduled by | OS | JVM |
| Cost to create | High | Very low |
| Practical limit | Thousands | Millions |
| When blocked | Holds an OS thread | Frees the carrier |
| Stack memory | Large, fixed | Small, on the heap |
| Good for | CPU-bound work | I/O-bound work |

## A web server example

Say you handle 10,000 concurrent requests and each one spends most of its time waiting on a database.

With platform threads you need something like 10,000 OS threads, or a thread pool plus a queue and a lot of tuning. With virtual threads, each request gets its own thread and you write plain blocking code. The carriers stay busy because blocked requests step aside.

```java
// One virtual thread
Thread.ofVirtual().start(() -> {
    var result = database.query("SELECT ...");
    response.send(result);
});

// Or an executor that creates one per task
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    executor.submit(() -> handleRequest(request));
}
```

This is the part I like most. You get the scalability people used to need reactive code for, and your code still reads top to bottom.

## When I'd use which

Stay with platform threads for CPU-heavy work. If the task is crunching numbers and never waits, virtual threads add nothing, because you're limited by cores anyway. They also make sense when you need tight control over thread behaviour.

Reach for virtual threads when the work is mostly waiting: database calls, HTTP calls, file access. Web servers and microservices are the obvious fit.

Two things to watch for. Don't pool virtual threads, since they're meant to be created freely. And in Java 21, blocking inside a `synchronized` block pins the virtual thread to its carrier, which can hurt throughput. Newer JDK releases have been improving this, but it's worth checking on the version you run.

## Summary

Virtual threads don't replace platform threads. They cover the large class of server code that mostly waits on I/O, and they let you write it in the simple blocking style while still scaling.
