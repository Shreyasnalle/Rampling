<p>A basic and rough workflow of the project</p>
<img width="455" height="654" alt="image" src="https://github.com/user-attachments/assets/086533ad-58cc-4544-8bf9-d2cc29d64914" />
<p>TOTAL RESULTS 

    checks_total.......: 1900   45.940099/s
    checks_succeeded...: 55.78% 1060 out of 1900
    checks_failed......: 44.21% 840 out of 1900

    ✓ /health is 200
    ✗ /product-fast is 200
      ↳  0% — ✓ 0 / ✗ 380
    ✗ /product-n-plus-one is 200
      ↳  0% — ✓ 0 / ✗ 380
    ✓ /slow-blocking is 200
    ✗ /random-fail is 200
      ↳  78% — ✓ 300 / ✗ 80

    HTTP
    http_req_duration..............: avg=302.55ms min=364.62µs med=2.34ms max=1.5s  p(90)=1.5s  p(95)=1.5s 
      { expected_response:true }...: avg=539.9ms  min=593.28µs med=2.14ms max=1.5s  p(90)=1.5s  p(95)=1.5s 
    http_req_failed................: 44.21% 840 out of 1900
    http_reqs......................: 1900   45.940099/s

    EXECUTION
    iteration_duration.............: avg=2.51s    min=2.5s     med=2.51s  max=2.54s p(90)=2.51s p(95)=2.52s
    iterations.....................: 380    9.18802/s
    vus............................: 2      min=1           max=50
    vus_max........................: 50     min=50          max=50

    NETWORK
    data_received..................: 297 kB 7.2 kB/s
    data_sent......................: 157 kB 3.8 kB/s




running (0m41.4s), 00/50 VUs, 380 complete and 0 interrupted iterations
default ✓ [======================================] 00/50 VUs  40s</p>