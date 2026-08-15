<p>A basic and rough workflow of the project</p>
<img width="455" height="654" alt="image" src="https://github.com/user-attachments/assets/086533ad-58cc-4544-8bf9-d2cc29d64914" />
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