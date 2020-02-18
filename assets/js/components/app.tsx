import * as React from 'react'
import Webcam from "react-webcam";
import {RefObject} from "react";

interface AppProps {
}

interface AppState {
}

export default class App extends React.PureComponent<AppProps, AppState> {
    private readonly videoConstraints: MediaStreamConstraints['video']
    private readonly videoHeight: number
    private readonly videoWidth: number
    private webcamRef: any;

    constructor(props: AppProps) {
        super(props)
        this.webcamRef = React.createRef();
        this.videoHeight = 634
        this.videoWidth = 1024
        this.videoConstraints = {
            width: this.videoWidth,
            height: this.videoHeight,
            facingMode: "user"
        }
    }

    render() {
        return <div className="app d-flex flex-column">
            <div className="photo">
                <Webcam
                    audio={false}
                    width={this.videoWidth}
                    height={this.videoHeight}
                    ref={this.webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={this.videoConstraints}/>
            </div>
            <div className="controller flex-grow-1">
                <button onClick={this.capture}>
                    PHOTO
                </button>
            </div>
        </div>
    }

    capture = (): void => {
        let imageSrc = this.webcamRef.current.getScreenshot();
        console.log(imageSrc)
    }
}
