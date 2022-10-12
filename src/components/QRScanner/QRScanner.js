import { Html5Qrcode } from 'html5-qrcode'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { scan } from '../store/features/scanSlice'
import { temp } from '../store/features/tempSlice'
import { useNavigate } from "react-router-dom";



const QRScanner = ({ html5QrCode, setHtml5QrCode, hide, setHide }) => {

  const [scannerState, setScannerState] = useState(false)

  const navigate = useNavigate();

  var buttonVisibility = "visible";

  var dat2 = useSelector((state) => state.temp.isCoi);
  var dat1 = useSelector((state) => state.temp.isBatchRecord);

  console.log("Important", dat1, dat2);
  if (dat1 && dat2) {
    buttonVisibility = "invisible";
  }


  const dispatch = useDispatch()
  const selector1 = useSelector((state) => state.scan.batchRecord)
  const selector2 = useSelector((state) => state.scan.coi)
  const subjectSelector = useSelector((state) => state.subject);


  if (subjectSelector.subject.length > 0) {
    var coi = subjectSelector.subject[0].COINumber;
    var batch = subjectSelector.subject[0].batchNumber;
    console.log("Batch & COI : ", batch, coi);
    var elxi = (dat1 === false && dat2 === false) ? "Batch" : "COI";
    console.log("Elxi : ", elxi);
    var detail = {
      operator: subjectSelector.subject[0].operatorName,
      scanDate: new Date().toLocaleString().split(",").join(""),
      scanType: elxi,
    };
  }

  const qrboxFunction = function (viewfinderWidth, viewfinderHeight) {
    let minEdgePercentage = 0.8
    let minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight)
    let qrboxSize = Math.floor(minEdgeSize * minEdgePercentage)
    return true
      ? {
        width: qrboxSize,
        height: qrboxSize,
      }
      : {
        width: viewfinderHeight,
        height: qrboxSize / 2,
      }
  }
  const qrConfig = { fps: 10, qrbox: qrboxFunction }

  const qrCodeSuccessCallback = (decodedText, decodedResult) => {

    const value = {
      ...detail,
      scanValue: decodedResult.decodedText,
      results:
        elxi === "Batch"
          ? batch === decodedResult.decodedText
            ? "Success"
            : "Failure"
          : coi === decodedResult.decodedText
            ? "Success"
            : "Failure",
    };

    console.log(value);
    // dispatch(scann.batchScan(value));
    if (dat1 === false && dat2 === false) {
      console.log("Dispatched Batch scan");
      dispatch(scan.batchScan(value))
      if (value.results === "Success") {
        dispatch(temp.isBatchScan(true))
      }
    } else if (dat1 === true && dat2 === false) {
      console.log("Dispatched coi scan");
      dispatch(scan.batchScan(value))
      if (value.results === "Success") {
        dispatch(temp.isCoiScan(true))
      }
    }
    html5QrCode.pause()
    stopScanning()
  }

  const qrErrorCallback = (errorMessage) => {
    console.log('Reading for Bar/QR Code... ', errorMessage)
  }

  const stopScanning = () => {
    try {
      console.log('Stop Initiated')
      setScannerState(false)

      html5QrCode
        .stop()
        .then(() => {
          console.log('Scanning Stopped.')
        })
        .catch((err) => {
          console.log('Error while closing the camera.')
        })
    } catch {
      console.log('Catch block of stop scanning')
    }
  }

  const startScanning = () => {
    console.log('Start Initiated')
    setScannerState(true)

    html5QrCode
      .start(
        { facingMode: 'environment' },
        qrConfig,
        qrCodeSuccessCallback,
        qrErrorCallback
      )
      .catch((err) => {
        console.log('Camera start error')
      })
    console.log("HTML5QRCODE Start : ", html5QrCode)

  }

  useEffect(() => {
    setHtml5QrCode(new Html5Qrcode('scanner', {
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true,
      },
    }));
  }, []);

  return (
    <>
      <div className='flex items-center w-full justify-center h-1/5'>

        {
          !scannerState ?
            (
              !useSelector((state) => state.temp.isBatchRecord) ?
                <button
                  className='rounded-lg bg-purple-700 py-2 px-2 text-white hover:bg-purple-200 hover:text-purple-800'
                  onClick={() => startScanning()}
                >
                  Start Batch Scan
                </button> :
                <button
                  className={`rounded-lg bg-purple-800 py-2 px-2 text-white hover:bg-purple-200 hover:text-purple-800 ${buttonVisibility}`}
                  onClick={() => startScanning()}
                >
                  Start COI Scan
                </button>
            ) : (
              !useSelector((state) => state.temp.isBatchRecord) ?
                <button
                  className='rounded-lg bg-purple-700 py-2 px-2 text-white hover:bg-purple-200 hover:text-purple-800'
                  onClick={() => stopScanning()}
                >
                  Stop Batch Scan
                </button> :
                <button
                  className='rounded-lg bg-purple-700 py-2 px-2 text-white hover:bg-purple-200 hover:text-purple-800'
                  onClick={() => stopScanning()}
                >
                  Stop COI Scan
                </button>
            )
        }
      </div>
    </>
  )
}
export default QRScanner
