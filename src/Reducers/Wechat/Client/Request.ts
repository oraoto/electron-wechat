import axios, {AxiosRequestConfig, AxiosInstance} from 'axios';
import Axios from 'axios';
import * as httpAdapter from 'axios/lib/adapters/http'
import * as CM from 'cookie-manager'

// (Axios.defaults as any).adapter = httpAdapter;

const getPgv = (c = "") => {
    return c + Math.round(2147483647 * (Math.random() || 0.5)) * (+new Date() % 1E10)
}

export default class Request {
    axios: AxiosInstance;
    cm: any;

    constructor(defaults: AxiosRequestConfig = {}) {
        defaults.headers = defaults.headers || {}

        defaults.headers['user-agent'] = defaults.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36'
        defaults.headers['connection'] = defaults.headers['connection'] || 'close';

        (defaults as any).httpAgent = false;
        (defaults as any).httpsAgent = false;
        (defaults as any).adapter = httpAdapter;

        this.axios = axios.create(defaults)

        this.cm = new CM();
        this.cm.store('', ['pgv_pvi=' + getPgv() + '; Domain=.qq.com; Path=/', 'pgv_si=' + getPgv('s') + '; Domain=.qq.com; Path=/'])

        this.axios.interceptors.request.use(config => {
            config.headers['cookie'] = config.url ? decodeURIComponent(this.cm.prepare(config.url)): ''
            return config;
        }, err => {
            return Promise.reject(err)
        });

        this.axios.interceptors.response.use(res => {
            let setCookie = res.headers['set-cookie'];
            if (setCookie) {
                this.cm.store(res.config.url, setCookie.map(item => {
                    return item.replace(/=\s*?(?=(\w+\.)*(wx\d?\.qq\.com|wechat\.com))/, '=.')
                }));
            }
            return res;
        }, err => {
            return Promise.reject(err);
        });

    }

    request(options) {
        return this.axios.request(options);
    }
}