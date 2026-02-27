/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2025)
//          Last Update: Q4 2025
// ________________________________________________________________________________________________
// Authors: Shotaro Okamoto [2025]
// ________________________________________________________________________________________________
// Description: This is a 'Form Field' React Component (used in data editing/displaying forms)
//              of the 'Dropzone' type
// ------------------------------------------------------------------------------------------------
// Notes: 'Form Fields' are component used inside all forms for editing and viewing connected data.
//        'Dropzone' is of classic type, look and feel. (Multiple is allowed )
// ------------------------------------------------------------------------------------------------
// References: React, react-dropzone
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import React, { useState,useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// The FormField Component
//-------------------------------------------------------------------------------------------------

const DropzoneField = ({ input, meta }) => {
  const [fileData, setFileData] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();

    function arrayBufferToBase64(arrayBuffer) {
      let binary = '';
      const bytes = new Uint8Array(arrayBuffer);
      const length = bytes.byteLength;
      for (let i = 0; i < length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return window.btoa(binary);
    }

    reader.onloadend = () => {
      const base64Buffer = arrayBufferToBase64(reader.result);
      const newFileData = {
        buffer: base64Buffer,
        name: file.name,
        size: file.size,
      };

      input.onChange(newFileData);
      setFileData(newFileData);
    };

    reader.readAsArrayBuffer(file);
  }, [input]);

  const removeFile = () => {
    setFileData(null);
    input.onChange(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      style={{
        border: '2px dashed #ccc',
        padding: '20px',
        borderRadius: '10px',
        background: isDragActive ? '#e0f7fa' : '#fafafa',
        textAlign: 'center',
        cursor: 'pointer',
        marginTop: '10px',
        minHeight: '160px',
        position: 'relative',
      }}
    >
      <input {...getInputProps()} />

      {!fileData ? (
        <p style={{
          position:'absolute',
          top:'50%',
          left:'50%',
          transform:'translate(-50%,-50%)',
        }}>{isDragActive ? 'Drop your file here' : 'Drop or select your file'}</p>
      ) : (
        <div
          style={{
            position: 'relative',
            width: '150px',
            margin: '0 auto',
            padding: '15px',
            border: '1px solid #ccc',
            borderRadius: '10px',
            backgroundColor: '#fff',
            textAlign: 'center',
          }}
        >
          {/* × button */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // prevent triggering file picker
              removeFile();
            }}
            style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              background: 'transparent',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
              color: '#999',
            }}
          >
            &times;
          </button>

          {/* image */}
          <img
            src="https://www.iconsdb.com/icons/preview/black/file-xxl.png"
            alt="File icon"
            style={{ width: '48px', height: '48px', marginBottom: '10px' }}
          />

          {/* file name */}
          <div style={{ fontSize: '14px', wordBreak: 'break-all' }}>{fileData.name}</div>
        </div>
      )}
    </div>
  );
};
//-------------------------------------------------------------------------------------------------

export default DropzoneField;
