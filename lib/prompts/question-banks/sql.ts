// lib/prompts/question-banks/sql.ts

export const sqlBank = {
  language: "sql",
  displayName: "SQL (PostgreSQL / ANSI SQL)",
  topics: [
    "joins (INNER, LEFT, RIGHT, FULL OUTER, CROSS JOIN, self-joins, anti-joins with NOT EXISTS vs NOT IN)",
    "indexing (B-Tree, Hash, GIN, GiST, composite index column order leftmost-prefix rule, index selectivity)",
    "normalization & denormalization (1NF, 2NF, 3NF, BCNF, trade-offs between read latency vs write anomaly)",
    "window functions (ROW_NUMBER(), RANK(), DENSE_RANK(), LAG(), LEAD(), NTILE(), OVER (PARTITION BY ... ORDER BY ...))",
    "transactions & ACID properties (Isolation levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable; dirty reads, non-repeatable reads, phantom reads)",
    "query optimization & EXPLAIN ANALYZE (Seq Scan vs Index Scan vs Index Only Scan, cost estimation, temp table spills)",
    "subqueries vs CTEs (Common Table Expressions, recursive CTEs for hierarchical tree structures)",
    "aggregations & grouping (GROUP BY, HAVING, GROUPING SETS, ROLLUP, CUBE)",
  ],
  codingChallenges: {
    junior: {
      title: "Second Highest Salary & Customer Order Totals",
      description: "Write a SQL query to find the 2nd highest salary from an `Employee` table (or NULL if only 1 distinct salary exists), and a query finding total spend per customer with customers having total spend > $1000.",
      starterCode: `-- Given table: Employee (id INT, salary INT)
-- Query 1: Find the 2nd highest distinct salary (returns NULL if not found)
SELECT (
    SELECT DISTINCT salary 
    FROM Employee 
    ORDER BY salary DESC 
    LIMIT 1 OFFSET 1
) AS SecondHighestSalary;

-- Given tables: Customers (id, name), Orders (id, customer_id, amount)
-- Query 2: Find total spent by each customer where total > 1000
SELECT 
    c.id,
    c.name,
    SUM(o.amount) AS total_spent
FROM Customers c
JOIN Orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
HAVING SUM(o.amount) > 1000
ORDER BY total_spent DESC;
`,
      testCriteria: [
        "Handles edge cases where all salaries are identical or fewer than 2 exist",
        "Uses HAVING for aggregate filtering and GROUP BY on all non-aggregated select columns",
      ],
    },
    mid: {
      title: "Consecutive Active Days & Running Sales Totals via Window Functions",
      description: "Write a SQL query utilizing `LAG()` or `ROW_NUMBER()` window functions to find all users who logged in for at least 3 consecutive days, and calculate the 7-day rolling average revenue per day.",
      starterCode: `-- Given: Logins (user_id INT, login_date DATE)
-- Find users with at least 3 consecutive login days
WITH DistinctLogins AS (
    SELECT DISTINCT user_id, login_date
    FROM Logins
),
GroupedLogins AS (
    SELECT 
        user_id,
        login_date,
        login_date - (ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date))::INT AS grp
    FROM DistinctLogins
)
SELECT DISTINCT user_id
FROM GroupedLogins
GROUP BY user_id, grp
HAVING COUNT(*) >= 3;

-- Rolling 7-day average revenue
-- Given: DailyRevenue (date DATE, amount NUMERIC)
SELECT 
    date,
    amount,
    AVG(amount) OVER (
        ORDER BY date 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS rolling_7d_avg
FROM DailyRevenue;
`,
      testCriteria: [
        "Applies window functions OVER (PARTITION BY ... ORDER BY ... ROWS BETWEEN ...)",
        "Handles duplicate same-day logins before consecutive streak calculation",
      ],
    },
    senior: {
      title: "Recursive CTE for Organizational Hierarchy & High-Throughput Locking",
      description: "Write a recursive Common Table Expression (CTE) to find the entire reporting hierarchy under a manager, including their depth/level in the tree, plus write a query using `FOR UPDATE SKIP LOCKED` for a queue worker pattern.",
      starterCode: `-- Table: Employees (id INT, name VARCHAR, manager_id INT)
-- Write recursive CTE to find all subordinates under manager with id = 10
WITH RECURSIVE Subtree AS (
    -- Anchor member
    SELECT id, name, manager_id, 1 AS depth
    FROM Employees
    WHERE id = 10

    UNION ALL

    -- Recursive member
    SELECT e.id, e.name, e.manager_id, s.depth + 1
    FROM Employees e
    JOIN Subtree s ON e.manager_id = s.id
)
SELECT * FROM Subtree ORDER BY depth, name;

-- High concurrency task queue worker
-- Fetch 5 unassigned tasks without deadlocks
SELECT * 
FROM TaskQueue
WHERE status = 'pending'
ORDER BY priority DESC, created_at ASC
LIMIT 5
FOR UPDATE SKIP LOCKED;
`,
      testCriteria: [
        "Recursive CTE structured with proper anchor, UNION ALL, and termination join",
        "Uses FOR UPDATE SKIP LOCKED correctly for non-blocking concurrent work queues",
      ],
    },
  },
};
