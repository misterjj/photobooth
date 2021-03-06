import * as React from 'react'
import Webcam from 'react-webcam'
import PhotoManager, {Photo} from '../managers/PhotoManager'
import {AxiosError} from 'axios'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {OverlayTrigger, Popover} from 'react-bootstrap'
import mergeImages from 'merge-images';
import overlays from "../assets/overlay";
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import {IconProp} from "@fortawesome/fontawesome-svg-core";

interface AppProps {
}

interface AppState {
    diaphragmOpen: boolean,
    timeout: number,
    timer: number,
    photo: Photo | null
    overlay: number | null
}

export default class App extends React.PureComponent<AppProps, AppState> {
    private readonly videoConstraints: MediaStreamConstraints['video']
    private readonly videoHeight: number
    private readonly videoWidth: number
    private readonly webcamRef: any
    private readonly clockRef: any
    private readonly overlayImgRef: any
    private readonly defaultTimeout: number
    private readonly minTimeout: number
    private readonly maxTimeout: number
    private readonly shuttersNumber: number

    constructor(props: AppProps) {
        super(props)
        this.webcamRef = React.createRef()
        this.clockRef = React.createRef()
        this.overlayImgRef = React.createRef()
        this.videoHeight = 634
        this.videoWidth = 1024
        this.defaultTimeout = 3
        this.minTimeout = 1
        this.maxTimeout = 10
        this.shuttersNumber = 13
        this.videoConstraints = {
            width: this.videoWidth,
            height: this.videoHeight,
            facingMode: 'user'
        }

        this.state = {
            diaphragmOpen: false,
            timeout: this.defaultTimeout,
            timer: 0,
            photo: null,
            overlay: 3
        }

        // todo : wait video is ready
        setTimeout(() => {
            this.setState({
                diaphragmOpen: true
            })
        }, 1500)
    }

    render() {
        const marks = {
            1: '1',
            2: '2',
            3: '3',
            4: '4',
            5: '5',
            6: '6',
            7: '7',
            8: '8',
            9: '9',
            10: '10',
        };
        const popoverTimeout = (
            <Popover id="popover-timeout" className="popover-timeout">
                <Popover.Title as="h3">Retardateur : {this.state.timeout} secondes</Popover.Title>
                <Popover.Content>
                    <Slider
                        min={1}
                        max={10}
                        defaultValue={this.state.timeout}
                        dots={true}
                        marks={marks}
                        onAfterChange={this.setTimeoutValue}
                    />
                </Popover.Content>
            </Popover>
        )

        const shutters = [];
        const rotate = 360/ this.shuttersNumber
        for (let i=0; i<this.shuttersNumber; i++) {
            let style = {transform: 'rotate(' + rotate * i + 'deg)'};
            shutters.push(<div className="shutter-container" style={style} key={'shutter-' + i}>
                <div className="shutter"></div>
            </div>)
        }

        return <div className="app d-flex flex-column">
            <div className="photo">
                <Webcam
                    audio={false}
                    width={this.videoWidth}
                    height={this.videoHeight}
                    ref={this.webcamRef}
                    screenshotFormat="image/jpeg"
                    screenshotQuality={0.8}
                    videoConstraints={this.videoConstraints}/>
                {null !== this.state.overlay && (<div className="overlay">
                    <img ref={this.overlayImgRef} src={overlays[this.state.overlay - 1]} alt=""/>
                </div>)}
                <div className={'diaphragm ' + (this.state.diaphragmOpen ? 'open' : 'close')}>
                    <div className="shutters">{shutters}</div>
                </div>
                {null !== this.state.photo && (<div className="photo-taken d-flex flex-column">
                        <img src={this.state.photo.data} alt=""/>
                        <div className="actions d-flex align-items-center">
                            {!this.state.photo.saved ? ([
                                <div className='flex-grow-1'>
                                    {this.controllerAction(<span>Oh non ! <br/>c'est trop moche !</span>, 'danger',
                                        <FontAwesomeIcon icon='trash-alt' size="2x"/>, this.reInit)}
                                </div>,
                                <div className='flex-grow-1'>
                                    {this.controllerAction(
                                          this.state.photo.saving
                                              ? (
                                                  <span>en cours</span>
                                              ) : (
                                                  <span>Enregister</span>
                                              ),
                                        'success',
                                        this.state.photo.saving
                                            ? (
                                                <FontAwesomeIcon icon="spinner" size="2x" spin/>
                                            ) : (
                                                <FontAwesomeIcon icon="check-circle" size="2x"/>
                                            ),
                                        this.savePhoto)
                                    }
                                </div>
                            ]) : ([
                                <div className='flex-grow-1'>
                                    {this.controllerAction(<span>Prendre une autre photo</span>, 'info',
                                        <FontAwesomeIcon icon='camera-retro' size="2x"/>, this.reInit)}
                                </div>,
                                <div className='flex-grow-1'>
                                    {this.controllerAction(<span>Envoyer par email</span>, 'primary',
                                        <FontAwesomeIcon icon='envelope' size="2x"/>, this.savePhoto)}
                                </div>
                            ])}
                        </div>
                    </div>
                )}
            </div>
            <div className='controller flex-grow-1 d-flex justify-content-center'>
                <div className='button-camera'>
                    <button onClick={() => {
                        this.takePhoto(this.state.timeout)
                    }}>
                        {
                            this.state.timer === 0 ? (
                                <span><FontAwesomeIcon icon="camera-retro"/></span>
                            ) : (
                                this.state.timer
                            )
                        }
                    </button>
                    <div className="button-timeout">
                        <OverlayTrigger trigger="focus" placement="top" overlay={popoverTimeout}>
                            <button ref={this.clockRef}>
                                <FontAwesomeIcon icon="clock"/>
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
        const overlay = this.getOverlayData(this.mergeOverlay)
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
                return
            }
            this.setState({
                photo: {...this.state.photo, saving: true}
            })
            PhotoManager
                .post(this.state.photo.data)
                .then((photo: Photo) => {
                    this.setState({
                        photo: {...photo, saved: true, saving: false}
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

    setTimeoutValue = (value: number) => {
        this.setState({
            timeout: value
        })
    }

    getOverlayData = (callback: (overlay: string) => void): void => {
        if (null === this.state.overlay) {
            return
        }

        const img2 = this.overlayImgRef.current as HTMLImageElement
        var img = new Image();
        img.crossOrigin = "anonymous"
        img.src = img2.src
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            if (null !== ctx) {
                ctx.drawImage(img, 0, 0);

                let body = document.getElementsByTagName('body')[0]
                // console.log(canvas.toDataURL('image/jpeg'))
                callback(canvas.toDataURL('image/png'))
            }
        }
    }

    mergeOverlay = (overlay: string) : void =>  {
        if (this.state.photo === null) {
            return
        }

        mergeImages([this.state.photo.data, overlay])
            .then((b64) => {
                // @ts-ignore
                this.setState({
                    photo : {...this.state.photo, data: b64}
                })
            })
    }

    controllerAction = (text: JSX.Element, btnClass: string, icon: JSX.Element, callback: () => void) => {
        return <button
            className={"btn btn-lg btn-" + btnClass}
            onClick={callback}>
                    <span className="d-flex align-items-center">
                        {icon}
                        {text}
                    </span>
        </button>
    }
}
