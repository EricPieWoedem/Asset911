import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import DropzoneComponent from '@/components/ImageDropZone';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';

const ImageToPDF = () => {
  const [selectedImages, setSelectedImages] = useState([]);

  const convertToPdf = () => {
    const doc = new jsPDF();
    selectedImages.forEach(image => {
      const img = new Image();
      img.src = URL.createObjectURL(image);

      doc.addImage(img, 'JPEG', 0, 0);
      doc.addPage();
    });
    doc.save('proof-of-owenership.pdf');
    setSelectedImages([]);
  };

  return (
    <Dialog>
      <DialogTrigger className='text-xs text-blue-500 hover:underline'>
        Don&apos;t have a PDF, click here?
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload images here to convert to pdf</DialogTitle>
        </DialogHeader>
        <DropzoneComponent
          selectedImages={selectedImages}
          setSelectedImages={setSelectedImages}
        />
        <Button onClick={() => convertToPdf()}>Convert to PDF</Button>
      </DialogContent>
    </Dialog>
  );
};

export default ImageToPDF;
