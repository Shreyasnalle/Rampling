import http from "k6/http" 
import {check, sleep} from "k6"
export const options = {
    stages : [
        {duration : "10s", target : 10},
        {duration : "20s", target : 50},
        {duration : "10s", target : 0}
    ]
}
const base_url = "http://localhost:8000"
export default function () {
    let response1 = http.get(`${base_url}/health`)
    check(response1, {"/health is 200" : (r) => r.status === 200})
    let response2 = http.get(`${base_url}/products-fast`) 
    check(response2, {"/product-fast is 200" : (r) => r.status === 200})
    let response3 = http.get(`${base_url}/products-n-plus-one`)
    check(response3, {"/product-n-plus-one is 200" : (r) => r.status === 200})
    let response4 = http.get(`${base_url}/slow-blocking`)
    check(response4, {"/slow-blocking is 200" : (r) => r.status === 200})
    let response5 = http.get(`${base_url}/random-fail`)
    check(response5, {"/random-fail is 200" : (r) => r.status === 200})
    sleep(1)
}
