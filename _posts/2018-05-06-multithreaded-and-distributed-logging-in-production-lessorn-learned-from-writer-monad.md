---
layout: page
title:  "Multithreaded and distributed logging in production - lessons learned from Writer Monad"
date:   2018-05-06
description:  "Multithreaded and distributed logging in production - lessons learned from Writer Monad"
tags:
    - Akka
    - Akka.NET
    - FP
    - Actor model
---

At first sight, logging seems to be a trivial task, but when it comes down to mutlithreaded or distributed applications, things tend to become a mess rather quickly. Lets go through a simple example as see how operating on logs can get tedious.

## Initial implementation

We can start with a simple domain and a single threaded execution model. Let's say our application needs to fetch reports from the third party, slice and dice it and put the information to be read by the people interested in the behavior those reports expose. 
Our logs from the application could look something like this:

```
[Information] Job "daily routine X" started.
[Information] Fetched report "rep_2018_03_20.zip" from third party "X".
[Information] Extracted contents of report "rep_2018_03_20.zip".
[Information] Created 10 batches.
[Information] Inserting 10 batches.
[Information] Job "daily routine X" finished successfully.
```

Very straightforward indeed! Now lets assume our application is growing and we need to start processing more reports at the same time. We can leverage simple actor model and spawn some finite
pool of workers which will do the same in parallel. We realize quickly, that our current logging approach is not well suited for our needs anymore: 
```
[Thread-001][Information] Job "daily routine X" started.
[Thread-001][Information] Fetched report "rep_2018_03_20.zip" from third party "X".
[Thread-002][Information] Job "daily routine Y" started.
[Thread-002][Information] Fetched report "rep_y_2018_03_20.zip" from third party "Y".
[Thread-001][Information] Extracted contents of report "rep_2018_03_20.zip".
[Thread-001][Information] Created 10 batches.
[Thread-001][Information] Inserting 10 batches.
[Thread-002][Information] Extracted contents of report "rep_y_2018_03_20.zip".
[Thread-002][Information] Created 10 batches.
[Thread-002][Information] Inserting 10 batches.
[Thread-001][Information] Job "daily routine X" finished successfully.
[Thread-002][Information] Job "daily routine Y" finished successfully.
```

Not good at all. We've completely lost the ability to track whats going on in our application. First thing that may come to mind is introducing some correlation id to track the logs for a given logs. Lets try it out: 

```
[Thread-001][Information][exec-1saqf] Job "daily routine X" started.
[Thread-001][Information][exec-1saqf] Fetched report "rep_2018_03_20.zip" from third party "X".
[Thread-002][Information][exec-2dznt] Job "daily routine Y" started.
[Thread-002][Information][exec-2dznt] Fetched report "rep_y_2018_03_20.zip" from third party "Y".
[Thread-001][Information][exec-1saqf] Extracted contents of report "rep_2018_03_20.zip".
[Thread-001][Information][exec-1saqf] Created 10 batches.
[Thread-001][Information][exec-1saqf] Inserting 10 batches.
[Thread-002][Information][exec-2dznt] Extracted contents of report "rep_y_2018_03_20.zip".
[Thread-002][Information][exec-2dznt] Created 10 batches.
[Thread-002][Information][exec-2dznt] Inserting 10 batches.
[Thread-001][Information][exec-1saqf] Job "daily routine X" finished successfully.
[Thread-002][Information][exec-2dznt] Job "daily routine Y" finished successfully.
```

For the sake of simplicity, we added just a 5 character random execution identifier. In real world, this identifier would probably be `Guid` or some type of hash. Not lets imagine we would add additional nodes to our processing pool. Logs would grow and ability to track the course of single operation wouldn't be easy at all in my opinion. We need to do better.

## Writer Monad and what we can learn from it

In short, writer monad lets up easly attach any information to the computed result value. It makes functions deterministic and side-effect free. We can describe a sequence of operations that produce a value along with the information about steps being taken to get it. Lets look at the most trivial mutliplication example in `Haskell`:

