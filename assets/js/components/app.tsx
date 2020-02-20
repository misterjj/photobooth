import * as React from 'react'
import Webcam from 'react-webcam'
import PhotoManager, { Photo } from '../managers/PhotoManager'
import { AxiosError } from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Overlay, OverlayTrigger, Popover } from 'react-bootstrap'

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
  private readonly webcamRef: any
  private readonly clockTarget: any

  constructor (props: AppProps) {
    super(props)
    this.webcamRef = React.createRef()
    this.clockTarget = React.createRef()
    this.videoHeight = 634
    this.videoWidth = 1024
    this.videoConstraints = {
      width: this.videoWidth,
      height: this.videoHeight,
      facingMode: 'user'
    }

    this.state = {
      diaphragmOpen: false,
      timeout: 1,
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
    const popover = (
      <Popover id="popover-basic">
        <Popover.Title as="h3">Popover right</Popover.Title>
        <Popover.Content>
          And here's some <strong>amazing</strong> content. It's very engaging.
          right?
        </Popover.Content>
      </Popover>
    );

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
              {!this.state.photo.saved ? ([
                <div className='flex-grow-1'>
                  <button
                    className="btn btn-lg btn-danger"
                    onClick={this.reInit}>
                    <span className="d-flex align-items-center">
                      <FontAwesomeIcon icon="trash-alt" size="2x" />
                      <span>Oh non ! <br/>c'est trop moche !</span>
                    </span>
                  </button>
                </div>,
                <div className='flex-grow-1'>
                  <button
                    className="btn btn-lg btn-success"
                    onClick={this.savePhoto}>
                    <span className="d-flex align-items-center">
                      { this.state.photo.saving
                        ? ([
                          <FontAwesomeIcon icon="spinner" size="2x" spin />,
                          <span>en cours</span>
                        ]):([
                          <FontAwesomeIcon icon="check-circle" size="2x" />,
                          <span>Enregister</span>
                        ]) }
                    </span>
                  </button>
                </div>
              ]) : ([
                <div className='flex-grow-1'>
                  <button
                    className="btn btn-lg btn-info"
                    onClick={this.reInit}>
                    <span className="d-flex align-items-center">
                      <FontAwesomeIcon icon="camera-retro" size="2x" />
                      <span>Prendre une autre photo</span>
                    </span>
                  </button>
                </div>,
                <div className='flex-grow-1'>
                  <button
                    className="btn btn-lg btn-primary"
                    onClick={this.savePhoto}>
                    <span className="d-flex align-items-center">
                      <FontAwesomeIcon icon="envelope" size="2x"/>
                      <span>Envoyer par email</span>
                    </span>
                  </button>
                </div>
              ])}
            </div>
          </div>
        )}
      </div>
      < div className='controller flex-grow-1 d-flex justify-content-center'>
        <div className='button-camera'>
          <button onClick={() => {this.takePhoto(this.state.timeout)}}>
            {
              this.state.timer === 0 ? (
                <span><FontAwesomeIcon icon="camera-retro" /></span>
              ) : (
                this.state.timer
              )
            }
          </button>
          <div className="button-timeout">
            <OverlayTrigger trigger="click" placement="right" overlay={popover}>
              <button ref={this.clockTarget}>
                <FontAwesomeIcon icon="clock" />
              </button>
            </OverlayTrigger>
          </div>
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
      let photo: Photo = {
        data: imageSrc as string,
        saved: false,
        saving: false
      }
      this.setState({
        photo,
        diaphragmOpen: false
      })
    }

    // PhotoManager.list().then((p: Photo[]) => console.log(p[0].data))

  }

  savePhoto = () => {
    if (null === this.state.photo) {
      //todo error
      return
    } else {
      if (this.state.photo.saving) {
        return;
      }
      this.setState({
        photo: { ...this.state.photo, saving: false }
      })
      PhotoManager
        .post(this.state.photo.data)
        .then((photo: Photo) => {
          this.setState({
            photo: { ...photo, saved: true, saving: false }
          })
        })
        .catch((error: AxiosError) => {
          /* todo: message d'erreur */
          console.log(error)
        })
    }
  }

  reInit = () => {
    this.setState({
      diaphragmOpen: true,
      photo: null
    })
  }
}
