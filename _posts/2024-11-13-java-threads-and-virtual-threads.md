---
layout: post
title: "Exploring Threads and Virtual Threads in Java: A Comprehensive Guide"
date: 2024-11-13 12:00:00 +0000
categories: [engineering, java]
tags: [java, concurrency, virtual-threads, project-loom, performance]
description: "A deep dive into traditional Java threads vs virtual threads (Project Loom) — how they work internally, when to use each, and why virtual threads are a game changer for I/O-bound applications."
image: "/assets/images/blog/java-virtual-threads.webp"
---

![Java Threads and Virtual Threads](/assets/images/blog/java-virtual-threads.webp)

Java's concurrency model has undergone a significant evolution with the introduction of **virtual threads** in Java 19 (Project Loom). Understanding the difference between traditional threads and virtual threads is key to building scalable, efficient applications.

---

## Traditional Java Threads (Platform Threads)

Traditional threads — also called **platform threads** — are managed by the operating system and map directly to native OS threads.

**Key characteristics:**
- Heavyweight: significant creation and management cost
- Consume OS resources even when blocked on I/O
- Limited scalability due to memory overhead per thread
- Scheduled by the OS, incurring context-switching overhead

**Internal mechanics:**
- Each Java thread maps 1:1 to a kernel-level thread with its own memory stack
- The OS scheduler manages thread switching through context-switching
- Synchronization occurs at the OS level

Thousands of threads quickly become inefficient — memory constraints and context-switching overheads degrade performance significantly.

---

## Virtual Threads (Project Loom)

Introduced in Java 19 and made production-ready in Java 21, **virtual threads** are user-mode threads managed by the JVM rather than the OS.

**Key characteristics:**
- Lightweight and inexpensive to create (millions can run simultaneously)
- Yield control to the JVM when blocking, freeing carrier OS threads for other work
- Managed by the JVM scheduler using a small pool of OS threads
- Cooperative multitasking through yielding

**Internal mechanics:**
- No direct 1:1 mapping to OS threads
- Use continuation-based scheduling backed by **carrier threads**
- Stack frames stored in the Java heap — minimal per-thread overhead
- When a virtual thread blocks (e.g., on I/O), it unmounts from the carrier thread, which immediately picks up another virtual thread

---

## Side-by-Side Comparison

| Aspect | Platform Threads | Virtual Threads |
|--------|-----------------|-----------------|
| Managed by | OS | JVM |
| Cost to create | High | Very low |
| Scalability | Thousands | Millions |
| Blocking behaviour | Blocks OS thread | Unmounts from carrier |
| Memory overhead | Large (OS stack) | Small (heap) |
| Best for | CPU-bound tasks | I/O-bound tasks |

---

## Practical Example: Web Server

Consider a web server handling thousands of concurrent requests.

**With platform threads:** Each request ties up an OS thread while waiting for database queries or network calls. With 10,000 concurrent requests, you need 10,000 OS threads — memory exhaustion becomes a real risk.

**With virtual threads:** Each request gets its own virtual thread. When blocked on I/O, the virtual thread unmounts and the carrier thread immediately handles another request. You can handle 10,000 concurrent requests with just a handful of OS threads.

```java
// Creating a virtual thread (Java 21)
Thread.ofVirtual().start(() -> {
    // handle request — blocking I/O is fine here
    var result = database.query("SELECT ...");
    response.send(result);
});

// Or with ExecutorService
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    executor.submit(() -> handleRequest(request));
}
```

---

## When to Use Each

**Use platform threads when:**
- Your workload is CPU-bound (heavy computation, no blocking)
- You have a small, fixed number of concurrent tasks
- You need precise OS-level thread control

**Use virtual threads when:**
- Your workload is I/O-bound (database, network, file access)
- You need high concurrency (web servers, microservices, messaging)
- You want to simplify code by avoiding reactive/callback patterns

---

## Key Takeaway

Virtual threads don't replace platform threads — they complement them. For the vast majority of server-side Java applications that spend most time waiting on I/O, virtual threads offer a dramatic scalability improvement with minimal code changes. Project Loom effectively brings the simplicity of synchronous code to the scale of asynchronous systems.
