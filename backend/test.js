import http from "k6/http" 
import { check, sleep } from "k6"

export const options = {
    stages: [
        { duration: "10s", target: 10 },
        { duration: "20s", target: 50 },
        { duration: "10s", target: 0 }
    ],
    thresholds: {
        'http_req_duration{name:/health}': [],
        'http_req_duration{name:/products-fast}': [],
        'http_req_duration{name:/products-n-plus-one}': [],
        'http_req_duration{name:/slow-blocking}': [],
        'http_req_duration{name:/random-fail}': [],
        'http_req_failed{name:/health}': [],
        'http_req_failed{name:/products-fast}': [],
        'http_req_failed{name:/products-n-plus-one}': [],
        'http_req_failed{name:/slow-blocking}': [],
        'http_req_failed{name:/random-fail}': [],
        'http_reqs{name:/health}': [],
        'http_reqs{name:/products-fast}': [],
        'http_reqs{name:/products-n-plus-one}': [],
        'http_reqs{name:/slow-blocking}': [],
        'http_reqs{name:/random-fail}': [],
    }
}

const base_url = "http://localhost:8000"

export default function () {
    let response1 = http.get(`${base_url}/health`, { tags: { name: "/health" } })
    check(response1, { "/health is 200": (r) => r.status === 200 })

    let response2 = http.get(`${base_url}/products-fast`, { tags: { name: "/products-fast" } }) 
    check(response2, { "/product-fast is 200": (r) => r.status === 200 })

    let response3 = http.get(`${base_url}/products-n-plus-one`, { tags: { name: "/products-n-plus-one" } })
    check(response3, { "/product-n-plus-one is 200": (r) => r.status === 200 })

    let response4 = http.get(`${base_url}/slow-blocking`, { tags: { name: "/slow-blocking" } })
    check(response4, { "/slow-blocking is 200": (r) => r.status === 200 })

    let response5 = http.get(`${base_url}/random-fail`, { tags: { name: "/random-fail" } })
    check(response5, { "/random-fail is 200": (r) => r.status === 200 })

    sleep(1)
}
