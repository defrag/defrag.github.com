---
layout: page
title:  "Leetcode fun with .NET Span. Part II: Reverse Words in a String"
date:   2023-10-02
description:  "Leetcode fun with .NET Span. Part II: Reverse Words in a String"
tags:
    - High Performance
---

In this part of the series, we'll tackle the medium Leetcode problem called **Reverse Words in a String** [https://leetcode.com/problems/reverse-words-in-a-string/](https://leetcode.com/problems/reverse-words-in-a-string/). Like all string manipulation problems, it is a great candidate to ulitize Spans.

## Initial approach

The intuition behind the problem leads us to most straightforward solution using LINQ:
* Split the string by a whitespace
* Trim every element
* Reverse sequence
* Join it at the end

```csharp
public static string ReverseWords(string s)
{
    var rs = s.Split(' ')
        .Select(str => str.Trim())
        .Reverse();
    return string.Join(' ', rs);
}
```

The solution is very readable and it does the job, but let's try to see if we can get some performance improvements and reduced allocations while using Span.

## Optimized approach using Span

The optimized approach requires us to switch the mindset a little bit, since we know we will be working with a contiguous sequence of characters. We can think of the following approach:

* Treat the input string as the source sequence that we will be traversing from the end.
* Allocate a destination sequence that we will be filling from the start whenever we have seen a full word in the source sequence.
* Track the written characters as well as the written characters for every word segment.
* Whenever we encounter the whitespace, we fill the destination Span with accumulated characters and reset the current character counter.
* At the exit of the loop, we write the remaining accumulated word if it exists."


```csharp
public static string ReverseWordsOptimized(string s) 
{
    char[]? rentedBuffer = null;

    ReadOnlySpan<char> source = s.AsSpan();
    Span<char> destination = s.Length > 128
        ? (rentedBuffer = ArrayPool<char>.Shared.Rent(s.Length))
        : stackalloc char[s.Length];
    
    var sourceIx = s.Length - 1;
    var destinationIx = 0;
    var totalWritten = 0;
    var charCount = 0;
    
    void Write(ref Span<char> to, ReadOnlySpan<char> source)
    {
        for (var i = 0; i < source.Length; i++)
        {
            to[destinationIx] = source[i];
            destinationIx++;
            totalWritten++;
        }
    }

    void WriteChar(ref Span<char> to, char c)
    {
        to[destinationIx] = c;
        destinationIx++;
        totalWritten++;
    }
    
    for (var p = s.Length - 1; p >= 0; p--)
    {
        var c = source[p];

        if (c != ' ')
        {
            charCount++; 
        }
        else
        {
            if (charCount == 0)
            {
                sourceIx--;
                continue;
            }
            
            Write(ref destination, source.Slice(sourceIx + 1, charCount));
            WriteChar(ref destination, ' ');
            charCount = 0;
        }
        
        sourceIx--;
    }

    Write(ref destination, source.Slice(sourceIx + 1, charCount));
    
    var result = destination[totalWritten - 1] == ' ' 
        ? new string(destination.Slice(0, totalWritten - 1))
        : new string(destination.Slice(0, totalWritten));

    if (rentedBuffer is not null)
    {
        ArrayPool<char>.Shared.Return(rentedBuffer);
    }

    return result;
}
```

## Benchmark results

![Benchmark results](/assets/images/2023-10-02/reverse_words_benchmark.png)

"Benchmark results on my computer show the performance improvements, as well as up to **7x** less allocated memory for our benchmark test cases.

Our more performant solution is definitely less readable, but as it goes with performance optimizations, we need to make a trade-off and choose the path which we want to pursue."

Hope this was fun!
