use std::fs;

use printpdf::*;

use super::context::PdfContext;

impl PdfContext {

    pub fn image(
        &mut self,
        path: &str,
        x: f32,
        y: f32,
        width: f32,
        height: f32,
    ) -> Result<(), String> {

        let bytes = fs::read(path)
            .map_err(|e| e.to_string())?;

        let image = RawImage::decode_from_bytes(
            &bytes,
            &mut Vec::new(),
        )
        .map_err(|e| e.to_string())?;


        let image_id = self.doc.add_image(&image);


        // DPI utilisé pour l'image originale
        let dpi = 300.0;


        // Taille réelle de l'image en mm
        let image_width_mm =
            image.width as f32 / dpi * 25.4;

        let image_height_mm =
            image.height as f32 / dpi * 25.4;


        // facteur d'échelle demandé
        let scale_x =
            width / image_width_mm;

        let scale_y =
            height / image_height_mm;


        self.ops.push(
            Op::UseXobject {
                id: image_id,

                transform: XObjectTransform {

                    translate_x: Some(Mm(x).into()),
                    translate_y: Some(Mm(y).into()),

                    rotate: None,

                    scale_x: Some(scale_x),
                    scale_y: Some(scale_y),

                    dpi: Some(dpi),
                },
            }
        );


        Ok(())
    }
}