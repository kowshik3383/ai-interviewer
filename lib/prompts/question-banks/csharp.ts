// lib/prompts/question-banks/csharp.ts

export const csharpBank = {
  language: "csharp",
  displayName: "C# (.NET 8 / Modern C#)",
  topics: [
    "properties vs fields, auto-properties, init-only setters, records & value equality",
    "LINQ internals (deferred execution, IEnumerable vs IQueryable, expressions vs delegates)",
    "async/await, Task, ValueTask, ConfigureAwait(false), Deadlocks in synchronization context",
    "delegates, Func, Action, event handlers, memory leaks from undisposed event subscriptions",
    "Garbage Collection in .NET (Gen 0, 1, 2, LOH, POH, IDisposable pattern & Dispose(bool))",
    "interfaces vs abstract classes, default interface methods, explicit interface implementation",
    "nullable reference types (? operator, null-forgiving ! operator, argument null checks)",
    "Span<T>, Memory<T>, stackalloc, ref structs for zero-allocation performance",
  ],
  codingChallenges: {
    junior: {
      title: "LINQ Filtering & Grouping Transformation",
      description: "Given a list of employees with Name, Department, and Salary, write a LINQ query/method chain to group employees by Department, calculate average salary per department, and return departments with avg salary > 75,000 ordered descending.",
      starterCode: `using System;
using System.Collections.Generic;
using System.Linq;

public class Employee {
    public string Name { get; set; } = "";
    public string Department { get; set; } = "";
    public decimal Salary { get; set; }
}

public class Program {
    public static void Main() {
        var employees = new List<Employee> {
            new() { Name = "Alice", Department = "Engineering", Salary = 95000 },
            new() { Name = "Bob", Department = "Engineering", Salary = 85000 },
            new() { Name = "Charlie", Department = "HR", Salary = 60000 },
            new() { Name = "Diana", Department = "Marketing", Salary = 80000 },
            new() { Name = "Evan", Department = "Marketing", Salary = 72000 }
        };

        // Write LINQ query here
        var topDepts = employees
            .GroupBy(e => e.Department)
            .Select(g => new { Dept = g.Key, AvgSalary = g.Average(e => e.Salary) })
            .Where(x => x.AvgSalary > 75000)
            .OrderByDescending(x => x.AvgSalary);

        foreach (var d in topDepts) {
            Console.WriteLine($"{d.Dept}: {d.AvgSalary:C0}");
        }
    }
}
`,
      testCriteria: [
        "Uses GroupBy, Average, Where, and OrderByDescending correctly",
        "Proper decimal salary math and clean formatting",
      ],
    },
    mid: {
      title: "Custom Async Retry Pipeline with CancellationToken",
      description: "Write a generic helper method `Task<T> ExecuteWithRetryAsync<T>(Func<CancellationToken, Task<T>> operation, int maxRetries, TimeSpan initialDelay, CancellationToken ct)` that retries on transient exceptions with exponential backoff and responds immediately to cancellation.",
      starterCode: `using System;
using System.Threading;
using System.Threading.Tasks;

public class RetryHelper {
    public static async Task<T> ExecuteWithRetryAsync<T>(
        Func<CancellationToken, Task<T>> operation,
        int maxRetries = 3,
        TimeSpan? initialDelay = null,
        CancellationToken ct = default
    ) {
        var delay = initialDelay ?? TimeSpan.FromMilliseconds(100);
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            ct.ThrowIfCancellationRequested();
            try {
                return await operation(ct);
            } catch (Exception ex) when (attempt < maxRetries && !ct.IsCancellationRequested) {
                Console.WriteLine($"Attempt {attempt} failed: {ex.Message}. Retrying...");
                await Task.Delay(delay, ct);
                delay *= 2;
            }
        }
        throw new InvalidOperationException("Should not reach here");
    }

    public static async Task Main() {
        int callCount = 0;
        var result = await ExecuteWithRetryAsync(async (token) => {
            callCount++;
            if (callCount < 3) throw new TimeoutException("Network timeout");
            await Task.Yield();
            return "Success on attempt " + callCount;
        });
        Console.WriteLine(result);
    }
}
`,
      testCriteria: [
        "Honors CancellationToken and propagates OperationCanceledException",
        "Applies exponential backoff to delay",
        "Exception filters (catch when) used appropriately",
      ],
    },
    senior: {
      title: "IDisposable / IAsyncDisposable Pattern with Unmanaged Cleanup",
      description: "Implement the complete, canonical .NET Dispose pattern with `IDisposable` and `IAsyncDisposable`, including GC.SuppressFinalize, safe multi-call handling, and thread-safe disposal state tracking.",
      starterCode: `using System;
using System.IO;
using System.Threading.Tasks;

public class ManagedResourceHolder : IDisposable, IAsyncDisposable {
    private Stream? _stream;
    private bool _disposed = false;

    public ManagedResourceHolder(Stream stream) {
        _stream = stream ?? throw new ArgumentNullException(nameof(stream));
    }

    public void DoWork() {
        ObjectDisposedException.ThrowIf(_disposed, this);
        Console.WriteLine("Doing work with stream...");
    }

    protected virtual void Dispose(bool disposing) {
        if (!_disposed) {
            if (disposing) {
                _stream?.Dispose();
                _stream = null;
            }
            _disposed = true;
        }
    }

    public void Dispose() {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    public async ValueTask DisposeAsync() {
        if (!_disposed) {
            if (_stream is not null) {
                await _stream.DisposeAsync();
                _stream = null;
            }
            _disposed = true;
            GC.SuppressFinalize(this);
        }
    }
}
`,
      testCriteria: [
        "Guards against double disposal gracefully",
        "ObjectDisposedException thrown on use after disposal",
        "Proper GC.SuppressFinalize call",
      ],
    },
  },
};
