import axios from 'axios'
import Qs from 'qs'

export default class Http {
  public static respond(
    responseObject: any,
    message: string,
    data: object = {},
    meta: object | null = null,
    filters: Object | null = null,
    statusCode: number = 200
  ) {
    const responseBody: any = {
      data: data,
      meta: meta,
      message: message,
      filters: filters,
    }
    return responseObject.status(statusCode).send(responseBody)
  }

  static post(url, body, params = {}, headers = {}) {
    return axios({
      url: url,
      method: 'post',
      headers: headers,
      data: body,
      params: params,
      paramsSerializer: function (params) {
        return Qs.stringify(params, { encode: false })
      },
    })
  }

  static get(url, params = {}, headers = {}) {
    return axios({
      url: url,
      method: 'get',
      headers: headers,
      params: params,
      paramsSerializer: function (params) {
        return Qs.stringify(params, { encode: false })
      },
    })
  }

  static put(url, body, params = {}, headers = {}) {
    return axios({
      url: url,
      method: 'put',
      headers: headers,
      data: body,
      params: params,
      paramsSerializer: function (params) {
        return Qs.stringify(params, { encode: false })
      },
    })
  }

  static delete(url, body, params = {}, headers = {}) {
    return axios({
      url: url,
      method: 'delete',
      headers: headers,
      data: body,
      params: params,
      paramsSerializer: function (params) {
        return Qs.stringify(params, { encode: false })
      },
    })
  }
}
