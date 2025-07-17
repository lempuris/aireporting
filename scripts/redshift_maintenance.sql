
-- Redshift Maintenance Script
-- Run this script weekly during low-traffic periods

-- 1. Vacuum and analyze all tables
VACUUM REINDEX customers;
ANALYZE customers;

VACUUM REINDEX contracts;
ANALYZE contracts;

VACUUM REINDEX analysis;
ANALYZE analysis;

VACUUM REINDEX support_tickets;
ANALYZE support_tickets;

VACUUM REINDEX ticket_interactions;
ANALYZE ticket_interactions;

VACUUM REINDEX referral_calls;
ANALYZE referral_calls;

VACUUM REINDEX call_negotiations;
ANALYZE call_negotiations;

-- 2. Check table statistics
SELECT 
    tablename,
    diststyle,
    sortkey1,
    size,
    pct_used,
    unsorted,
    stats_off,
    tbl_rows,
    skew_rows
FROM pg_table_def 
WHERE tablename IN ('customers', 'contracts', 'analysis', 'support_tickets', 'ticket_interactions', 'referral_calls', 'call_negotiations')
ORDER BY size DESC;

-- 3. Monitor for high skew
SELECT 
    tablename,
    skew_rows,
    skew_sortkey1
FROM pg_table_def 
WHERE tablename IN ('customers', 'contracts', 'analysis', 'support_tickets', 'ticket_interactions', 'referral_calls', 'call_negotiations')
AND (skew_rows > 0.1 OR skew_sortkey1 > 0.1);

-- 4. Check for unsorted data
SELECT 
    tablename,
    unsorted,
    stats_off
FROM pg_table_def 
WHERE tablename IN ('customers', 'contracts', 'analysis', 'support_tickets', 'ticket_interactions', 'referral_calls', 'call_negotiations')
AND (unsorted > 5 OR stats_off > 5);
