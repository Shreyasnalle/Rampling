<p>A basic and rough workflow of the project</p>
<img width="455" height="654" alt="image" src="https://github.com/user-attachments/assets/086533ad-58cc-4544-8bf9-d2cc29d64914" />
<h3> k6 demo results </h3>
<p>TOTAL RESULTS 

    checks_total.......: 1900   45.820629/s
    checks_succeeded...: 96.26% 1829 out of 1900
    checks_failed......: 3.73%  71 out of 1900

    ✓ /health is 200
    ✓ /product-fast is 200
    ✓ /product-n-plus-one is 200
    ✓ /slow-blocking is 200
    ✗ /random-fail is 200
      ↳  81% — ✓ 309 / ✗ 71

    HTTP
    http_req_duration..............: avg=304.7ms  min=517.34µs med=3.43ms max=1.5s  p(90)=1.5s  p(95)=1.5s 
      { expected_response:true }...: avg=316.36ms min=517.34µs med=3.38ms max=1.5s  p(90)=1.5s  p(95)=1.5s 
    http_req_failed................: 3.73%  71 out of 1900
    http_reqs......................: 1900   45.820629/s

    EXECUTION
    iteration_duration.............: avg=2.52s    min=2.51s    med=2.52s  max=2.56s p(90)=2.53s p(95)=2.54s
    iterations.....................: 380    9.164126/s
    vus............................: 2      min=1          max=50
    vus_max........................: 50     min=50         max=50

    NETWORK
    data_received..................: 2.0 MB 49 kB/s
    data_sent......................: 157 kB 3.8 kB/s

    running (0m41.5s), 00/50 VUs, 380 complete and 0 interrupted iterations
    default ✓ [======================================] 00/50 VUs  40s
</p>
<h3> Semgrep demo results </h3>
<p>
(ramplingenv) shreyas-nalle@shreyas-nalle-device:~/Desktop/Rampling/Rampling$ semgrep --config=testing_k6_semgrep_ast/rules.yaml testing_k6_semgrep_ast/main.py --json
 
┌──── ○○○ ────┐
│ Semgrep CLI │
└─────────────┘

Scanning 1 file (only git-tracked) with 1 Code rule:
            
  CODE RULES
  Scanning 1 file.
                    
  SUPPLY CHAIN RULES
                  
  No rules to run.
                  
          
  PROGRESS
   
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% 0:00:00                                                                                                                        
{"version":"1.172.0","results":[{"check_id":"testing_k6_semgrep_ast.blocking-sleep-in-route","path":"testing_k6_semgrep_ast/main.py","start":{"line":51,"col":1,"offset":1561},"end":{"line":56,"col":6,"offset":1696},"extra":{"message":"Blocking time.sleep() found in route function, this iwll block all the concurrent reuqests","metadata":{},"severity":"WARNING","fingerprint":"requires login","lines":"requires login","validation_state":"NO_VALIDATOR","engine_kind":"OSS"}}],"errors":[],"paths":{"scanned":["testing_k6_semgrep_ast/main.py"]},"time":{"rules":[],"rules_parse_time":0.00019812583923339844,"profiling_times":{"config_time":0.08002734184265137,"core_time":0.10541605949401855,"ignores_time":5.1021575927734375e-05,"total_time":0.19370222091674805},"parsing_time":{"total_time":0.0,"per_file_time":{"mean":0.0,"std_dev":0.0},"very_slow_stats":{"time_ratio":0.0,"count_ratio":0.0},"very_slow_files":[]},"scanning_time":{"total_time":0.014215946197509766,"per_file_time":{"mean":0.014215946197509766,"std_dev":0.0},"very_slow_stats":{"time_ratio":0.0,"count_ratio":0.0},"very_slow_files":[]},"matching_time":{"total_time":0.0,"per_file_and_rule_time":{"mean":0.0,"std_dev":0.0},"very_slow_stats":{"time_ratio":0.0,"count_ratio":0.0},"very_slow_rules_on_files":[]},"tainting_time":{"total_time":0.0,"per_def_and_rule_time":{"mean":0.0,"std_dev":0.0},"very_slow_stats":{"time_ratio":0.0,"count_ratio":0.0},"very_slow_rules_on_defs":[]},"fixpoint_timeouts":[],"prefiltering":{"project_level_time":0.0,"file_level_time":0.0,"rules_with_project_prefilters_ratio":0.0,"rules_with_file_prefilters_ratio":1.0,"rules_selected_ratio":1.0,"rules_matched_ratio":1.0},"targets":[],"total_bytes":0,"max_memory_bytes":88768320},"engine_requested":"OSS","skipped_rules":[],"profiling_results":[]}
                
                
┌──────────────┐
│ Scan Summary │
└──────────────┘
✅ Scan completed successfully.
 • Findings: 1 (1 blocking)
 • Rules run: 1
 • Targets scanned: 1
 • Parsed lines: ~100.0%
 • No ignore information available
Ran 1 rule on 1 file: 1 finding.
(ramplingenv) shreyas-nalle@shreyas-nalle-device:~/Desktop/Rampling/Rampling$
</p>