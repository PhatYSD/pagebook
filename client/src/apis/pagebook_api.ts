import axios from "axios";

const pagebookAPI = axios.create({
    baseURL: "http://34.143.251.150:80/api"
});

export default pagebookAPI;