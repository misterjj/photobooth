import { AxiosResponse } from 'axios'

const axios = require('axios')

export interface Photo {
  id?: number;
  data: string;
  create_at?: Date
  saved: boolean
  saving: boolean
}

export default class PhotoManager {

  public static async post (data: string) {
    return await axios.post('/api/photos', {
      data
    })
      .then((response: AxiosResponse) => {
        return response.data
      })
  }

  public static async list (page: number = 1) {

    return await axios.get('/api/photos?page=' + page, {
      headers: {
        accept: 'application/json'
      }
    })
      .then((response: AxiosResponse) => {
        return (response.data as Photo[])
      })
  }

}
