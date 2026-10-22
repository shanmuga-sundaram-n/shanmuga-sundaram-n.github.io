---
layout: post
title: "Why is Kafka So Fast? Unveiling the Secrets Behind Kafka's Speed"
date: 2024-10-17 12:00:00 +0000
categories: [engineering, distributed-systems]
tags: [kafka, performance, distributed-systems, streaming, backend]
description: "A deep dive into the engineering decisions that make Apache Kafka one of the fastest messaging systems, sequential I/O, zero-copy, batching, compression, and intelligent caching."
image: "/assets/images/blog/kafka-speed.webp"
---

![Why is Kafka So Fast?](/assets/images/blog/kafka-speed.webp)

People often ask me how Kafka pushes millions of messages a second on fairly ordinary hardware. There's no magic in it. It's a handful of design choices that each cut out a bit of overhead, and they add up.

## It only ever appends

Kafka writes to the end of a log file and never goes back to update anything in the middle. That makes disk access sequential, and sequential reads and writes are far faster than random ones. On spinning disks the difference is huge because the head doesn't have to jump around. Even on SSDs it still helps.

Picture thousands of IoT sensors sending readings. Each reading just lands at the tail of the log. Nothing has to be searched for or moved.

## Zero-copy

The usual way to send a file over the network is to read it from disk into kernel memory, copy it into your application's memory, then copy it back into a kernel socket buffer. That's a lot of copying for no good reason.

Kafka uses the `sendfile()` system call on Linux, which tells the kernel to move the data from the disk cache straight to the network socket. The data never enters the JVM. You save CPU cycles and a lot of memory traffic, which matters a great deal when you're serving big batches to many consumers.

## Compression

Producers can compress a whole batch of messages with GZIP, Snappy or LZ4, and consumers decompress it on the other end. The broker generally stores the batch as it arrived.

It pays off most with repetitive data such as application logs or JSON events, where you can shrink the payload a lot. Less data on the wire and less on disk.

## Batching

Kafka doesn't treat messages one at a time. It groups them into batches for both the network and the disk. If you batch 100 metrics together, you do one write and one round trip rather than 100 of each.

Every I/O operation has a fixed cost no matter how small the payload is. Batching spreads that cost over many messages. The trade-off is a little extra latency while a batch fills, which you tune with settings like `linger.ms` and `batch.size`.

## The OS page cache

Kafka doesn't build a large cache of its own inside the JVM. It leans on the operating system's page cache instead. Recently written segments are usually still sitting in memory, so a consumer that is keeping up reads straight from RAM and the disk is barely touched.

This also keeps the heap small, so garbage collection pauses stay out of the way. I think it's one of the smartest choices in the whole design.

## Putting it together

| Technique | What it saves |
|-----------|---------------|
| Sequential I/O | Disk seeks |
| Zero-copy | Extra memory copies and CPU |
| Compression | Bandwidth and storage |
| Batching | Per-message I/O overhead |
| Page cache | Disk reads |

None of these is clever on its own. Kafka is fast because it applies all of them together, and because the log-based design makes each one easy to do.
