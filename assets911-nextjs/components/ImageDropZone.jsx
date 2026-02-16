import React, { useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useDropzone } from 'react-dropzone';

const DropzoneComponent = ({ selectedImages, setSelectedImages }) => {
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    acceptedFiles.forEach(file => {
      setSelectedImages(prevState => [...prevState, file]);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  return (
    <Card {...getRootProps()}>
      <CardContent className='flex items-center justify-center py-5 h-44'>
        <input {...getInputProps()} />
        {selectedImages.length === 0 ? (
          <div className='text-gray-400'>
            {isDragActive ? (
              <p>Drop image(s) here ...</p>
            ) : (
              <p>Drag and drop image(s) here, or click to select image</p>
            )}
          </div>
        ) : (
          <div className='flex flex-row flex-wrap justify-start w-full h-full gap-5 overflow-scroll '>
            {selectedImages.length > 0 &&
              selectedImages.map((image, index) => (
                <img
                  src={`${URL.createObjectURL(image)}`}
                  key={index}
                  alt=''
                  className='rounded-lg w-28 h-28'
                />
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DropzoneComponent;
