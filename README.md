## Rough Workflow

![Rough Workflow](assets/rough_workflow.png)

## Demo AST + Semgrep + k6 pipeline Result

```text
scan_results database is ready.
Found 5 route(s) in '/home/shreyas-nalle/Desktop/Rampling/Rampling/backend/demo_pipeline_check.py'
1 finding(s) in '/home/shreyas-nalle/Desktop/Rampling/Rampling/backend/demo_pipeline_check.py'.
[k6] avg=307.6ms p90=1501.9ms p95=1502.8ms fail=4.60% rps=45.5
[Report] Built 5 row(s).
Data base Inserted 5 row(s).  IDs: [16, 17, 18, 19, 20]

Routes: 5 | Findings: 1 | Inserted: 5 -> [16, 17, 18, 19, 20]
[
  {
    "scanned_at": "2026-09-06T14:04:51.734493+00:00",
    "target_file": "/home/shreyas-nalle/Desktop/Rampling/Rampling/backend/demo_pipeline_check.py",
    "route_method": "GET",
    "route_path": "/health",
    "route_function": "health",
    "semgrep_rule_id": null,
    "semgrep_file": null,
    "semgrep_line": null,
    "semgrep_message": null,
    "severity": "INFO",
    "k6_avg_duration": 307.62010182910075,
    "k6_p90_duration": 1501.8971417999999,
    "k6_p95_duration": 1502.7845464499999,
    "k6_req_failed": 0.046031746031746035,
    "k6_rps": 45.519624631984705
  },
  {
    "scanned_at": "2026-09-06T14:04:51.734493+00:00",
    "target_file": "/home/shreyas-nalle/Desktop/Rampling/Rampling/backend/demo_pipeline_check.py",
    "route_method": "GET",
    "route_path": "/products-fast",
    "route_function": "products_fast",
    "semgrep_rule_id": null,
    "semgrep_file": null,
    "semgrep_line": null,
    "semgrep_message": null,
    "severity": "INFO",
    "k6_avg_duration": 307.62010182910075,
    "k6_p90_duration": 1501.8971417999999,
    "k6_p95_duration": 1502.7845464499999,
    "k6_req_failed": 0.046031746031746035,
    "k6_rps": 45.519624631984705
  },
  {
    "scanned_at": "2026-09-06T14:04:51.734493+00:00",
    "target_file": "/home/shreyas-nalle/Desktop/Rampling/Rampling/backend/demo_pipeline_check.py",
    "route_method": "GET",
    "route_path": "/products-n-plus-one",
    "route_function": "products_n_plus_one",
    "semgrep_rule_id": null,
    "semgrep_file": null,
    "semgrep_line": null,
    "semgrep_message": null,
    "severity": "INFO",
    "k6_avg_duration": 307.62010182910075,
    "k6_p90_duration": 1501.8971417999999,
    "k6_p95_duration": 1502.7845464499999,
    "k6_req_failed": 0.046031746031746035,
    "k6_rps": 45.519624631984705
  },
  {
    "scanned_at": "2026-09-06T14:04:51.734493+00:00",
    "target_file": "/home/shreyas-nalle/Desktop/Rampling/Rampling/backend/demo_pipeline_check.py",
    "route_method": "GET",
    "route_path": "/slow-blocking",
    "route_function": "slow_blocking",
    "semgrep_rule_id": "testing_k6_semgrep_ast.blocking-sleep-in-route",
    "semgrep_file": "/home/shreyas-nalle/Desktop/Rampling/Rampling/backend/demo_pipeline_check.py",
    "semgrep_line": 52,
    "semgrep_message": "Blocking time.sleep() found in route function, this will block all the concurrent requests",
    "severity": "WARNING",
    "k6_avg_duration": 307.62010182910075,
    "k6_p90_duration": 1501.8971417999999,
    "k6_p95_duration": 1502.7845464499999,
    "k6_req_failed": 0.046031746031746035,
    "k6_rps": 45.519624631984705
  },
  {
    "scanned_at": "2026-09-06T14:04:51.734493+00:00",
    "target_file": "/home/shreyas-nalle/Desktop/Rampling/Rampling/backend/demo_pipeline_check.py",
    "route_method": "GET",
    "route_path": "/random-fail",
    "route_function": "random_fail",
    "semgrep_rule_id": null,
    "semgrep_file": null,
    "semgrep_line": null,
    "semgrep_message": null,
    "severity": "INFO",
    "k6_avg_duration": 307.62010182910075,
    "k6_p90_duration": 1501.8971417999999,
    "k6_p95_duration": 1502.7845464499999,
    "k6_req_failed": 0.046031746031746035,
    "k6_rps": 45.519624631984705
  }
]
```