```haskell
type Result = Writer [String] Int

logNumber :: Int -> Result  
logNumber x = writer (x, ["Got number: " ++ show x])  

multiply :: Int -> Int -> Result 
multiply x y = do  
  a <- logNumber x
  b <- logNumber y
  tell ["multiplying " ++ show a ++ " and " ++ show b ]
  return (a * b)

main :: IO () 
main = do
  print $ runWriter (compute 10 5)
  -- (50,["Got number: 10","Got number: 5","multiplying 10 and 5"])
```

If we took our report example, things may look something like this:
```haskell
fetchReportContents :: ReportType -> IO (ReportContents)
prepareBatches :: ReportContents -> [[Batch]]
writeBatches :: [[Batch]] -> IO()

processReport :: ReportType -> WriterT [String] IO ()
processReport rt = do
  tell ["Preparing to process report"]
  contents <- liftIO $ fetchReportContents rt  
  tell ["Fetching report contents for " ++ show rt]  
  let batches = prepareBatches contents
  tell ["Created batches: " ++ show (length batches)]    
  res <- liftIO $ writeBatches batches
  tell ["Written batches: " ++ show (length batches)]    
  return ()

mainFunc = do
  res <- execWriterT (processReport DailyPerformanceReport)
  print $ res
  -- ["Preparing to process report","Fetching report contents for DailyPerformanceReport","Created batches: 2","Written batches: 2"]
```

We can get away from the examples from Haskell at this moment and even if we don't follow functional approach, we still can structure our object oriented
code to achieve the similar result. Lets take the trivial logging example. The usual OO design could evole as follows:

```csharp
public sealed class LoggingMutlitpier
{
    private readonly ILogger _logger;

    public LoggingMutlitpier(ILogger logger)
    {
        _logger = logger;
    }

    public int Multiply(int a, int b)
    {
        _logger.LogInformation($"Got number: {a}");
        _logger.LogInformation($"Got number: {b}");
        _logger.LogInformation($"Multiplying {a} and {b}");

        return a * b;
    }
}

public sealed class Mutlitpier
{
    public MultiplicationResult Multiply(int a, int b)
    {
        return new MultiplicationResult(a * b, new [] {
            $"Got number: {a}",
            $"Got number: {b}",
            $"Multiplying {a} and {b}"
        });
    }

    public sealed class MultiplicationResult
    {
        public MultiplicationResult(int result, IEnumerable<string> logs)
        {
            Result = result;
            Logs = logs;
        }

        public int Result { get; }
        public IEnumerable<string> Logs { get; }
    }
}

```

Lets modify our application not to log everything right away, rather
compute parts step by step, while attaching information to it. If we use actor model based application, we could
just set up actors to send back the message with results along with the logs and after 
the whole job completes, just forward the full result along with logs to the place which will do the actual logging IO. 
After adjusting the application, our log should look as follows:

```
[Thread-001][Information] Job "daily routine X" started.
[Thread-001][Information] Fetched report "rep_2018_03_20.zip" from third party "X".
[Thread-001][Information] Extracted contents of report "rep_2018_03_20.zip".
[Thread-001][Information] Created 10 batches.
[Thread-001][Information] Inserting 10 batches.
[Thread-001][Information] Job "daily routine X" finished successfully.
[Thread-002][Information] Job "daily routine Y" started.
[Thread-002][Information] Fetched report "rep_y_2018_03_20.zip" from third party "Y".
[Thread-002][Information] Extracted contents of report "rep_y_2018_03_20.zip".
[Thread-002][Information] Created 10 batches.
[Thread-002][Information] Inserting 10 batches.
[Thread-002][Information] Job "daily routine Y" finished successfully.
```

Obviously we lose ability to see realtime logs right away, we have to wait until whole operation is finished. What we gain is the ability to see clearly the traces of all operations step by step. Fits perfecly when using central log aggregation systems like Graylog or Seq.