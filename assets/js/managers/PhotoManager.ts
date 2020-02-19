import { AxiosError, AxiosResponse } from 'axios'

const axios = require('axios')

export interface Photo {
  id: number;
  data: string;
  create_at: Date
}

export default class PhotoManager {

  public static post (data: string) {
    axios.post('/api/photos', {
      data
    })
      .then((response: AxiosResponse) => {

      })
      .catch((error: AxiosError) => {
        console.log(error)
      })
  }

}
