// pages/api/compress.js
import sharp from "sharp";
import { IncomingForm } from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req, res) => {
  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      res.status(500).end("Internal Server Errosr");
      return;
    }
    console.log(files.file);
    console.log("rest");

    const inputFile = files.file && files.file[0];
    console.log(inputFile);

    try {
      const compressedImage = await sharp(inputFile)
        .toFormat("jpeg") // Convert to JPEG format
        .toBuffer(); // Convert to buffer

      // Set appropriate headers for the response
      res.setHeader("Content-Type", "image/jpeg");
      res.setHeader(
        "Content-Disposition",
        "inline; filename=compressed_image.jpg"
      );

      // Send the compressed image buffer in the response
      res.status(200).send(compressedImage);
    } catch (error) {
      console.error(error);
      res.status(500).end("Internal Server Error");
    }
  });
};
