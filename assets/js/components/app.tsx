import * as React from 'react'
import Webcam from 'react-webcam'
import { Photo } from '../managers/PhotoManager'

interface AppProps {
}

interface AppState {
  diaphragmOpen: boolean,
  timeout: number,
  timer: number,
  photo: Photo | null
}

export default class App extends React.PureComponent<AppProps, AppState> {
  private readonly videoConstraints: MediaStreamConstraints['video']
  private readonly videoHeight: number
  private readonly videoWidth: number
  private webcamRef: any

  constructor (props: AppProps) {
    super(props)
    this.webcamRef = React.createRef()
    this.videoHeight = 634
    this.videoWidth = 1024
    this.videoConstraints = {
      width: this.videoWidth,
      height: this.videoHeight,
      facingMode: 'user'
    }

    this.state = {
      diaphragmOpen: false,
      timeout: 3,
      timer: 0,
      photo: null
    }

    // todo : wait video is ready
    setTimeout(() => {
      this.setState({
        diaphragmOpen: true
      })
    }, 1500)
  }

  render () {
    return <div className="app d-flex flex-column">
      <div className="photo">
        <Webcam
          audio={false}
          width={this.videoWidth}
          height={this.videoHeight}
          ref={this.webcamRef}
          screenshotFormat="image/jpeg"
          screenshotQuality={1}
          videoConstraints={this.videoConstraints}/>
        <div className={'diaphragm ' + (this.state.diaphragmOpen ? 'open' : 'close')}></div>
        {null !== this.state.photo && (<div className="photo-taken d-flex flex-column">
          <img src={this.state.photo.data} alt=""/>
          <div className="actions d-flex align-items-center">
            <div className='flex-grow-1'>
              <button className="btn btn-lg btn-danger">
                <span className="d-flex align-items-center">
                  <i className="fa fa-trash"></i>
                  <span>Oh non ! <br/>c'est trop moche !</span>
                </span>
              </button>
            </div>
            <div className='flex-grow-1'>
              <button className="btn btn-lg btn-success">
                <span className="d-flex align-items-center">
                  <i className="fa fa-check"></i>
                  <span>Enregister</span>
                </span>
              </button>
            </div>
          </div>
        </div>)}
      </div>
      <div className="controller flex-grow-1 d-flex">
        <div className="button-camera">
          <button onClick={() => {this.takePhoto(this.state.timeout)}}>
            {
              this.state.timer === 0 ? (
                <span><i className="fas fa-camera-retro"></i></span>
              ) : (
                this.state.timer
              )
            }
          </button>
        </div>
      </div>
    </div>
  }

  takePhoto = (timer: number) => {
    this.setState({
      timer: timer
    })
    if (timer === 0) {
      this.capture()
    } else {
      setTimeout(() => {
        this.takePhoto(timer - 1)
      }, 1000)
    }
  }

  capture = () => {
    let imageSrc = this.webcamRef.current.getScreenshot()
    if (null !== imageSrc) {
      console.log(imageSrc)
      let photo:Photo = {
        data : imageSrc as string
      }
      this.setState({
        photo,
        diaphragmOpen: false
      })

      // PhotoManager
      //   .post(imageSrc)
      //   .then((photo: Photo) => {
      //     console.log(photo)
      //   })
      //   .catch((error: AxiosError) => {
      //       /* todo: message d'erreur */
      //       console.log(error);
      //   })
    }

    // PhotoManager.list().then((p: Photo[]) => console.log(p[0].data))

  }
}
