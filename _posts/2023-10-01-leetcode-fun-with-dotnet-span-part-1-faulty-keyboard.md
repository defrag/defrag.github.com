---
layout: page
title:  "Leetcode fun with .NET Span. Part I: Faulty Keyboard"
date:   2023-10-01
description:  "Leetcode fun with .NET Span. Part I: Faulty Keyboard"
tags:
    - High Performance
---

Quite a while ago I was going through some Leetcode exercises and thought it would be nice to see how I could leverage most recent .NET features in order to improve performance and limit the number of allocations.

First example came to my mind after going through easy Faulty Keyboard exercise: [https://leetcode.com/problems/faulty-keyboard/](https://leetcode.com/problems/faulty-keyboard/).

## Naive approach

Initial run at the problem seems pretty easy. We accumulate the string one by one and every time we encounter the 'i' character, we just reverse the whole accumulated state so far using built-in capabilities:

```csharp
public string FaultyKeyboard(string s) 
{
    var acc = "";
    var ix = 0;
    for (var i = 0; i < s.Length; i++) 
    {
        if (s[i] == 'i') 
        {
            acc = string.Join("",acc.Reverse());
        } 
        else 
        {
            acc += s[i];
        }
        ix++;
    }

    return acc;
}
```

It works well, although we do repeat allocations for string inside `acc += s[i];` block, as well as new string and an array inside of `string.Join("", acc.Reverse());` block.

## Optimized approach using Span

As an exercise for using Span, I reworked the approach to eliminate unnecessary allocations by following the algorithm:

* Try allocating contiguous memory on the stack.
* If the string is too large, use a shared buffer in order to limit array allocations.
* At every loop, if the character is not 'i', fill the block with that character.
* If the encountered character is 'i', then reverse the whole span content in place.


```csharp
public static string FaultyKeyboardSpan(string s)
{
    char[]? rentedBuffer = null;
    
    Span<char> acc = s.Length > 128
        ? (rentedBuffer = ArrayPool<char>.Shared.Rent(s.Length))
        : stackalloc char[s.Length];

    void Reverse(ref Span<char> input, int from, int to)
    {
        while (from < to)
        {
            (input[from], input[to]) = (input[to], input[from]); 
            from++;
            to--;
        }
    }
    
    var ix = 0;
    for (var i = 0; i < s.Length; i++) 
    {
        if (s[i] != 'i') 
        {
            acc[ix] = s[i];
            ix++;
        } 
        else 
        {
            Reverse(ref acc, 0, ix - 1);
        }
    }

    var slice = acc.Slice(0, ix);
    
    if (rentedBuffer is not null)
    {
        ArrayPool<char>.Shared.Return(rentedBuffer);
    }

    return new string(slice);
}
```

## Benchmark results

The results of the benchmarks show speed improvements of up to **16x** as well as reduction of allocations up to **17x**.


![Benchmark results](/assets/images/2023-10-01/faulty_keyboard_span.jpeg)

The latest progress of .NET team around performance improvements is nothing shy of impressive. We can adopt a fresh perspective when approaching problems, ultimately leading to notable gains in speed and a reduced memory footprint. 

In part two, we'll tackle more complex problem. Stay tuned!